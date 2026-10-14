import sample from './sample.json';

// The server is a Google Apps Script web app attached to the sheet (server/finance-api.gs).
// It reads the sheet on Google's side, so the sheet's address never reaches the browser.
// Without an address here, the page would show a saved copy of the numbers instead.
export const API_URL = 'https://script.google.com/macros/s/AKfycbyYf-qB0aHV15jGG8sSGbamX7FR83kjMhXVIQt6tkBCnVjyWg5HZUWIKR6U8sqjuYex/exec';

const get = async (query, signal) => {
    const res = await fetch(`${API_URL}?${query}`, { signal });
    if (!res.ok) throw new Error(`The server answered ${res.status}`);
    return res.json();
};

export async function loadState(signal) {
    if (!API_URL) return { ...sample, sample: true };
    const body = await get('action=state', signal);
    if (!body || body.ok !== true) throw new Error('The server could not read the sheet');
    return body;
}

// Prices and momentum for a ticker that is not in the sheet
export async function lookupTicker(ticker, signal) {
    if (!API_URL) return { ok: false, error: 'sample' };
    return get(`action=ticker&t=${encodeURIComponent(ticker)}`, signal);
}
