/**
 * The server behind costinsarghiuta.com/finance/.
 *
 * A read-only web app attached to the finance sheet. The page asks it for numbers, so the
 * sheet's own address never reaches a visitor's browser. It answers with only what the page
 * shows, and never reads the Config tab.
 *
 *   ?action=state           the decision, the three scores, every signal, the ETF list, the log
 *   ?action=ticker&t=VOO    a year of prices and the momentum of any ticker (from Yahoo Finance)
 *
 * Install: in the sheet, Extensions > Apps Script, add this as a new file, then
 * Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * After changing this file: Deploy > Manage deployments > Edit > Version: New version,
 * so the address stays the same.
 */

const FD_MODEL_TAB = 'Strategia AS Auto Test 1';
const FD_STATE_SECONDS = 300;      // the page sees sheet changes within five minutes
const FD_TICKER_SECONDS = 21600;   // a looked-up ticker is kept for six hours

const FD_OUTPUT_KEYS = [
  'decision_source', 'decision_score', 'stance', 'pick', 'pick_momentum',
  'best_offensive', 'best_offensive_momentum', 'best_defensive', 'best_defensive_momentum',
  'as_of', 'next_rebalance', 'data_check', 'missing_momentum_count', 'missing_momentum_tickers', 'scores_ok'
];

const FD_LOG_COLUMNS = [
  'date', 'month', 'decision_source', 'decision_score', 'stance', 'pick', 'pick_momentum',
  'best_offensive', 'best_offensive_momentum', 'best_defensive', 'best_defensive_momentum',
  'fred', 'etf', 'clasic', 'base_etf', 'base_momentum', 'data_check', 'missing_momentum_tickers', 'logged_at_utc'
];

// Where each signal sits on the model tab: the column its label is in, then the columns of its
// live value, weight and vote. Rows are found by label, so moving a block up or down is fine.
const FD_SIGNALS = {
  macro: { label: 'A', live: 'C', weight: 'D', vote: 'E', rows: [
    'Dobanda (Rates)', 'Inflatie', 'Piata Muncii', 'GDP (Economie)', 'Incertitudine',
    'Lichiditate (Fed)', 'Geopolitica', 'Optimism Social', 'Crize Sanitare'] },
  tech: { label: 'A', live: 'C', weight: 'D', vote: 'E', rows: [
    'Trend D1 (200 MA)', 'MA (30) D1', 'RSI Proxy (14 Day)', 'MACD Proxy'] },
  sent: { label: 'A', live: 'C', weight: 'B', vote: 'D', rows: ['VIX (Frica)', 'Curba Obligatiuni'] },
  fund: { label: 'B', live: null, weight: 'C', vote: 'D', after: 'Analiza fundamentala', rows: [
    'Dobanda de referinta', 'Inflatie', 'Piata muncii', 'Produs Intern Brut', 'Alegeri (Stabilitate VIX)',
    'Politica fiscala (Yield Curve)', 'Evenimente geopolitice (Aur)', 'Proteste de amploare', 'Crize sanitare'] },
  health: { label: 'H', live: 'J', weight: 'K', vote: 'L', rows: ['Dr. Copper', 'Market Breadth', 'Tech Pulse', 'USD Index'] },
  risk: { label: 'H', live: 'J', weight: 'K', vote: 'L', rows: ['Supra-extindere', 'Sezonalitate'] }
};

// The group totals, as the sheet calculates them (the cells the review named)
const FD_TOTALS = { macro: 'F14', tech: 'F20', sent: 'E24', health: 'M25', risk: 'M30', fund: 'E37' };

function doGet(e) {
  const p = (e && e.parameter) || {};
  let body;
  try {
    body = p.action === 'ticker' ? fdTicker_(p.t) : fdState_();
  } catch (err) {
    console.error(err);
    body = { ok: false, error: 'server_error' };
  }
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function fdState_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('fd_state_v1');
  if (hit) return JSON.parse(hit);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();
  const plain = v => fdPlain_(v, tz);

  // Output: the base ETF on row 2, then key / value pairs
  const out = ss.getSheetByName('Output').getDataRange().getValues();
  const output = {};
  out.forEach(r => {
    const k = String(r[0]).trim();
    if (FD_OUTPUT_KEYS.indexOf(k) >= 0) output[k] = plain(r[1]);
  });
  const baseRow = out[1] || [];
  const base = {
    ticker: plain(baseRow[1]),
    prices: [2, 3, 4, 5, 6].map(i => plain(baseRow[i])),
    momentum: plain(baseRow[7])
  };

  // The three headline scores
  const head = ss.getSheetByName('Sheet6').getRange('A1:A3').getValues();
  const scores = { fred: plain(head[0][0]), etf: plain(head[1][0]), clasic: plain(head[2][0]) };

  // Every signal, its group total, and the ETF list
  const model = ss.getSheetByName(FD_MODEL_TAB);
  const grid = model.getRange(1, 1, Math.min(model.getLastRow(), 120), 16).getValues();
  const col = letter => letter.charCodeAt(0) - 65;
  const signals = {};
  let modelOk = true;
  Object.keys(FD_SIGNALS).forEach(id => {
    const spec = FD_SIGNALS[id];
    let start = 0;
    if (spec.after) start = grid.findIndex(r => String(r[0]).trim() === spec.after) + 1;
    signals[id] = spec.rows.map(label => {
      const i = grid.findIndex((r, n) => n >= start && String(r[col(spec.label)]).trim() === label);
      if (i < 0) { modelOk = false; return { label: label, found: false }; }
      const r = grid[i];
      return {
        label: label, found: true,
        live: spec.live ? plain(r[col(spec.live)]) : null,
        weight: plain(r[col(spec.weight)]),
        vote: plain(r[col(spec.vote)])
      };
    });
  });
  const totals = {};
  Object.keys(FD_TOTALS).forEach(id => { totals[id] = plain(model.getRange(FD_TOTALS[id]).getValue()); });

  const etfs = [];
  let side = null;
  for (let i = 1; i < Math.min(grid.length, 19); i++) {
    const r = grid[i];
    const head = String(r[col('H')]).trim();
    if (head === 'ACTIV OFENSIV') { side = 'offensive'; continue; }
    if (head === 'ACTIV DEFENSIV') { side = 'defensive'; continue; }
    const ticker = String(r[col('I')]).trim();
    if (!side || !ticker) continue;
    etfs.push({
      side: side, category: head, ticker: ticker,
      prices: ['J', 'K', 'L', 'M', 'N'].map(c => plain(r[col(c)])),
      momentum: plain(r[col('O')])
    });
  }

  // The track record, newest last
  const logSheet = ss.getSheetByName('Log');
  const log = [];
  if (logSheet && logSheet.getLastRow() > 1) {
    const rows = logSheet.getDataRange().getValues();
    const names = rows[0].map(h => String(h).trim());
    rows.slice(1).slice(-36).forEach(r => {
      const entry = {};
      FD_LOG_COLUMNS.forEach(name => {
        const i = names.indexOf(name);
        if (i >= 0) entry[name] = name === 'logged_at_utc' ? fdIso_(r[i]) : plain(r[i]);
      });
      if (entry.month || entry.date) log.push(entry);
    });
  }

  const body = {
    ok: true, generated_at: new Date().toISOString(),
    output: output, base: base, scores: scores,
    model: { ok: modelOk, signals: signals, totals: totals },
    etfs: etfs, log: log
  };
  cache.put('fd_state_v1', JSON.stringify(body), FD_STATE_SECONDS);
  return body;
}

// Numbers stay numbers, dates become yyyy-MM-dd, everything else is trimmed text.
// A sheet error such as #N/A stays text, so the page can show that it is missing.
function fdPlain_(v, tz) {
  if (v instanceof Date) return Utilities.formatDate(v, tz, 'yyyy-MM-dd');
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function fdIso_(v) {
  if (v instanceof Date) return v.toISOString().replace(/\.\d{3}Z$/, 'Z');
  return v == null || v === '' ? null : String(v).trim();
}

// ---------------------------------------------------------------------------------------
// A ticker a visitor typed. Momentum is worked out the way the sheet does it: the average of
// the 1, 3, 6 and 12 month returns, each from the last close on or before that date.

const FD_PREFIX = { 'LON': '.L', 'ETR': '.DE', 'FRA': '.F', 'AMS': '.AS', 'EPA': '.PA', 'BIT': '.MI', 'SWX': '.SW',
  'NASDAQ': '', 'NYSE': '', 'NYSEARCA': '', 'BATS': '', 'NYSEAMERICAN': '' };

function fdTicker_(raw) {
  const query = String(raw || '').trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9.:\-^=]{0,19}$/.test(query)) return { ok: false, error: 'bad_ticker' };

  const cache = CacheService.getScriptCache();
  const key = 'fd_t_' + query;
  const hit = cache.get(key);
  if (hit) return JSON.parse(hit);

  let symbol = query;
  const m = query.match(/^([A-Z]+):(.+)$/);
  if (m && FD_PREFIX.hasOwnProperty(m[1])) symbol = m[2] + FD_PREFIX[m[1]];

  let chart = fdChart_(symbol);
  if (!chart) {
    const found = fdSearch_(m ? m[2] : query);
    if (found) chart = fdChart_(found);
  }
  const body = chart ? Object.assign({ ok: true, query: query }, chart) : { ok: false, error: 'not_found', query: query };
  cache.put(key, JSON.stringify(body), body.ok ? FD_TICKER_SECONDS : 900);
  return body;
}

function fdFetch_(url) {
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (res.getResponseCode() !== 200) return null;
  try { return JSON.parse(res.getContentText()); } catch (e) { return null; }
}

function fdSearch_(q) {
  const data = fdFetch_('https://query2.finance.yahoo.com/v1/finance/search?quotesCount=6&newsCount=0&q=' + encodeURIComponent(q));
  const quotes = (data && data.quotes) || [];
  const good = quotes.filter(x => ['ETF', 'EQUITY', 'MUTUALFUND'].indexOf(x.quoteType) >= 0);
  return good.length ? good[0].symbol : null;
}

function fdChart_(symbol) {
  const data = fdFetch_('https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?range=13mo&interval=1d');
  const r = data && data.chart && data.chart.result && data.chart.result[0];
  if (!r || !r.timestamp || !r.indicators || !r.indicators.quote) return null;
  const ts = r.timestamp, close = r.indicators.quote[0].close || [];
  const points = [];
  for (let i = 0; i < ts.length; i++) if (typeof close[i] === 'number') points.push([ts[i] * 1000, close[i]]);
  if (points.length < 200) return null;

  const last = points[points.length - 1];
  const onOrBefore = t => { let p = null; for (let i = 0; i < points.length && points[i][0] <= t; i++) p = points[i]; return p; };
  const back = n => { const d = new Date(last[0]); d.setMonth(d.getMonth() - n); return onOrBefore(d.getTime()); };
  const then = [1, 3, 6, 12].map(back);
  if (then.some(p => !p)) return null;
  const prices = [last[1]].concat(then.map(p => p[1])).map(v => Math.round(v * 100) / 100);
  const momentum = then.reduce((a, p) => a + (last[1] / p[1] - 1), 0) / 4;
  const meta = r.meta || {};
  return {
    symbol: meta.symbol || symbol,
    name: meta.longName || meta.shortName || null,
    currency: meta.currency || null,
    exchange: meta.fullExchangeName || meta.exchangeName || null,
    type: meta.instrumentType || null,
    prices: prices,
    momentum: Math.round(momentum * 10000) / 10000,
    as_of: new Date(last[0]).toISOString().slice(0, 10)
  };
}
