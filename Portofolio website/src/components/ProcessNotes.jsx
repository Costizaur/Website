import React, { useEffect, useRef, useState } from 'react';
import { reducedMotion } from '../lib/motion';
import './ProcessNotes.css';

// The process notes, and the unfold: a crumpled ball of paper lies where the notes will be,
// and opens into a sheet with the process written on it as you reach it.
const ProcessNotes = ({ project, title }) => {
    // 'ball' (waiting, crumpled) -> 'opening' (the video plays) -> 'open' (the notes are on the paper)
    // Without the recording, or with reduced motion, the notes are simply on a plain sheet
    const [plain, setPlain] = useState(() => !project.unfoldVideoStart || reducedMotion());
    const [step, setStep] = useState(plain ? 'open' : 'ball');
    const tray = useRef(null);
    const video = useRef(null);
    // The paper has a landscape and a portrait recording; a tall, narrow tray gets the portrait one
    const [portrait] = useState(() => window.matchMedia('(max-width: 768px)').matches);
    const src = (portrait && project.unfoldVideoStartMobile) || project.unfoldVideoStart;
    const notes = project.unfoldText;

    const giveUp = () => {
        setPlain(true);
        setStep('open');
    };

    // Unfold once the ball is properly in view
    useEffect(() => {
        if (step !== 'ball') return;
        const watcher = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            watcher.disconnect();
            setStep('opening');
            video.current.play().catch(giveUp);
        }, { threshold: 0.45 });
        watcher.observe(tray.current);
        return () => watcher.disconnect();
    }, [step]);

    return (
        <section className="pg-notes" data-part="notes" tabIndex={-1} aria-labelledby="pg-notes-title">
            <h3 className="pg-h" id="pg-notes-title">{title}</h3>
            <div className="paper" data-step={step} data-plain={plain ? '' : undefined} ref={tray}>
                {/* The recording stays on its last frame, which is the open sheet the notes sit on */}
                {!plain && (
                    <video
                        ref={video}
                        className="paper-video"
                        src={src}
                        muted
                        playsInline
                        preload="auto"
                        aria-hidden="true"
                        onEnded={() => setStep('open')}
                        onError={giveUp}
                    />
                )}
                <div className="paper-sheet">
                    {Array.isArray(notes) ? (
                        <div className="paper-grid">
                            {notes.map(note => (
                                <section key={note.title} className="paper-note">
                                    <h4>{note.title}</h4>
                                    <ul>
                                        {note.items.map(line => <li key={line}>{line}</li>)}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    ) : (
                        <p className="paper-plain">{notes}</p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ProcessNotes;
