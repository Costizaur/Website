import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { loadState, lookupTicker } from './api';
import {
    GROUPS, GROUP_BY_ID, band, decisionFrom, groupTotal, isNum, pct, readState, scoresFrom, sgn, sharesFor, shortTicker
} from './model';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ymd = s => (s ? String(s).slice(0, 10).split('-').map(Number) : null);
const fmtDate = s => { const p = ymd(s); return p && p[2] ? `${p[2]} ${MON[p[1] - 1]} ${p[0]}` : '—'; };
const PORTFOLIO = '/#web/live-finance-dashboard';
const CHIPS = ['VWCE', 'VOO', 'EIMI', 'EXUS', 'IB01', 'IAU'];

// A small inline icon, drawn with the text colour
const Icon = ({ d, size = 20, stroke = 1.9 }) => (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d={d} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function FinanceApp() {
    const [raw, setRaw] = useState(null);
    const [failed, setFailed] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const ctl = new AbortController();
        loadState(ctl.signal).then(setRaw).catch(err => { if (err.name !== 'AbortError') setFailed(true); });
        return () => ctl.abort();
    }, [attempt]);

    return (
        <div className="fd">
            <div className="fd-wrap">
                <header className="fd-top">
                    <a className="fd-back" href={PORTFOLIO}>
                        <span className="fd-back-dot" aria-hidden="true"><Icon d="M15 6l-6 6 6 6" size={18} stroke={2.4} /></span>
                        <span>Web <span className="fd-dim">/</span> Live Finance Dashboard</span>
                    </a>
                    {raw && <Status raw={raw} />}
                </header>
                <div className="fd-intro">
                    <h1>Go for growth or play it safe this month?</h1>
                    <p>Thirty market signals, weighed for you. Three steps, no finance knowledge needed.</p>
                </div>
                {raw ? <Dashboard raw={raw} /> : failed ? (
                    <div className="fd-sheet fd-msg" role="alert">
                        <h2>The numbers did not load</h2>
                        <p>The connection to the model failed. It usually works on a second try.</p>
                        <button type="button" className="fd-btn" onClick={() => { setFailed(false); setAttempt(a => a + 1); }}>Try again</button>
                    </div>
                ) : (
                    <Waiting />
                )}
                <footer className="fd-foot">
                    <span>A personal model by Costin Sarghiuta, built in Google Sheets. Not financial advice.</span>
                    <span>Rule: on the last day of each month, everything goes into one ETF.</span>
                </footer>
            </div>
        </div>
    );
}

// The server usually answers in a few seconds; if it is slow, say so rather than look stuck
function Waiting() {
    const [slow, setSlow] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setSlow(true), 6000);
        return () => clearTimeout(t);
    }, []);
    return (
        <div className="fd-sheet fd-msg" role="status">
            <p>Reading the latest numbers from the model…</p>
            {slow && <p>The model is taking longer than usual. It can need up to a minute when it has just been updated.</p>}
        </div>
    );
}

function Status({ raw }) {
    const d = readState(raw);
    return (
        <div className="fd-status">
            {raw.sample && <span className="fd-pill is-sample">Saved sample, not live</span>}
            <span className={`fd-pill ${d.ok ? 'is-ok' : 'is-bad'}`}><span className="fd-dot" aria-hidden="true" />Data check: {d.ok ? 'OK' : 'incomplete'}</span>
            <span>Updated {fmtDate(d.asOf)}</span>
        </div>
    );
}

function Dashboard({ raw }) {
    const d = useMemo(() => readState(raw), [raw]);
    const [votes, setVotes] = useState({});
    const [group, setGroup] = useState('fund');

    // The signals as they stand, with any votes the visitor changed
    const now = useMemo(() => Object.fromEntries(GROUPS.map(g => [g.id, d.signals[g.id].map((s, i) => {
        const k = `${g.id}:${i}`;
        return k in votes ? { ...s, vote: votes[k] } : s;
    })])), [d, votes]);
    const changed = Object.entries(votes).filter(([k, v]) => {
        const [g, i] = k.split(':');
        return d.signals[g][+i] && d.signals[g][+i].vote !== v;
    }).length;
    const edited = changed > 0;
    const shares = sharesFor(d.source);
    const canFlip = !!shares && GROUPS.every(g => d.signals[g.id].every(s => s.found !== false));

    const totals = Object.fromEntries(GROUPS.map(g => {
        const computed = g.id === 'mom' ? now.mom[0].vote : groupTotal(now[g.id]);
        return [g.id, edited || !isNum(d.sheetTotals[g.id]) ? computed : d.sheetTotals[g.id]];
    }));
    const recomputed = scoresFrom(totals);
    const scores = edited ? recomputed : d.scores;
    const score = edited ? decisionFrom(d.source, recomputed) : d.decisionScore;
    const known = isNum(score);
    const growth = edited ? score > 0 : d.stance ? d.stance === 'OFFENSIVE' : score > 0;

    const ranked = side => d.etfs.filter(e => e.side === side).sort((a, b) => (isNum(b.m) ? b.m : -9) - (isNum(a.m) ? a.m : -9));
    const bestGrowth = ranked('growth')[0];
    const bestSafe = ranked('safety')[0];
    const pickTicker = edited ? (growth ? bestGrowth : bestSafe)?.ticker : d.pick;
    const pick = d.etfs.find(e => e.ticker === pickTicker) || null;

    const setVote = (gid, i, v) => setVotes(old => ({ ...old, [`${gid}:${i}`]: v }));
    const decisionLine = known && pick ? `The decision is ${pick.ticker}: score ${sgn(score)}, ${growth ? 'go for growth' : 'play it safe'}.` : 'There is no decision while data is missing.';

    return (
        <>
            {!d.ok && (
                <div className="fd-alert" role="status">
                    <Icon d="M12 3l9 16H3L12 3zM12 10v4M12 17v.5" size={24} stroke={2} />
                    <div>
                        <strong>Some data is missing</strong>
                        <p>
                            {d.missing.length > 0 && `${d.missing.length === 1 ? 'One fund has' : `${d.missing.length} funds have`} no momentum score yet: ${d.missing.join(', ')}. They are left out of the ranking. `}
                            {d.problems.join(' ')} Check the pick before acting on it.
                        </p>
                    </div>
                </div>
            )}
            <nav className="fd-steps" aria-label="Steps">
                <a href="#read"><b>1</b>Read the market</a>
                <a href="#check"><b>2</b>Check an ETF</a>
                <a href="#decide"><b>3</b>Decide</a>
                <a href="#record" className="is-ghost">Track record</a>
            </nav>
            <p className="visually-hidden" aria-live="polite">{decisionLine}</p>

            <section id="read" className="fd-sheet">
                <div className="fd-head">
                    <h2><span className="fd-dim">1 / </span>Which way is the market leaning?</h2>
                    <p>Seven groups of signals sit where their score lands. A bigger weight counts more. Tap one to look inside.</p>
                </div>
                <Scale totals={totals} shares={shares} score={score} group={group} onPick={setGroup} />
                <div className="fd-lean">
                    <div className="fd-lean-text">
                        <div className="fd-lean-title"><span className={`fd-swatch ${growth ? 'is-grow' : 'is-safe'}`} aria-hidden="true" />{known ? leanText(score) : 'No reading while data is missing'}</div>
                        <p>
                            {shares
                                ? <>The scale tips by exactly the decision score: <strong>{sgn(score)}</strong> ({band(score)}). {sourceLine(d.source)}</>
                                : <>The decision score is <strong>{sgn(score)}</strong>, set by {d.source || 'the sheet'}. {sourceLine(d.source)}</>}
                        </p>
                    </div>
                    <div className="fd-scores">
                        <ScoreChip name="FRED" v={scores.fred} decides={/^fred$/i.test(d.source)} />
                        <ScoreChip name="ETF" v={scores.etf} decides={/^etf$/i.test(d.source)} />
                        <ScoreChip name="Clasic" v={scores.clasic} decides={/^clasic$/i.test(d.source)} />
                        <ScoreChip name="Blend" v={edited ? recomputed.blend : (/^blend$/i.test(d.source) ? d.decisionScore : 0.6 * scores.fred + 0.4 * scores.etf)} decides={/^blend$/i.test(d.source)} />
                    </div>
                </div>
                <Inside
                    gid={group} signals={now[group]} live={d.signals[group]} total={totals[group]} share={shares && shares[group]}
                    canFlip={canFlip} onVote={(i, v) => setVote(group, i, v)} onReset={() => setVotes({})} edited={edited}
                />
            </section>

            <Check d={d} growth={growth} bestSafe={bestSafe} />

            <section id="decide" className="fd-night">
                <div className="fd-decide">
                    <h2><span className="fd-dim">3 / </span>The decision for {monthName(d.nextRebalance || d.asOf)}</h2>
                    {known && pick ? (
                        <>
                            <div className="fd-call">Put it all in <span className={growth ? 'is-grow' : 'is-safe'}>{pick.ticker}</span></div>
                            <p className="fd-why">
                                The decision score is {sgn(score)}, {growth ? 'above' : 'below'} zero, so the money goes to the {growth ? 'growth' : 'safe'} ETF with
                                the strongest momentum: {pick.ticker}, {pct(edited ? pick.m : (d.pickMomentum ?? pick.m))} on average.
                            </p>
                            <p className="fd-then">
                                {growth
                                    ? bestSafe && `What would change it: if the score drops below zero, everything moves to ${bestSafe.ticker} (${bestSafe.cat.toLowerCase()}).`
                                    : bestGrowth && `What would change it: if the score climbs above zero, everything moves to ${bestGrowth.ticker} (${bestGrowth.cat.toLowerCase()}).`}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="fd-call">No pick yet</div>
                            <p className="fd-why">The sheet is missing a number the decision needs. The pick shows up again once the data is complete.</p>
                        </>
                    )}
                    {!d.ok && known && <p className="fd-note is-bad">Data check: incomplete. {d.missing.length ? `No momentum yet for ${d.missing.join(', ')}.` : 'See the note at the top.'}</p>}
                    {edited && <p className="fd-note">You changed {changed === 1 ? '1 vote' : `${changed} votes`} on the scale, so this follows your version, not the live data.</p>}
                </div>
                <Calendar asOf={d.asOf} next={d.nextRebalance} growth={growth} />
            </section>

            <Record log={d.log} asOf={d.asOf} next={d.nextRebalance} />
        </>
    );
}

const leanText = s => (s > 0.40 ? 'Leaning hard toward growth' : s > 0.10 ? 'Leaning toward growth' : s > 0 ? 'Only just leaning toward growth'
    : s > -0.20 ? 'Leaning toward safety' : 'Leaning hard toward safety');

const sourceLine = source => ({
    blend: 'That is 60% FRED + 40% ETF, the score the sheet decides with.',
    fred: 'The sheet decides with the FRED score.',
    etf: 'The sheet decides with the ETF score.',
    clasic: 'The sheet decides with the Clasic score.',
    momentum: 'This month the sheet decides by momentum alone, so the votes do not move it.'
}[String(source || '').toLowerCase()] || '');

const monthName = s => { const p = ymd(s); return p ? MONTH[p[1] - 1] : 'this month'; };

function ScoreChip({ name, v, decides }) {
    const tone = decides ? (isNum(v) && v > 0 ? 'is-grow' : 'is-safe') : '';
    return (
        <div className={`fd-chip ${decides ? 'is-decides' : ''} ${tone}`}>
            <span className="fd-chip-name">{name}</span>
            <span className="fd-chip-val">{sgn(v)}</span>
            <span className="fd-chip-note">{decides ? 'decides' : band(v)}</span>
        </div>
    );
}

// The see-saw. Each group is a weight sitting where its score lands, sized by its share of the
// decision, so the beam's tilt is the decision score itself.
function Scale({ totals, shares, score, group, onPick }) {
    const stage = useRef(null);
    const [width, setWidth] = useState(1000);
    useLayoutEffect(() => {
        const el = stage.current;
        if (!el) return undefined;
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const compact = width < 600;
    // The beam's place in the stage, as in the CSS: 7% in from each side, 6% on phones
    const inset = width * (compact ? 0.06 : 0.07);
    const beam = width - 2 * inset;
    const fit = Math.min(1, beam / 860);
    const tall = compact ? 46 : 70;
    const gap = compact ? 2 : 6;

    const placed = [];
    const items = GROUPS.map(g => {
        const t = totals[g.id];
        const share = shares ? shares[g.id] : 1 / GROUPS.length;
        const px = compact ? 44 : Math.max(88, Math.round((64 + share * 360) * fit));
        // Where the score lands on the beam, kept far enough in that the weight stays on the stage
        const at = (isNum(t) ? (t + 1) / 2 : 0.5) * beam;
        const lo = px / 2 + 6 - inset, hi = beam + inset - px / 2 - 6;
        return { g, t, share, px, pos: Math.min(hi, Math.max(lo, at)) / beam * 100 };
    }).sort((a, b) => a.pos - b.pos);
    items.forEach(o => {
        let lvl = 0;
        while (placed.some(p => p.lvl === lvl && Math.abs(p.pos - o.pos) / 100 * beam < (p.px + o.px) / 2 + gap)) lvl += 1;
        o.lvl = lvl;
        placed.push(o);
    });
    const angle = isNum(score) ? Math.max(-14, Math.min(14, score * 18)) : 0;

    return (
        <div className="fd-stage" ref={stage}>
            <div className="fd-ground" aria-hidden="true" />
            <div className="fd-end is-safe"><span className="fd-end-dot" aria-hidden="true"><Icon d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" size={20} stroke={2} /></span><span><b>Play it safe</b><small>bonds, gold, cash</small></span></div>
            <div className="fd-end is-grow"><span><b>Go for growth</b><small>stocks</small></span><span className="fd-end-dot" aria-hidden="true"><Icon d="M4 18l6-6 4 4 6-8M15 8h5v5" size={20} stroke={2} /></span></div>
            <svg className="fd-pivot" aria-hidden="true" width="96" height="92" viewBox="0 0 96 92"><path d="M48 6 L90 92 H6 Z" fill="currentColor" /><circle cx="48" cy="8" r="8" fill="currentColor" /><circle cx="48" cy="8" r="3" className="fd-pivot-hole" /></svg>
            <div className="fd-beam" style={{ transform: `rotate(${angle.toFixed(2)}deg)` }}>
                <span className="fd-beam-mid" aria-hidden="true" />
                {items.map(o => {
                    const dir = !isNum(o.t) ? 'has no score' : o.t > 0.0001 ? 'pulls toward growth' : o.t < -0.0001 ? 'pulls toward safety' : 'sits in the middle';
                    const tone = !isNum(o.t) ? 'is-none' : o.t > 0.0001 ? 'is-grow' : o.t < -0.0001 ? 'is-safe' : 'is-mid';
                    return (
                        <button
                            key={o.g.id} type="button" className={`fd-weight ${tone}`} aria-pressed={o.g.id === group}
                            aria-label={`${o.g.name}, score ${sgn(o.t)}, ${Math.round(o.share * 100)}% of the decision, ${dir}. Show its signals.`}
                            onClick={() => onPick(o.g.id)}
                            style={{ translate: `${(o.pos / 100 * beam).toFixed(1)}px ${-(14 + o.lvl * (tall + gap + 2))}px`, width: `${o.px}px`, height: `${tall}px` }}
                        >
                            <span className="fd-weight-top"><Icon d={o.g.icon} />{!compact && <span className="fd-mono">{sgn(o.t)}</span>}</span>
                            {!compact && <span className="fd-weight-name">{o.g.short}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// One group, opened: a card per signal. Tapping a card changes its vote: safety, neutral, growth.
function Inside({ gid, signals, live, total, share, canFlip, onVote, onReset, edited }) {
    const g = GROUP_BY_ID[gid];
    const parts = [g.inF && `FRED ${Math.round(g.inF * 100)}%`, g.inE && `ETF ${Math.round(g.inE * 100)}%`, g.inC && 'Clasic 1 of 5'].filter(Boolean);
    const off = signals.filter(s => s.found !== false && isNum(s.weight) && s.weight === 0);
    const tone = !isNum(total) ? 'is-none' : total > 0.0001 ? 'is-grow' : total < -0.0001 ? 'is-safe' : 'is-mid';
    return (
        <div className="fd-inside">
            <div className="fd-inside-head">
                <div className="fd-inside-title">
                    <span className={`fd-badge ${tone}`} aria-hidden="true"><Icon d={g.icon} size={24} /></span>
                    <div>
                        <h3>Inside: {g.name} <span className="fd-mono">{sgn(total)}</span></h3>
                        <p>{isNum(share) ? `${Math.round(share * 100)}% of the decision · ` : ''}counts in {parts.join(', ')}</p>
                    </div>
                </div>
                <button type="button" className="fd-btn is-ghost" onClick={onReset} disabled={!edited}>Back to the live votes</button>
            </div>
            <p className="fd-inside-help">{canFlip ? 'Each signal answers one yes-or-no question. Tap a card to change its vote and watch the scale and the decision move.' : 'Each signal answers one yes-or-no question.'}</p>
            <div className="fd-cards">
                {signals.map((s, i) => {
                    const copy = g.signals[s.label];
                    if (!copy || (isNum(s.weight) && s.weight === 0)) return null;
                    if (s.found === false) return <div key={s.label} className="fd-card is-missing"><b>{copy.name}</b><span>Not found in the sheet.</span></div>;
                    const v = s.vote;
                    const tone = v > 0 ? 'is-grow' : v < 0 ? 'is-safe' : 'is-mid';
                    const next = v === -1 ? 0 : v === 0 ? 1 : -1;
                    const word = v > 0 ? 'growth' : v < 0 ? 'safety' : 'neutral';
                    const body = (
                        <>
                            <span className="fd-card-top">
                                <span className="fd-card-pull"><span className="fd-card-dot" aria-hidden="true"><Icon d={v > 0 ? 'M5 12h14M13 6l6 6-6 6' : v < 0 ? 'M19 12H5M11 6l-6 6 6 6' : 'M6 12h12'} size={14} stroke={2.6} /></span>{word.toUpperCase()}</span>
                                <span className="fd-mono fd-soft">weight {Math.round((isNum(s.weight) ? s.weight : 0) * 100)}%</span>
                            </span>
                            <span className="fd-card-name">{copy.name}</span>
                            <span className="fd-card-rule">{copy.rule}</span>
                            <span className="fd-card-foot"><span className="fd-mono">{copy.live(s.live)}</span>{live[i] && live[i].vote !== v && <span className="fd-tag">you changed this</span>}</span>
                        </>
                    );
                    return canFlip && isNum(v) ? (
                        <button key={s.label} type="button" className={`fd-card ${tone}`} onClick={() => onVote(i, next)} aria-label={`${copy.name}: ${copy.rule} Votes ${word}. Tap to change.`}>{body}</button>
                    ) : (
                        <div key={s.label} className={`fd-card ${tone}`}>{body}</div>
                    );
                })}
            </div>
            {off.length > 0 && <p className="fd-soft fd-small">{off.map((s, i) => { const n = g.signals[s.label]?.name || s.label; return i ? n.toLowerCase() : n; }).join(' and ')} {off.length === 1 ? 'is' : 'are'} in the sheet at 0% weight, so {off.length === 1 ? 'it does' : 'they do'} not count.</p>}
        </div>
    );
}

// Step 2: any ticker against the base. Tickers in the sheet answer at once; others are looked up on the server.
function Check({ d, growth, bestSafe }) {
    const [query, setQuery] = useState('VOO');
    const [asked, setAsked] = useState('VOO');
    const [remote, setRemote] = useState({ status: 'idle' });
    const inSheet = t => d.etfs.find(e => e.ticker === shortTicker(t) || e.sheetTicker === t) || null;

    const ask = useCallback(t => {
        const q = String(t || '').trim().toUpperCase();
        setQuery(q);
        setAsked(q);
    }, []);

    useEffect(() => {
        if (!asked || inSheet(asked)) { setRemote({ status: 'idle' }); return undefined; }
        if (!/^[A-Z0-9][A-Z0-9.:\-^=]{0,19}$/.test(asked)) { setRemote({ status: 'error', error: 'bad_ticker' }); return undefined; }
        const ctl = new AbortController();
        setRemote({ status: 'loading' });
        lookupTicker(asked, ctl.signal)
            .then(r => setRemote(r && r.ok ? { status: 'done', data: r } : { status: 'error', error: (r && r.error) || 'not_found' }))
            .catch(err => { if (err.name !== 'AbortError') setRemote({ status: 'error', error: 'network' }); });
        return () => ctl.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [asked, d]);

    const base = d.base && d.etfs.find(e => e.ticker === d.base.ticker) ? { ...d.etfs.find(e => e.ticker === d.base.ticker), prices: d.base.prices, m: d.base.m } : null;
    const sheetPick = inSheet(asked);
    const outside = remote.status === 'done' ? {
        ticker: shortTicker(remote.data.symbol || asked), side: 'outside', cat: [remote.data.name, remote.data.currency].filter(Boolean).join(', '),
        prices: remote.data.prices, m: remote.data.momentum, source: [remote.data.exchange, remote.data.currency].filter(Boolean).join(', ')
    } : null;
    const pick = sheetPick || outside;

    const growthList = d.etfs.filter(e => e.side === 'growth');
    const side = pick && pick.side === 'safety' ? 'safety' : 'growth';
    const raceList = [...(side === 'growth' ? growthList : d.etfs.filter(e => e.side === 'safety')), ...(outside ? [outside] : [])]
        .sort((a, b) => (isNum(b.m) ? b.m : -9) - (isNum(a.m) ? a.m : -9));
    const rankIn = (list, e) => list.filter(x => isNum(x.m)).indexOf(e) + 1;
    const sideCount = (side === 'growth' ? growthList : d.etfs.filter(e => e.side === 'safety')).length;

    let verdict;
    if (!asked) verdict = { tone: 'mid', tag: 'WAITING', text: `Type a ticker to compare it with ${base ? base.ticker : 'the base'}.` };
    else if (remote.status === 'loading') verdict = { tone: 'mid', tag: 'LOOKING IT UP', text: `Looking up ${asked}…` };
    else if (!pick && remote.error === 'sample') verdict = { tone: 'mid', tag: 'ON THE LIVE PAGE', text: `${asked} is not in the sheet. Looking up other tickers works once the page reads live data.` };
    else if (!pick && remote.error === 'bad_ticker') verdict = { tone: 'mid', tag: 'NOT A TICKER', text: 'A ticker is letters and numbers, like VOO or VWCE.' };
    else if (!pick && remote.error === 'network') verdict = { tone: 'mid', tag: 'NO ANSWER', text: `Could not look up ${asked} right now. Try again in a moment.` };
    else if (!pick) verdict = { tone: 'mid', tag: 'NOT FOUND', text: `No fund or share called ${asked} was found, or it has less than a year of prices.` };
    else if (!isNum(pick.m)) verdict = { tone: 'safe', tag: 'NO MOMENTUM YET', text: `${pick.ticker} is missing prices in the sheet, so it has no momentum score this time. It is left out of the ranking until the data is back.` };
    else if (base && pick.ticker === base.ticker && pick.side !== 'outside') verdict = { tone: 'grow', tag: 'THE BASE', text: `${base.ticker} gained ${pct(pick.m)} on average${rankIn(raceList, pick) === 1 ? ', the strongest of the growth ETFs' : ''}. It is the base everything is compared with.` };
    else if (pick.side === 'outside') {
        const r = rankIn(raceList, pick);
        verdict = { tone: 'grow', tag: 'NOT ON THE LIST', text: `${pick.ticker} is not one of the funds the model chooses from, so it would never be the pick. It gained ${pct(pick.m)} on average${base ? `, against ${pct(base.m)} for ${base.ticker}` : ''}, and would rank ${r} of ${raceList.filter(x => isNum(x.m)).length} next to the growth ETFs.` };
    } else if (pick.side === 'growth') {
        const r = rankIn(raceList, pick);
        verdict = base && pick.m < base.m
            ? { tone: 'grow', tag: 'BEHIND THE BASE', text: `${pick.ticker} gained ${pct(pick.m)} on average, behind ${base.ticker} at ${pct(base.m)}. It ranks ${r} of ${sideCount} growth ETFs.` }
            : { tone: 'grow', tag: r === 1 ? 'THE STRONGEST' : 'AHEAD OF THE BASE', text: `${pick.ticker} gained ${pct(pick.m)} on average${base ? `, ahead of ${base.ticker} at ${pct(base.m)}` : ''}. It ranks ${r} of ${sideCount} growth ETFs.` };
    } else {
        const first = bestSafe && pick.ticker === bestSafe.ticker;
        verdict = { tone: 'safe', tag: 'A PLAY-IT-SAFE ETF', text: growth
            ? `${pick.ticker} is on the safe side (${pick.cat.toLowerCase()}). While the scale leans toward growth, safe ETFs wait on the bench. ${first ? `If it tips, ${pick.ticker} is first in line.` : bestSafe ? `If it tips, ${bestSafe.ticker} is first in line, not ${pick.ticker}.` : ''}`
            : `The scale leans toward safety, so the money goes to the strongest safe ETF. ${first ? `That is ${pick.ticker}.` : bestSafe ? `That is ${bestSafe.ticker}, not ${pick.ticker}.` : ''}` };
    }

    return (
        <section id="check" className="fd-sheet fd-check">
            <div className="fd-check-ask">
                <h2><span className="fd-dim">2 / </span>Check an ETF</h2>
                <p className="fd-soft">{base ? `${base.ticker} is the base.` : ''} Type another ticker to see how it compares over the last 12 months.</p>
                <form className="fd-ask" onSubmit={e => { e.preventDefault(); ask(query); }}>
                    <label htmlFor="fd-ticker">Ticker</label>
                    <div className="fd-ask-row">
                        <input id="fd-ticker" value={query} onChange={e => setQuery(e.target.value.toUpperCase().slice(0, 20))} placeholder={base ? base.ticker : 'VWCE'} autoComplete="off" autoCapitalize="characters" spellCheck="false" enterKeyHint="go" />
                        <button type="submit" className="fd-btn">Check</button>
                    </div>
                </form>
                <div className="fd-quick">
                    {CHIPS.filter(t => inSheet(t)).map(t => (
                        <button key={t} type="button" aria-pressed={asked === t} onClick={() => ask(t)}>{t}</button>
                    ))}
                </div>
                <div className={`fd-verdict is-${verdict.tone}`} aria-live="polite">
                    <div className="fd-verdict-tag"><span aria-hidden="true" />{verdict.tag}</div>
                    <p>{verdict.text}</p>
                </div>
                <p className="fd-soft fd-small">Each fund is compared in its own trading currency. {outside ? `${outside.ticker} comes from Yahoo Finance (${outside.source}) and can differ slightly from the sheet.` : 'The base is set in the sheet by Costin.'}</p>
            </div>
            <div className="fd-check-show">
                {base && <Chart base={base} pick={pick && isNum(pick.m) && pick.ticker !== base.ticker ? pick : null} />}
                <div>
                    <h3 className="fd-h3">{side === 'growth' ? (outside ? 'Next to the growth ETFs' : 'The growth ETFs, ranked') : 'The safe ETFs, ranked'}</h3>
                    <p className="fd-soft fd-small">Momentum: the average gain over 1, 3, 6 and 12 months.</p>
                    <ol className="fd-race">
                        {raceList.map(e => {
                            const on = pick && e.ticker === pick.ticker && e.side === pick.side;
                            const has = isNum(e.m);
                            const w = has ? Math.min(100, Math.abs(e.m) / 0.125 * 100) : 0;
                            return (
                                <li key={`${e.side}-${e.ticker}`} className={on ? (e.side === 'safety' ? 'is-on is-safe' : 'is-on') : ''}>
                                    <span className="fd-race-name">{e.ticker}{base && e.ticker === base.ticker && e.side !== 'outside' && <small>base</small>}{e.side === 'outside' && <small>typed</small>}</span>
                                    {has ? (
                                        <span className="fd-bar" aria-hidden="true">
                                            <span className="fd-bar-neg"><span style={{ width: e.m < 0 ? `${w}%` : '0%' }} /></span>
                                            <span className="fd-bar-mid" />
                                            <span className="fd-bar-pos"><span style={{ width: e.m > 0 ? `${w}%` : '0%' }} /></span>
                                        </span>
                                    ) : <span className="fd-bar-none" aria-hidden="true" />}
                                    <span className="fd-mono">{has ? pct(e.m) : 'no data'}</span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}

// Twelve months of the base and the chosen fund, both starting at 100
function Chart({ base, pick }) {
    const series = p => (p && p.every(isNum) ? [p[4], p[3], p[2], p[1], p[0]].map(v => v / p[4] * 100) : null);
    const b = series(base.prices);
    const c = pick ? series(pick.prices) : null;
    if (!b) return null;
    const vals = b.concat(c || []);
    const lo = Math.min(...vals, 100) - 3, hi = Math.max(...vals, 100) + 3;
    const MONTHS_AGO = [12, 6, 3, 1, 0];
    const X = i => 20 + (12 - MONTHS_AGO[i]) / 12 * 560;
    const Y = v => 14 + (1 - (v - lo) / (hi - lo)) * 192;
    const pts = s => s.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
    const yr = p => `${pct(p[0] / p[4] - 1)} in 12 months`;
    return (
        <figure className="fd-chart">
            <figcaption>
                <span><i className="fd-key is-base" aria-hidden="true" />{base.ticker}, base <span className="fd-mono fd-soft">{yr(base.prices)}</span></span>
                {c && <span><i className={`fd-key ${pick.side === 'safety' ? 'is-safe' : 'is-grow'}`} aria-hidden="true" />{pick.ticker} <span className="fd-mono fd-soft">{yr(pick.prices)}</span></span>}
            </figcaption>
            <svg role="img" aria-label={`Price over 12 months, starting at 100. ${base.ticker} ${yr(base.prices)}${c ? `. ${pick.ticker} ${yr(pick.prices)}` : ''}.`} viewBox="0 0 600 220">
                <line x1="20" x2="580" y1={Y(100)} y2={Y(100)} className="fd-chart-zero" />
                <polyline points={pts(b)} className="fd-chart-base" />
                {c && <polyline points={pts(c)} className={`fd-chart-pick ${pick.side === 'safety' ? 'is-safe' : ''}`} />}
            </svg>
            <div className="fd-chart-axis fd-mono"><span>12 months ago = 100</span><span>6M</span><span>3M</span><span>1M</span><span>Now</span></div>
        </figure>
    );
}

function Calendar({ asOf, next, growth }) {
    const n = ymd(next), a = ymd(asOf);
    if (!n || !n[2]) return null;
    const days = a && a[2] ? Math.round((Date.UTC(n[0], n[1] - 1, n[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86400000) : null;
    return (
        <div className="fd-cal-wrap">
            <div className={`fd-cal ${growth ? 'is-grow' : 'is-safe'}`} role="img" aria-label={`Next check on ${fmtDate(next)}${days != null ? `, in ${days} days` : ''}`}>
                <div className="fd-cal-month">{MONTH[n[1] - 1].toUpperCase()}</div>
                <div className="fd-cal-day">{n[2]}</div>
                <div className="fd-cal-note">Next check{days != null ? ` · ${days === 1 ? '1 day' : `${days} days`}` : ''}</div>
            </div>
        </div>
    );
}

// The months logged so far, then the next ones still to come
function Record({ log, asOf, next }) {
    const byMonth = new Map();
    log.forEach(r => { const m = String(r.month || r.date).slice(0, 7); byMonth.set(m, r); });
    const rows = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
    const current = asOf ? String(asOf).slice(0, 7) : null;
    const label = m => { const [y, mo] = m.split('-').map(Number); return `${MON[mo - 1]} ${y}`; };
    const ghosts = [];
    let [y, mo] = (rows.length ? rows[rows.length - 1][0] : current || '2026-10').split('-').map(Number);
    while (rows.length + ghosts.length < 6) {
        mo += 1; if (mo > 12) { mo = 1; y += 1; }
        const last = new Date(Date.UTC(y, mo, 0)).getUTCDate();
        ghosts.push({ key: `${y}-${String(mo).padStart(2, '0')}`, month: `${MON[mo - 1]} ${y}`, on: `${last} ${MON[mo - 1]}` });
    }
    const local = iso => {
        const t = iso ? new Date(iso) : null;
        return t && !Number.isNaN(t.getTime()) ? t.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : null;
    };
    return (
        <section id="record" className="fd-sheet">
            <div className="fd-head">
                <h2>Track record</h2>
                <p>One row is written automatically on the last day of each month.{rows.length < 3 ? ' The record has only just started.' : ''}</p>
            </div>
            <ol className="fd-record">
                {rows.map(([m, r]) => {
                    const off = r.stance === 'OFFENSIVE';
                    const when = local(r.logged_at_utc);
                    const isNow = m === current;
                    return (
                        <li key={m} className={`fd-month ${r.stance ? (off ? 'is-grow' : 'is-safe') : 'is-mid'}`}>
                            <span className="fd-month-top"><b>{label(m)}</b><small>{r.stance || 'no data'}</small></span>
                            <span className="fd-month-pick">{r.pick ? shortTicker(r.pick) : '—'}</span>
                            <span className="fd-mono">score {sgn(r.decision_score)} · mom. {pct(r.pick_momentum)}</span>
                            <span className="fd-month-note">
                                {r.data_check && r.data_check !== 'OK' ? 'Data was incomplete. ' : ''}
                                {isNow ? `So far${when ? `, logged ${when}` : ''}. Final on ${fmtDate(next)}.` : when ? `Logged ${when}` : ''}
                            </span>
                        </li>
                    );
                })}
                {ghosts.map(g => (
                    <li key={g.key} className="fd-month is-ghost"><b>{g.month}</b><span>Logged on {g.on}</span></li>
                ))}
            </ol>
        </section>
    );
}
