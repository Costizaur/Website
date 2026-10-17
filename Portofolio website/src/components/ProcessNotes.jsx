import React from 'react';
import './ProcessNotes.css';

// The process notes, on a sheet of graph paper: the stages numbered in pencil, and the result
// that decided the design marked with a highlighter (written ==like this== in projects.js).

// A pencil ring that does not quite close, the way you circle a number by hand
const RING = 'M33 7.5C26 3.2 12.5 3.8 6.8 12.6 1.9 20.3 5.6 31.4 15.2 34.6c9.6 3.2 21.4-.6 24.6-9.8 2.7-7.8-1.9-15.7-9.3-18.9-4-1.7-8.6-1.6-12.2-.4';

const inked = (line) => line.split(/==(.+?)==/).map((part, n) => (n % 2 ? <mark key={n}>{part}</mark> : part));

const ProcessNotes = ({ notes, title }) => (
    <section className="pg-notes" data-part="notes" tabIndex={-1} aria-labelledby="pg-notes-title">
        <h3 className="pg-h" id="pg-notes-title">{title}</h3>
        <div className="paper">
            <ol className="paper-grid">
                {notes.map((note, n) => (
                    <li key={note.title} className="paper-note">
                        <h4>
                            <span className="paper-step" aria-hidden="true">
                                <svg viewBox="0 0 44 40" preserveAspectRatio="none"><path d={RING} /></svg>
                                <span>{n + 1}</span>
                            </span>
                            {note.title}
                        </h4>
                        <ul>
                            {note.items.map(line => <li key={line}>{inked(line)}</li>)}
                        </ul>
                    </li>
                ))}
            </ol>
        </div>
    </section>
);

export default ProcessNotes;
