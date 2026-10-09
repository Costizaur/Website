import { clamp01, range, lerp, easeOut, easeOut5, easeInOut, easeBack, makeTrack, makeSpring } from './motion';

// The motion of the folder worlds, driven straight on the DOM so no per-frame value ever
// passes through React. CSS lays everything out, on a laptop and on a phone alike; this
// file only measures where things are and moves them between those places with transform,
// opacity and clip-path.
//
// `root` is the stage element. `commit(next)` asks React to render a new
// { view, world, project, info, panel } and returns once the DOM is updated.
// `start` is what is on screen when the stage first appears.
export const createStageMotion = (root, commit, start) => {
    const $ = (sel, from = root) => from.querySelector(sel);
    const $$ = (sel, from = root) => [...from.querySelectorAll(sel)];

    const top = $('.h-top'), flood = $('.flood'), under = $('.under'), world = $('.world');
    const backBtn = $('.w-back'), probe = $('.u-probe');
    const cards = $('.cards'), cardsOut = $('.cards-out'), page = $('.page'), info = $('.info');
    const headEls = [$('.w-crumbs', cards), $('.w-title', cards), $('.w-blurb', cards)];
    const deskSlots = $$('.desk-slot'), railSlots = $$('.rail-slot');
    const folds = $$('.fold').map(el => ({
        el, name: $('.fold-name', el), count: $('.fold-count', el), short: $('.fold-short', el)
    }));

    let u = 14;                  // one stage unit in px (see --u in Stage.css)
    let home = [], rail = [];    // where each folder sits on the desk and in the sidebar
    let view = 'home';           // home, world or project
    let active = -1;             // the open folder
    let origin = { x: 0, y: 0 }; // where the colour and the sheets come from
    let fromRail = false;
    let cardEls = [], cardAt = [];
    let shot = null, bar = null, thumbs = null, copyEls = [];
    let rects = null;            // the sheet and its picture at the moment a project opened
    let lastCard = -1;
    let infoOn = null;           // the About or Contact page, when one is open
    let panel = 'about';         // the one that is drawn, which stays while it closes
    let infoFrom = null;         // where on the screen the page grows from
    let infoEls = [];
    let leaveTimer = 0, swapTimer = 0;

    // ---- Measuring ----
    const rectIn = (el, frame) => {
        const b = el.getBoundingClientRect();
        return { x: b.left - frame.left, y: b.top - frame.top, w: b.width, h: b.height };
    };
    // The middle of a folder drawing, a little above centre, where its mouth is
    const mouth = (slot) => ({ x: slot.x + slot.w / 2, y: slot.y + slot.w * (142 / 156) * 0.45 });
    const homeCentre = (i) => mouth(home[i]);
    const railCentre = (i) => mouth(rail[i]);

    const collectCards = () => {
        cardEls = $$('.card', cards);
        const frame = root.getBoundingClientRect();
        cardAt = cardEls.map(el => {
            // Its resting place, without the transform this file puts on it
            el.style.transform = 'none';
            const r = rectIn(el, frame);
            return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, w: r.w };
        });
    };
    const collectPage = () => {
        shot = $('.pg-shot', page);
        bar = $('.pg-bar', page);
        thumbs = $('.pg-thumbs', page);
        copyEls = $$('.pg-copy > *', page);
    };

    // ---- Folders: from the desk to the sidebar (or, on a phone, to the row of tabs) ----
    const renderW = (w) => {
        top.style.opacity = 1 - range(w, 0, 0.4);
        top.style.transform = `scale(${1 - 0.03 * easeOut(w)})`;
        folds.forEach((part, i) => {
            if (!home[i]) return;
            const delay = active < 0 || i === active ? 0 : 0.05 + 0.04 * Math.abs(i - active);
            const t = easeInOut(range(w, delay, delay + 0.8));
            const a = home[i], b = rail[i];
            part.el.style.transform = `translate(${lerp(a.x, b.x, t)}px,${lerp(a.y, b.y, t)}px) scale(${lerp(1, b.w / a.w, t)})`;
            const out = 1 - range(w, 0, 0.25);
            part.name.style.opacity = out;
            part.count.style.opacity = out;
            part.short.style.opacity = range(w, 0.75, 1);
        });
    };

    // ---- Colour, header and sheets coming out of the folder ----
    const renderF = (f) => {
        const on = f > 0 ? 'visible' : 'hidden';
        flood.style.visibility = on;
        world.style.visibility = on;
        cards.style.visibility = on;
        if (f >= 1) flood.style.clipPath = 'none';
        else {
            const width = root.clientWidth, height = root.clientHeight;
            const far = Math.hypot(Math.max(origin.x, width - origin.x), Math.max(origin.y, height - origin.y)) * 1.03;
            flood.style.clipPath = `circle(${easeOut5(range(f, 0, 0.72)) * far}px at ${origin.x}px ${origin.y}px)`;
        }
        headEls.forEach((el, k) => {
            const o = range(f, 0.32 + k * 0.08, 0.66 + k * 0.08);
            el.style.opacity = o;
            // The title rises out of its clip; the lines around it only shift a little
            el.style.transform = k === 1 ? `translateY(${(1 - easeOut(o)) * 105}%)` : `translateY(${(1 - easeOut(o)) * 1.4 * u}px)`;
        });
        const back = range(f, 0.5, 0.82);
        backBtn.style.opacity = back;
        backBtn.style.scale = lerp(0.7, 1, easeOut(back));

        const n = cardEls.length;
        if (!n) return;
        // Each sheet takes its own slice of the clock; with many sheets the slices sit closer together
        const gap = Math.min(0.09, 0.24 / Math.max(1, n - 1));
        cardEls.forEach((el, j) => {
            const c = range(f, 0.16 + j * gap, 0.76 + j * gap);
            const e = easeBack(c);
            const at = cardAt[j];
            const dx = (origin.x - at.cx) * (1 - e), dy = (origin.y - 1.5 * u - at.cy) * (1 - e);
            // It starts the size of the folder's mouth, or of a sidebar folder's
            const scale = lerp(fromRail ? 0.08 : Math.min(0.6, (6 * u) / at.w), 1, e);
            const spin = (j - (n - 1) / 2) * 18 * (1 - easeOut(c));
            el.style.transform = `translate(${dx}px,${dy}px) rotate(${spin}deg) scale(${scale})`;
            el.style.opacity = range(c, 0, 0.18);
            el.style.pointerEvents = c > 0.9 ? 'auto' : 'none';
        });
    };

    // ---- A sheet growing into the whole screen ----
    const renderP = (p) => {
        if (!rects || !shot) return;
        const q = clamp01(p), k = 1 - q;
        const c = rects.card;
        page.style.clipPath = q >= 1 ? 'none' : `inset(${c.t * k}px ${c.r * k}px ${c.b * k}px ${c.l * k}px round ${1.4 * k * u}px)`;
        page.style.opacity = range(p, 0, 0.1);
        shot.style.transform = `translate(${rects.dx * (1 - p)}px,${rects.dy * (1 - p)}px) scale(${lerp(rects.s, 1, p)})`;
        shot.style.borderRadius = `${lerp(0.8 / rects.s, 1.2, q) * u}px`;
        copyEls.forEach((el, n) => {
            const o = range(p, 0.4 + n * 0.07, 0.76 + n * 0.07);
            el.style.opacity = o;
            el.style.transform = `translateY(${(1 - easeOut(o)) * 1.5 * u}px)`;
        });
        bar.style.opacity = range(p, 0.5, 0.85);
        if (thumbs) thumbs.style.opacity = range(p, 0.72, 1);
    };

    // ---- About and Contact: a page that spreads over the desk from the link that was clicked ----
    const renderI = (t) => {
        // It counts as shown from the moment it starts opening, so its heading can hold focus
        info.style.visibility = t > 0 || infoOn ? 'visible' : 'hidden';
        if (t >= 1) info.style.clipPath = 'none';
        else {
            const width = info.clientWidth, height = info.clientHeight;
            const from = infoFrom || { x: width * 0.72, y: 0 };
            const far = Math.hypot(Math.max(from.x, width - from.x), Math.max(from.y, height - from.y)) * 1.03;
            info.style.clipPath = `circle(${easeOut5(range(t, 0, 0.78)) * far}px at ${from.x}px ${from.y}px)`;
        }
        infoEls.forEach((el, n) => {
            const o = range(t, 0.28 + n * 0.055, 0.66 + n * 0.055);
            el.style.opacity = o;
            el.style.transform = `translateY(${(1 - easeOut(o)) * 1.6 * u}px)`;
        });
    };

    const W = makeTrack(0.7, renderW);
    const F = makeTrack(0.95, renderF);
    const P = makeSpring(renderP);
    const I = makeTrack(0.62, renderI);

    const measure = () => {
        u = probe.getBoundingClientRect().width / 100;
        if (!u) return;
        const frame = root.getBoundingClientRect();
        home = deskSlots.map(el => rectIn(el, frame));
        // On a phone the layout decides how big a folder can be; the folders take that width
        // before the sidebar places, which depend on it, are measured
        if (getComputedStyle(root).getPropertyValue('--fold-fit').trim() === 'slot' && home[0] && home[0].w) root.style.setProperty('--fw', `${home[0].w}px`);
        else root.style.removeProperty('--fw');
        rail = railSlots.map(el => rectIn(el, frame));
        if (active >= 0) {
            origin = fromRail ? railCentre(active) : homeCentre(active);
            collectCards();
        }
        W.render();
        F.render();
        P.render();
        I.render();
    };

    // Where a sheet and its picture are, compared with the page and the picture's place on it
    const measureProject = (el) => {
        if (!el || !shot) return { card: { l: 0, t: 0, r: 0, b: 0 }, dx: 0, dy: 0, s: 1 };
        shot.style.transform = 'none';
        const s = page.getBoundingClientRect();
        const inner = $('.card-in', el).getBoundingClientRect();
        const from = $('.card-shot', el).getBoundingClientRect();
        const dock = shot.getBoundingClientRect();
        return {
            card: { l: inner.left - s.left, t: inner.top - s.top, r: s.right - inner.right, b: s.bottom - inner.bottom },
            dx: from.left - dock.left, dy: from.top - dock.top, s: from.width / dock.width
        };
    };

    const show = (next) => commit({ view, world: active < 0 ? null : active, project: null, info: infoOn, panel, ...next });

    // On a phone the stage is as long as its contents and the window scrolls over it.
    // Anything that happens at the top of the stage starts by going there.
    const toTop = (glide) => {
        if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: glide ? 'smooth' : 'auto' });
    };

    // ---- Folders ----
    const clearWorld = () => {
        cardEls = [];
        cardAt = [];
        active = -1;
        show();
    };

    const openWorld = (i, instant) => {
        if (view === 'project') return;
        if (view === 'world' && i === active) return;
        if (view === 'world') {
            // Another folder from the sidebar: the old colour stays underneath while the new one pours over it
            toTop(false);
            under.style.backgroundColor = getComputedStyle(flood).backgroundColor;
            under.style.visibility = 'visible';
            cardsOut.innerHTML = cards.innerHTML;
            delete cardsOut.dataset.leaving;
            void cardsOut.offsetWidth;
            cardsOut.dataset.leaving = '';
            clearTimeout(leaveTimer);
            leaveTimer = setTimeout(() => { cardsOut.textContent = ''; }, 220);
            active = i;
            fromRail = true;
            origin = railCentre(i);
            show();
            collectCards();
            F.set(0);
            const settle = () => { under.style.visibility = 'hidden'; };
            if (instant) { F.set(1); settle(); } else F.to(1, settle);
            return;
        }
        // Turning around halfway through closing the same folder: carry on from where it is
        const resuming = i === active && F.value > 0;
        toTop(!instant);
        active = i;
        fromRail = false;
        origin = homeCentre(i);
        view = 'world';
        show();
        if (!resuming) {
            collectCards();
            F.set(0);
        }
        if (instant) { W.set(1); F.set(1); } else { W.to(1); F.to(1); }
    };

    const closeWorld = (instant) => {
        if (view !== 'world') return;
        const closing = active;
        toTop(false);
        view = 'home';
        fromRail = false;
        origin = homeCentre(active);
        under.style.visibility = 'hidden';
        show();
        if (instant) {
            W.set(0);
            F.set(0);
            clearWorld();
        } else {
            W.to(0);
            F.to(0, () => { if (view === 'home') clearWorld(); });
        }
        // The back button is gone now, so focus returns to the folder that was open
        const focused = document.activeElement;
        if (!focused || focused === document.body || world.contains(focused) || cards.contains(focused)) {
            folds[closing].el.focus({ preventScroll: true });
        }
    };

    // ---- Projects ----
    const openProject = (j, instant) => {
        if (view !== 'world' || !cardEls[j]) return;
        show({ view: 'project', project: j });
        collectPage();
        page.style.visibility = 'visible';
        page.style.pointerEvents = 'auto';
        page.scrollTop = 0;
        rects = measureProject(cardEls[j]);
        lastCard = j;
        view = 'project';
        if (instant) P.set(1);
        else {
            P.render();
            P.to(1, 150, 0.92);
        }
        $('.pg-title', page).focus({ preventScroll: true });
    };

    const closeProject = (instant) => {
        if (view !== 'project') return;
        // A page that was scrolled sends its picture back from wherever it is now
        if (!instant && P.value > 0.98) rects = measureProject(cardEls[lastCard]);
        view = 'world';
        page.style.pointerEvents = 'none';
        show({ project: lastCard });
        const end = () => {
            if (view === 'project') return;
            page.style.visibility = 'hidden';
            rects = null;
            show();
        };
        if (instant) { P.set(0); end(); } else P.to(0, 230, 1, end);
        if (cardEls[lastCard]) cardEls[lastCard].focus({ preventScroll: true });
    };

    // Next or previous project: the page is already open, so its contents change in place
    const switchProject = (j, instant) => {
        if (view !== 'project' || j === lastCard || !cardEls[j]) return;
        clearTimeout(swapTimer);
        if (instant) delete page.dataset.swap;
        else {
            page.dataset.swap = '';
            swapTimer = setTimeout(() => { delete page.dataset.swap; }, 400);
        }
        lastCard = j;
        show({ view: 'project', project: j });
        collectPage();
        page.scrollTop = 0;
        rects = measureProject(cardEls[j]);
        P.set(1);
        $('.pg-title', page).focus({ preventScroll: true });
    };

    // ---- About and Contact ----
    const collectInfo = () => {
        infoEls = $$('.info-panel:not([hidden]) [data-rise]', info);
    };

    const openInfo = (key, instant, from) => {
        if (infoOn === key) return;
        const changing = infoOn != null;
        infoOn = key;
        panel = key;
        show();
        collectInfo();
        info.scrollTop = 0;
        if (changing) {
            // From one page to the other: the desk stays, only what is on it changes
            clearTimeout(swapTimer);
            if (instant) delete info.dataset.swap;
            else {
                info.dataset.swap = '';
                swapTimer = setTimeout(() => { delete info.dataset.swap; }, 400);
            }
            I.set(1);
        } else {
            infoFrom = from || null;
            if (instant) I.set(1);
            else {
                I.render();
                I.to(1);
            }
        }
        $('.info-panel:not([hidden]) .info-title', info).focus({ preventScroll: true });
    };

    const closeInfo = (instant) => {
        if (!infoOn) return;
        const was = infoOn;
        infoOn = null;
        show();
        if (instant) I.set(0); else I.to(0);
        // Focus goes back to the link on the desk that leads to the page just closed
        const link = $(`.home [data-nav="${was}"]`);
        if (link && view === 'home') link.focus({ preventScroll: true });
    };

    // Go to any place from any place, for links, the address bar and the browser's Back button.
    // `from` is the spot on screen that was clicked, when there was one.
    const goTo = (target, instant, from) => {
        if (target.info) {
            // The two pages lie on the desk, so the desk is put back underneath first
            if (view === 'project') closeProject(true);
            if (view === 'world') closeWorld(true);
            openInfo(target.info, instant, from);
            return;
        }
        if (infoOn) {
            // Leaving a page: what belongs underneath is put in place at once, then the page lifts off it
            closeInfo(instant);
            instant = true;
        }
        const wantWorld = target.world == null ? -1 : target.world;
        const wantProject = target.project == null ? -1 : target.project;
        if (wantWorld < 0) {
            if (view === 'project') closeProject(true);
            closeWorld(instant);
            return;
        }
        if (view === 'project' && wantWorld === active) {
            if (wantProject < 0) closeProject(instant);
            else switchProject(wantProject, instant);
            return;
        }
        // From here on the folder itself may have to change first. On the way to a project
        // it opens at once, so the sheet is in place to grow from.
        if (view === 'project') closeProject(true);
        const changed = view === 'home' || wantWorld !== active;
        if (changed) openWorld(wantWorld, instant || wantProject >= 0);
        if (wantProject >= 0) openProject(wantProject, instant || changed);
    };

    // ---- Start ----
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    measure();
    W.set(0);
    F.set(0);
    I.set(0);
    if (start.world != null) {
        // The address already names a folder or a project: appear there, with no animation
        active = start.world;
        view = start.project != null ? 'project' : 'world';
        origin = homeCentre(active);
        collectCards();
        W.set(1);
        F.set(1);
        if (start.project != null) {
            collectPage();
            lastCard = start.project;
            page.style.visibility = 'visible';
            page.style.pointerEvents = 'auto';
            rects = measureProject(cardEls[lastCard]);
            P.set(1);
        }
    } else if (start.info) {
        infoOn = start.info;
        panel = start.info;
        collectInfo();
        I.set(1);
    }

    return {
        get view() { return view; },
        get world() { return active; },
        get project() { return view === 'project' ? lastCard : -1; },
        get info() { return infoOn; },
        goTo,
        destroy() {
            observer.disconnect();
            clearTimeout(leaveTimer);
            clearTimeout(swapTimer);
            W.stop();
            F.stop();
            P.stop();
            I.stop();
        }
    };
};
