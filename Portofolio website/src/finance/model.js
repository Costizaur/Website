// The model behind the dashboard: plain-English words for every signal in the sheet, and the
// same arithmetic the sheet does, so a visitor can flip a vote and see the decision move.
// The sheet's labels are Romanian; each signal here is keyed by its label there.

const ICON = {
    macro: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9s1.3-6.4 3.8-9z',
    fund: 'M3 9l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
    tech: 'M3 17l5-5 4 3 7-8M15 7h4v4',
    sent: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    health: 'M3 12h4l2-5 4 10 2-5h6',
    risk: 'M12 3l9 16H3L12 3zM12 10v4M12 17v.5',
    mom: 'M4 17a8 8 0 1 1 16 0M12 17l4-5'
};

const num = (v, d = 2) => (isNum(v) ? v.toFixed(d) : '—');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// [name, the question it answers, how to show its live value]
const S = (name, rule, live) => ({ name, rule, live });
const proxy = (ticker, d = 2) => v => `${ticker} ${num(v, d)}`;

// inF and inE: the group's weight in the FRED and ETF scores. inC: whether Clasic averages it.
export const GROUPS = [
    { id: 'macro', short: 'Macro & politics', name: 'Macro, politics, society', inF: 0, inE: 0.20, inC: false, icon: ICON.macro, signals: {
        'Dobanda (Rates)': S('Interest rates', 'Are bonds (IEF) up on 3 and 6 months?', proxy('IEF')),
        'Inflatie': S('Inflation', 'Are commodities (DBC) down on 3 and 6 months?', proxy('DBC')),
        'Piata Muncii': S('Jobs', 'Is consumer spending (XLY) up on 3 and 6 months?', proxy('XLY')),
        'GDP (Economie)': S('Economy', 'Are small companies (IWM) up on 3 months and 1 year?', proxy('IWM')),
        'Incertitudine': S('Uncertainty', 'Is the fear index (VIX) down on 3 months and under 20?', proxy('VIX')),
        'Lichiditate (Fed)': S('Easy money', 'Are risky bonds (HYG) up on 3 and 6 months?', proxy('HYG')),
        'Geopolitica': S('Geopolitics', 'Is gold (GLD) calm, with no sudden jump?', proxy('GLD')),
        'Optimism Social': S('Mood', 'Do people spend more on extras than on basics? (XLY/XLP)', proxy('XLY/XLP', 3)),
        'Crize Sanitare': S('Health scares', 'Is the market beating healthcare stocks? (SPY/XLV)', proxy('SPY/XLV', 3))
    } },
    { id: 'fund', short: 'Fundamentals', name: 'Fundamentals', inF: 0.35, inE: 0, inC: true, icon: ICON.fund, signals: {
        'Dobanda de referinta': S('Interest rate', 'Economic data from FRED', () => 'FRED'),
        'Inflatie': S('Inflation', 'Economic data from FRED', () => 'FRED'),
        'Piata muncii': S('Jobs', 'Economic data from FRED', () => 'FRED'),
        'Produs Intern Brut': S('GDP', 'Economic data from FRED', () => 'FRED'),
        'Alegeri (Stabilitate VIX)': S('Elections', 'Read from how calm the VIX is', () => 'VIX'),
        'Politica fiscala (Yield Curve)': S('Government spending', 'Read from the yield curve', () => 'Yield curve'),
        'Evenimente geopolitice (Aur)': S('World events', 'Read from gold', () => 'Gold'),
        'Proteste de amploare': S('Protests', 'Large protests', () => '—'),
        'Crize sanitare': S('Health crises', 'Health crises', () => '—')
    } },
    { id: 'tech', short: 'Price trend', name: 'Price trend', inF: 0.15, inE: 0.30, inC: true, icon: ICON.tech, signals: {
        'Trend D1 (200 MA)': S('Long trend', 'Is the price above its 200-day average?', v => `avg ${num(v)}`),
        'MA (30) D1': S('Short trend', 'Is the price above its 30-day average?', v => `avg ${num(v)}`),
        'RSI Proxy (14 Day)': S('Overheated?', 'RSI under 40 means cheap, and counts as good', v => `RSI ${num(v)}`),
        'MACD Proxy': S('Speed', 'Is momentum (MACD) above zero?', v => `MACD ${num(v)}`)
    } },
    { id: 'sent', short: 'Mood', name: 'Market mood', inF: 0, inE: 0.15, inC: false, icon: ICON.sent, signals: {
        'VIX (Frica)': S('Fear', 'Is the fear index (VIX) calm?', proxy('VIX')),
        'Curba Obligatiuni': S('Bond curve', 'Does the yield curve look healthy?', v => `Curve ${num(v)}`)
    } },
    { id: 'health', short: 'Market health', name: 'Market health', inF: 0.25, inE: 0.15, inC: true, icon: ICON.health, signals: {
        'Dr. Copper': S('Copper', 'Is industry strong? (COPX)', proxy('COPX')),
        'Market Breadth': S('Breadth', 'Is the whole market rising, not just a few? (RSP)', proxy('RSP')),
        'Tech Pulse': S('Chips', 'Are chip makers on a run? (SMH)', proxy('SMH')),
        'USD Index': S('Dollar', 'Is the dollar falling? (UUP)', proxy('UUP'))
    } },
    { id: 'risk', short: 'Risk', name: 'Risk', inF: 0.15, inE: 0.10, inC: true, icon: ICON.risk, signals: {
        'Supra-extindere': S('Stretched?', 'Is the price far above its 200-day average?', v => (isNum(v) ? `gap ${(v * 100).toFixed(1)}%` : '—')),
        'Sezonalitate': S('Season', 'Is it a good month? November to April', v => (isNum(v) && v >= 1 && v <= 12 ? MONTHS[v - 1] : '—'))
    } },
    { id: 'mom', short: 'Momentum', name: 'Momentum vote', inF: 0.10, inE: 0.10, inC: true, icon: ICON.mom, signals: {
        // Not a row in the sheet: it is worked out from VOO's momentum, the way the sheet does it
        'VOO momentum': S('US stocks moving?', 'Is VOO up more than 5% on average? Above 5% votes growth, 0 to 5% stays neutral, below 0 votes safety.', v => (isNum(v) ? `VOO ${pct(v)}` : '—'))
    } }
];

export const GROUP_BY_ID = Object.fromEntries(GROUPS.map(g => [g.id, g]));

// The Romanian categories next to the tickers, in English
const CATEGORY = {
    'Actiuni SUA - S&P 500': 'US stocks, S&P 500',
    'Actiuni internationale - Piete dezvoltate ex SUA': 'Developed markets outside the US',
    'Actiuni piete emergente': 'Emerging markets',
    'Actiuni Global': 'Global stocks',
    'Actiuni sector hot - Energie': 'Hot sector, energy',
    'Oblig. Guvern': 'Government bonds',
    'Titluri de stat 0-1 an': 'Treasuries, 0 to 1 year',
    'Oblig. Corp. (EUR)': 'Corporate bonds, EUR',
    'Oblig. Corp. SUA (EUR hedged)': 'US corporate bonds, EUR hedged',
    'AUR': 'Gold',
    'Aur': 'Gold',
    'Cash / Inverse': 'Cash or inverse'
};
export const category = raw => CATEGORY[raw] || raw || '';

// A ticker as people say it: the sheet writes London listings as LON:EXUS
export const shortTicker = t => String(t || '').replace(/^[A-Z]+:/, '');

export function isNum(v) {
    return typeof v === 'number' && Number.isFinite(v);
}

export const sgn = v => (!isNum(v) ? '—' : v > 0.0001 ? '+' + v.toFixed(2) : v < -0.0001 ? '−' + Math.abs(v).toFixed(2) : '0.00');
export const pct = m => (!isNum(m) ? '—' : (m > 0 ? '+' : m < 0 ? '−' : '') + Math.abs(m * 100).toFixed(1) + '%');
// The bands the sheet and the old app use
export const band = v => (!isNum(v) ? 'no score' : v > 0.40 ? 'strong buy' : v > 0.10 ? 'buy / accumulate' : v > -0.20 ? 'hold' : 'sell');

export const momentumVote = m => (!isNum(m) ? null : m > 0.05 ? 1 : m >= 0 ? 0 : -1);

// A group's score: its votes times their weights, over the weights that count. A weight of 0%
// switches a signal off, as in the sheet.
export function groupTotal(signals) {
    const counted = signals.filter(s => isNum(s.weight) && s.weight > 0 && isNum(s.vote));
    const w = counted.reduce((a, s) => a + s.weight, 0);
    return w > 0 ? counted.reduce((a, s) => a + s.weight * s.vote, 0) / w : null;
}

// The three scores and the blend, from the group totals
export function scoresFrom(totals) {
    const all = GROUPS.every(g => isNum(totals[g.id]));
    if (!all) return { fred: null, etf: null, clasic: null, blend: null };
    const fred = GROUPS.reduce((a, g) => a + g.inF * totals[g.id], 0);
    const etf = GROUPS.reduce((a, g) => a + g.inE * totals[g.id], 0);
    const inC = GROUPS.filter(g => g.inC);
    const clasic = inC.reduce((a, g) => a + totals[g.id], 0) / inC.length;
    return { fred, etf, clasic, blend: 0.6 * fred + 0.4 * etf };
}

// How much of the decision each group carries, for the score the sheet decides with.
// With 'Momentum' the decision is not built from the groups, so there are no shares.
export function sharesFor(source) {
    const s = String(source || '').toLowerCase();
    const of = {
        blend: g => 0.6 * g.inF + 0.4 * g.inE,
        fred: g => g.inF,
        etf: g => g.inE,
        clasic: g => (g.inC ? 1 / GROUPS.filter(x => x.inC).length : 0)
    }[s];
    return of ? Object.fromEntries(GROUPS.map(g => [g.id, of(g)])) : null;
}

export function decisionFrom(source, scores) {
    const s = String(source || '').toLowerCase();
    if (s === 'fred') return scores.fred;
    if (s === 'etf') return scores.etf;
    if (s === 'clasic') return scores.clasic;
    if (s === 'blend') return scores.blend;
    return null;
}

// The whole state from the server, read into the shapes the page draws.
export function readState(raw) {
    const out = raw.output || {};
    const etfs = (raw.etfs || []).map(e => ({
        ticker: shortTicker(e.ticker), sheetTicker: e.ticker, side: e.side === 'defensive' ? 'safety' : 'growth',
        cat: category(e.category), prices: (e.prices || []).map(p => (isNum(p) ? p : null)),
        m: isNum(e.momentum) ? e.momentum : null
    }));
    const voo = etfs.find(e => e.ticker === 'VOO');
    const signals = {};
    GROUPS.forEach(g => {
        if (g.id === 'mom') {
            signals.mom = [{ label: 'VOO momentum', found: !!voo, live: voo ? voo.m : null, weight: 1, vote: voo ? momentumVote(voo.m) : null }];
            return;
        }
        signals[g.id] = ((raw.model && raw.model.signals && raw.model.signals[g.id]) || []).map(s => ({ ...s }));
    });
    const sheetTotals = { ...((raw.model && raw.model.totals) || {}) };
    sheetTotals.mom = signals.mom[0].vote;

    const problems = [];
    if (out.data_check !== 'OK') problems.push('The sheet’s own data check says ' + (out.data_check || 'nothing') + '.');
    if (out.scores_ok !== true) problems.push('Not every score in the sheet is a number.');
    if (!isNum(out.decision_score)) problems.push('The decision score is missing.');
    if (raw.model && raw.model.ok === false) problems.push('Some signals were not found in the sheet.');
    const missing = String(out.missing_momentum_tickers || '').split(/[,;\s]+/).filter(Boolean).map(shortTicker);

    return {
        source: out.decision_source || null,
        decisionScore: isNum(out.decision_score) ? out.decision_score : null,
        stance: out.stance === 'OFFENSIVE' || out.stance === 'DEFENSIVE' ? out.stance : null,
        pick: out.pick ? shortTicker(out.pick) : null,
        pickMomentum: isNum(out.pick_momentum) ? out.pick_momentum : null,
        bestOffensive: out.best_offensive ? shortTicker(out.best_offensive) : null,
        bestDefensive: out.best_defensive ? shortTicker(out.best_defensive) : null,
        asOf: out.as_of || null,
        nextRebalance: out.next_rebalance || null,
        ok: problems.length === 0 && missing.length === 0,
        problems, missing,
        scores: { fred: raw.scores && raw.scores.fred, etf: raw.scores && raw.scores.etf, clasic: raw.scores && raw.scores.clasic },
        base: raw.base && raw.base.ticker ? {
            ticker: shortTicker(raw.base.ticker), prices: (raw.base.prices || []).map(p => (isNum(p) ? p : null)),
            m: isNum(raw.base.momentum) ? raw.base.momentum : null
        } : null,
        signals, sheetTotals, etfs,
        log: (raw.log || []).filter(r => r && (r.month || r.date))
    };
}
