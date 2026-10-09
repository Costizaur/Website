import { worlds } from '../data/projects';

// The address after the # says where you are: '#games' is a folder, '#games/muster' a
// project inside it, and '#about', '#contact' and '#cv' are the three pages. Anything else
// is the home screen. Plain hash links need no server rules, so they work on GitHub Pages.
const PAGES = ['about', 'contact', 'cv'];
const NOWHERE = { world: null, project: null, info: null };

export const readRoute = (hash = window.location.hash) => {
    let path = hash.replace(/^#\/?/, '');
    try {
        path = decodeURIComponent(path);
    } catch {
        // A broken address falls through to the home screen
    }
    const [key, slug] = path.split('/');
    if (PAGES.includes(key)) return { ...NOWHERE, info: key };
    const world = worlds.findIndex(w => w.key === key);
    if (world < 0) return NOWHERE;
    const project = slug ? worlds[world].projects.findIndex(p => p.slug === slug) : -1;
    return { ...NOWHERE, world, project: project < 0 ? null : project };
};

export const hashOf = ({ world, project, info }) => {
    if (info) return `#${info}`;
    if (world == null) return '';
    const folder = worlds[world];
    return `#${folder.key}${project == null ? '' : `/${folder.projects[project].slug}`}`;
};

// Put a place in the address bar. 'push' adds a step the Back button returns from,
// 'replace' swaps the current step, and 'up' is for our own back arrows: when the level
// above is the page we came from it really goes back, so both back buttons agree.
export const writeRoute = (target, mode = 'push') => {
    const hash = hashOf(target);
    if (hash === window.location.hash) return;
    const url = hash || window.location.pathname + window.location.search;
    const state = window.history.state;
    if (mode === 'up' && state && state.from === hash) window.history.back();
    else if (mode === 'push') window.history.pushState({ from: window.location.hash }, '', url);
    else window.history.replaceState(state, '', url);
};
