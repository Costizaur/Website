import React from 'react';
import './Marquee.css';

const SKILLS = ['Game Design', 'UI/UX Design', 'Systems', 'Playtesting', 'Prototyping', 'Balancing', 'Front-end'];

// One tape of skills at the fold. The list repeats so the loop has no seam;
// only the first copy is read out to screen readers.
const Marquee = () => (
    <div className="tape">
        <div className="tape-track">
            {[0, 1, 2, 3].map(copy => (
                <ul
                    key={copy}
                    className="tape-list"
                    aria-label={copy === 0 ? 'Skills' : undefined}
                    aria-hidden={copy > 0 ? 'true' : undefined}
                >
                    {SKILLS.map(skill => (
                        <li key={skill} className="tape-item">{skill}</li>
                    ))}
                </ul>
            ))}
        </div>
    </div>
);

export default Marquee;
