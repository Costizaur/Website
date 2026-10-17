import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, CaretRight, X } from '@phosphor-icons/react';
import ProcessNotes from './ProcessNotes';
import { reducedMotion } from '../lib/motion';
import './ProjectPage.css';

// Every link a project has, for the list under its write-up
const linksOf = (project) => [
    project.gameLink && { label: `Play ${project.title}`, href: project.gameLink },
    // The Figma link has to point at a real file, not at Figma's home page
    project.designLink && !/figma\.com\/?$/.test(project.designLink) && { label: 'Open the prototype in Figma', href: project.designLink },
    project.liveLink && { label: 'Open the live app', href: project.liveLink },
    project.action.href && ![project.gameLink, project.designLink, project.liveLink].includes(project.action.href) && { label: project.action.label, href: project.action.href }
].filter(Boolean);

// The inside of a project page. It is keyed by project, so each project starts on its first picture.
const PageBody = ({ world, project, index, onClose, onHome, onHop }) => {
    const [shown, setShown] = useState(0);
    const [swapping, setSwapping] = useState(false);
    const [whole, setWhole] = useState(false);
    const body = useRef(null);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const shots = project.shots;
    const links = linksOf(project);
    const previous = index > 0 ? world.projects[index - 1] : null;
    const next = index < world.projects.length - 1 ? world.projects[index + 1] : null;

    // Change the big picture: the old one blurs out for a moment, then the new one is there
    const showShot = (n) => {
        if (n === shown) return;
        clearTimeout(timer.current);
        if (reducedMotion()) {
            setShown(n);
            return;
        }
        setSwapping(true);
        timer.current = setTimeout(() => {
            setShown(n);
            setSwapping(false);
        }, 130);
    };

    // The buttons at the top can jump to a part further down the page
    const jumpTo = (part, e) => {
        const target = body.current.querySelector(`[data-part="${part}"]`) || body.current.querySelector('[data-part="story"]');
        const glide = e.detail !== 0 && !reducedMotion();
        target.scrollIntoView({ behavior: glide ? 'smooth' : 'auto', block: 'start' });
        target.focus({ preventScroll: true });
    };

    // A tall picture, like a phone screen, is shown whole: cropped to the frame it would be a thin strip
    const fitShot = (e) => {
        const img = e.currentTarget;
        setWhole(img.naturalWidth / img.naturalHeight < 1.2);
    };

    const { action, more } = project;

    return (
        <div className="pg-body" ref={body}>
            {/* --- FIRST SCREEN: what it is, the facts, the way in, and the screenshots --- */}
            <div className="pg-hero">
                <div className="frame">
                    <div className="pg-bar">
                        <p className="pg-crumbs">
                            <button type="button" onClick={onHome}>Projects</button>
                            <CaretRight size="0.8em" weight="bold" aria-hidden="true" />
                            <button type="button" onClick={onClose}>{world.title}</button>
                            <CaretRight size="0.8em" weight="bold" aria-hidden="true" />
                            <span>{project.title}</span>
                        </p>
                        <button type="button" className="pg-close" aria-label={`Close ${project.title}`} onClick={onClose}>
                            <X size="1em" weight="bold" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="pg-main">
                        <div className="pg-copy">
                            <img className="pg-icon" src={project.icon} alt="" draggable="false" />
                            <h2 className="pg-title" tabIndex={-1}>{project.title}</h2>
                            <p className="pg-pitch">{project.pitch}</p>
                            <ul className="pg-facts">
                                {project.facts.map(([big, small]) => (
                                    <li key={small}><b>{big}</b>{small}</li>
                                ))}
                            </ul>
                            <div className="pg-actions">
                                {action.href ? (
                                    <a className="pg-btn" href={action.href} target="_blank" rel="noopener noreferrer">
                                        {action.label} <ArrowUpRight size="0.95em" weight="bold" aria-hidden="true" />
                                    </a>
                                ) : (
                                    <button type="button" className="pg-btn" onClick={(e) => jumpTo(action.to, e)}>
                                        {action.label} <ArrowDown size="0.95em" weight="bold" aria-hidden="true" />
                                    </button>
                                )}
                                {more && (
                                    <button type="button" className="pg-btn is-ghost" onClick={(e) => jumpTo(more.to, e)}>
                                        {more.label}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="pg-media">
                            <img
                                className={`pg-shot ${swapping ? 'is-swap' : ''} ${whole ? 'is-whole' : ''}`}
                                src={shots[shown]}
                                onLoad={fitShot}
                                alt={`${project.title}, screenshot ${shown + 1} of ${shots.length}`}
                                draggable="false"
                            />
                            <div className="pg-thumbs">
                                {shots.length > 1 && shots.map((src, n) => (
                                    <button
                                        key={src}
                                        type="button"
                                        className="pg-thumb"
                                        aria-pressed={n === shown}
                                        aria-label={`Show screenshot ${n + 1} of ${shots.length}`}
                                        onClick={() => showShot(n)}
                                    >
                                        <img src={src} alt="" draggable="false" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- THE REST: the write-up, the process and the way onwards --- */}
            <div className="pg-rest">
                <div className="pg-wrap">
                    <section className="pg-story" data-part="story" tabIndex={-1} aria-label={`About ${project.title}`}>
                        <div className="pg-words">
                            <p className="pg-lead">{project.description}</p>
                            {project.longDescription && <p className="pg-long">{project.longDescription}</p>}
                        </div>
                        <dl className="pg-meta">
                            {project.tags.length > 0 && (
                                <div>
                                    <dt>Tags</dt>
                                    <dd>
                                        <ul className="pg-tags">
                                            {project.tags.map(tag => <li key={tag}>{tag}</li>)}
                                        </ul>
                                    </dd>
                                </div>
                            )}
                            {project.tools.length > 0 && (
                                <div>
                                    <dt>Tools used</dt>
                                    <dd>{project.tools.join(', ')}</dd>
                                </div>
                            )}
                            {links.length > 0 && (
                                <div>
                                    <dt>Links</dt>
                                    <dd>
                                        <ul className="pg-links">
                                            {links.map(link => (
                                                <li key={link.href}>
                                                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                                                        {link.label} <ArrowUpRight size="0.9em" weight="bold" aria-hidden="true" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {project.notes && (
                        <ProcessNotes notes={project.notes} title={project.notesTitle || 'The process'} />
                    )}

                    {/* The way onwards: the neighbours in this folder, or back to the folder itself */}
                    <nav className="pg-onward" aria-label={`More in ${world.title}`}>
                        {previous ? (
                            <button type="button" className="pg-hop is-previous" onClick={(e) => onHop(index - 1, e)}>
                                <ArrowLeft size="1em" weight="bold" aria-hidden="true" />
                                <img src={previous.icon} alt="" draggable="false" />
                                <span><span className="pg-hop-way">Previous</span><span className="pg-hop-name">{previous.title}</span></span>
                            </button>
                        ) : (
                            <button type="button" className="pg-hop is-previous" onClick={onClose}>
                                <ArrowLeft size="1em" weight="bold" aria-hidden="true" />
                                <span><span className="pg-hop-way">Back to</span><span className="pg-hop-name">{world.title}</span></span>
                            </button>
                        )}
                        {next ? (
                            <button type="button" className="pg-hop is-next" onClick={(e) => onHop(index + 1, e)}>
                                <span><span className="pg-hop-way">Next</span><span className="pg-hop-name">{next.title}</span></span>
                                <img src={next.icon} alt="" draggable="false" />
                                <ArrowRight size="1em" weight="bold" aria-hidden="true" />
                            </button>
                        ) : previous && (
                            <button type="button" className="pg-hop is-next" onClick={onClose}>
                                <span><span className="pg-hop-way">Back to</span><span className="pg-hop-name">{world.title}</span></span>
                                <ArrowRight size="1em" weight="bold" aria-hidden="true" />
                            </button>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
};

// A project, full screen. The page is always there; lib/stageMotion.js grows it out of
// the sheet that was clicked and shrinks it back.
const ProjectPage = ({ world, project, index, open, onClose, onHome, onHop }) => {
    const backdrop = project ? project.backdrop : null;
    const dark = backdrop ? { ...backdrop, ...backdrop.dark } : null;
    const look = backdrop ? {
        '--pb': backdrop.bg, '--pf': backdrop.fg,
        '--pbd': dark.bg, '--pfd': dark.fg,
        '--p-title': backdrop.title || 'inherit',
        '--p-title-shadow': backdrop.titleShadow || 'none',
        '--p-title-scale': project.titleScale || 1,
        '--pos': project.shotPosition || '50% 50%'
    } : undefined;

    return (
        <article
            className="page"
            inert={!open}
            aria-label={project ? project.title : undefined}
            style={look}
        >
            {project && (
                <PageBody key={project.slug} world={world} project={project} index={index} onClose={onClose} onHome={onHome} onHop={onHop} />
            )}
        </article>
    );
};

export default ProjectPage;
