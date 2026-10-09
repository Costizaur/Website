import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowLeft, ArrowRight, CaretRight } from '@phosphor-icons/react';

import Folder from './Folder';
import SiteNav from './SiteNav';
import ProjectPage from './ProjectPage';
import InfoPage from './InfoPage';
import { worlds } from '../data/projects';
import { createStageMotion } from '../lib/stageMotion';
import { readRoute, writeRoute } from '../lib/route';
import './Stage.css';

const SITE_TITLE = document.title;
const HOME = { world: null, project: null, info: null };
const PAGE_TITLES = { about: 'About', contact: 'Contact' };
// The two theme-color tags in index.html, light and dark, with the desk colour each starts with
const THEME_TAGS = [...document.querySelectorAll('meta[name="theme-color"]')].map(tag => ({ tag, desk: tag.content, dark: (tag.getAttribute('media') || '').includes('dark') }));

// How the sheets lie on the table: a small tilt and drop each, so they look placed by hand
const LIE = {
    1: { tilt: [-0.6], drop: [0] },
    2: { tilt: [-1.2, 0.9], drop: [0, 1.2] },
    3: { tilt: [-1.5, 1, -0.8], drop: [0, 1.4, 0.6] }
};
const lieOf = (count, j) => {
    const set = LIE[Math.min(count, 3)];
    return { tilt: set.tilt[j % set.tilt.length], drop: set.drop[j % set.drop.length] };
};

const countLabel = (n) => `${n} ${n === 1 ? 'project' : 'projects'}`;

// Go somewhere, and say so in the address bar. `from` is the spot that was clicked, if any.
const travel = (motion, target, instant, mode = 'push', from) => {
    motion.goTo(target, instant, from);
    writeRoute(target, mode);
};

// The whole site in one place: the desk with the four folders, the world each folder
// opens into, the project that grows out of a sheet to fill the screen, and the About
// and Contact pages. React draws what is there; lib/stageMotion.js moves it.
const Stage = () => {
    const root = useRef(null);
    const motion = useRef(null);

    // What is on screen. `view` is where we are; `world` and `project` stay set while their
    // closing animation runs and are cleared when it ends. `info` is the About or Contact
    // page when one is open, and `panel` the one that is drawn. The address bar decides the start.
    const [ui, setUi] = useState(() => {
        const start = readRoute();
        return {
            view: start.project != null ? 'project' : start.world != null ? 'world' : 'home',
            ...start,
            panel: start.info || 'about'
        };
    });
    const start = useRef(ui);

    const world = ui.world == null ? null : worlds[ui.world];
    const project = world && ui.project != null ? world.projects[ui.project] : null;
    const count = world ? world.projects.length : 0;
    const onPage = Boolean(ui.info);

    // The motion is set up once, on the real elements. It asks for a new render through
    // `commit` and carries on as soon as the DOM is updated.
    useLayoutEffect(() => {
        const commit = (next) => flushSync(() => setUi(next));
        const made = createStageMotion(root.current, commit, start.current);
        motion.current = made;
        return () => made.destroy();
    }, []);

    const go = (target, instant, mode, from) => travel(motion.current, target, instant, mode, from);

    // A click fired from the keyboard has detail 0; those happen at once, with no animation
    const openFolder = (i, e) => {
        const m = motion.current;
        // Clicking the folder that is already open puts it back on the desk
        if (m.view === 'world' && m.world === i) go(HOME, e.detail === 0, 'up');
        else go({ ...HOME, world: i }, e.detail === 0);
    };
    const backToDesk = (e) => go(HOME, e.detail === 0, 'up');
    const openProject = (j, e) => go({ ...HOME, world: ui.world, project: j }, e.detail === 0);
    const backToWorld = (e) => go({ ...HOME, world: ui.world }, e.detail === 0, 'up');
    const hopProject = (j, e) => go({ ...HOME, world: ui.world, project: j }, e.detail === 0, 'replace');

    // "Work" on the desk is already where you are, so it points at the folders:
    // they open their flaps one after another
    const waveFolders = () => {
        root.current.querySelectorAll('.fold').forEach((fold, i) => {
            setTimeout(() => fold.classList.add('is-fan'), i * 70);
            setTimeout(() => fold.classList.remove('is-fan'), 620 + i * 70);
        });
    };

    // The menu. About and Contact spread out from the link that was clicked.
    const onNav = (place, e) => {
        e.preventDefault();
        const m = motion.current;
        const instant = e.detail === 0;
        if (place === 'work') {
            if (m.info) go(HOME, instant, 'up');
            else waveFolders();
            return;
        }
        if (m.info === place) return;
        const box = e.currentTarget.getBoundingClientRect();
        const from = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        go({ ...HOME, info: place }, instant, m.info ? 'replace' : 'push', from);
    };

    // A folder opened from the About page
    const openFolderByKey = (key, e) => {
        e.preventDefault();
        go({ ...HOME, world: worlds.findIndex(w => w.key === key) }, e.detail === 0);
    };

    useEffect(() => {
        // The Back button, a pasted link or an edited address: follow the address bar
        const follow = () => {
            const m = motion.current;
            const target = readRoute();
            const here = { world: m.view === 'home' ? null : m.world, project: m.project < 0 ? null : m.project, info: m.info };
            if (target.world !== here.world || target.project !== here.project || target.info !== here.info) m.goTo(target, false);
        };
        // Escape goes back one level at once: keyboard actions never wait for an animation
        const onKey = (e) => {
            if (e.key !== 'Escape' || e.defaultPrevented) return;
            const m = motion.current;
            if (m.info) travel(m, HOME, true, 'up');
            else if (m.view === 'project') travel(m, { ...HOME, world: m.world }, true, 'up');
            else if (m.view === 'world') travel(m, HOME, true, 'up');
        };
        window.addEventListener('popstate', follow);
        window.addEventListener('hashchange', follow);
        document.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('popstate', follow);
            window.removeEventListener('hashchange', follow);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    // The tab title names the page, folder or project that is open
    useEffect(() => {
        const name = ui.info ? PAGE_TITLES[ui.info]
            : ui.view === 'project' && project ? project.title
            : ui.view === 'world' && world ? world.title
            : null;
        document.title = name ? `${name} · Costin Sarghiuta` : SITE_TITLE;
    }, [ui.info, ui.view, world, project]);

    // The stage behind an open project or page does not scroll
    useEffect(() => {
        document.documentElement.style.overflow = ui.view === 'project' || onPage ? 'hidden' : '';
        return () => { document.documentElement.style.overflow = ''; };
    }, [ui.view, onPage]);

    // The page behind the stage takes the open folder's colour. A phone's browser fills the
    // strips behind its own bars, and the space past either end of the page, with it; older
    // browsers tint their bars from the theme-color tags instead.
    useEffect(() => {
        const page = document.body.style;
        if (ui.view !== 'home' && world) {
            page.setProperty('--wc', world.color);
            page.setProperty('--wd', world.deep);
        } else {
            page.removeProperty('--wc');
            page.removeProperty('--wd');
        }
        // A project brings its own backdrop, so only the folder page itself changes the tags
        THEME_TAGS.forEach(({ tag, desk, dark }) => {
            tag.content = ui.view === 'world' && world ? (dark ? world.deep : world.color) : desk;
        });
    }, [ui.view, world]);

    // The open world's colours, for everything on the stage that takes them
    const colours = world ? { '--wc': world.color, '--wi': world.ink, '--wd': world.deep, '--wdi': world.deepInk } : undefined;

    return (
        <div className="stage" ref={root} data-view={ui.view} data-world={world ? world.key : undefined} style={colours}>
            <i className="u-probe" aria-hidden="true"></i>

            {/* --- HOME: the name, one line, and the desk the folders sit on --- */}
            <div className="home" inert={ui.view !== 'home' || onPage}>
                <div className="frame">
                    <header className="h-top">
                        <SiteNav current="work" onGo={onNav} />
                        <h1 className="h-name"><span>Costin</span> <span>Sarghiuta</span></h1>
                        <p className="h-sub">Game designer &amp; UI/UX designer, open to internships and junior roles. Every folder below is its own world. Open one.</p>
                    </header>
                    {/* Empty places that mark where each folder rests on the desk */}
                    <div className="desk" aria-hidden="true">
                        <div className="desk-in">
                            {worlds.map(w => <span key={w.key} className="desk-slot"></span>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- The colour that pours out of a folder --- */}
            <div className="under" aria-hidden="true"></div>
            <div className="flood" aria-hidden="true"></div>

            {/* --- WORLD: the back arrow, and the places the folders move to --- */}
            <div className="world" inert={ui.view !== 'world'}>
                <div className="frame">
                    <button type="button" className="w-back" aria-label="Back to all folders" onClick={backToDesk}>
                        <ArrowLeft size="1em" weight="bold" aria-hidden="true" />
                    </button>
                    {/* Empty places that mark where each folder rests: down the side, or along the top on a phone */}
                    <div className="rail" aria-hidden="true">
                        {worlds.map(w => <span key={w.key} className="rail-slot"></span>)}
                    </div>
                </div>
            </div>

            {/* --- FOLDERS: one set of four, on the desk at home and beside the sheets in a world --- */}
            <nav className="folders" aria-label="Folders" inert={ui.view === 'project' || onPage}>
                {worlds.map((w, i) => (
                    <button
                        key={w.key}
                        type="button"
                        className={`fold ${ui.world === i ? 'is-active' : ''}`}
                        style={{ '--folder': w.color }}
                        aria-label={`${w.title}, ${countLabel(w.projects.length)}`}
                        aria-current={ui.view !== 'home' && ui.world === i ? 'true' : undefined}
                        onClick={(e) => openFolder(i, e)}
                    >
                        <span className="fold-in">
                            <Folder color={w.color} items={w.folderImages || w.projects.map(p => p.icon || p.src)} />
                        </span>
                        <span className="fold-name">{w.title}</span>
                        <span className="fold-count">{countLabel(w.projects.length)}</span>
                        <span className="fold-short" aria-hidden="true">{w.short}</span>
                    </button>
                ))}
            </nav>

            {/* --- SHEETS: the open folder's header and its projects. The first layer holds the
                last folder's sheets for a moment while another folder takes over. --- */}
            <div className="cards-layer cards-out" aria-hidden="true" inert></div>
            <section className="cards-layer cards" inert={ui.view !== 'world'} aria-label={world ? world.title : undefined}>
                <div className="frame">
                    <div className="w-head">
                        <p className="w-crumbs">
                            <button type="button" onClick={backToDesk}>Projects</button>
                            <CaretRight size="0.8em" weight="bold" aria-hidden="true" />
                            <span>{world ? world.title : ''}</span>
                        </p>
                        <div className="w-title-clip"><h2 className="w-title">{world ? world.title : ''}</h2></div>
                        <p className="w-blurb">{world ? world.blurb : ''}</p>
                    </div>
                    {world && (
                        <div className="cards-grid" data-count={Math.min(count, 3)} role="group" aria-label={`Projects in ${world.title}`}>
                            {world.projects.map((p, j) => {
                                const lie = lieOf(count, j);
                                return (
                                    <button
                                        key={`${world.key}/${p.slug}`}
                                        type="button"
                                        className={`card ${count === 1 ? 'is-wide' : ''}`}
                                        style={{ '--tilt': `${lie.tilt}deg`, '--drop': lie.drop, '--pos': p.shotPosition }}
                                        onClick={(e) => openProject(j, e)}
                                    >
                                        <span className="card-in">
                                            <img className="card-shot" src={p.src} alt="" draggable="false" />
                                            <span className="card-body">
                                                <span className="card-meta">
                                                    <img className="card-icon" src={p.icon} alt="" draggable="false" />
                                                    <span>
                                                        <span className="card-title">{p.title}</span>
                                                        <span className="card-type">{p.type}</span>
                                                    </span>
                                                </span>
                                                <span className="card-line">{p.line}</span>
                                                <span className="card-go">Open project <ArrowRight size="1em" weight="bold" aria-hidden="true" /></span>
                                            </span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* --- PROJECT: a sheet grown to the whole screen --- */}
            <ProjectPage
                world={world}
                project={project}
                index={ui.project}
                open={ui.view === 'project'}
                onClose={backToWorld}
                onHome={backToDesk}
                onHop={hopProject}
            />

            {/* --- ABOUT and CONTACT: a page that spreads over the desk --- */}
            <InfoPage open={onPage} panel={ui.panel} onNav={onNav} onOpenFolder={openFolderByKey} />
        </div>
    );
};

export default Stage;
