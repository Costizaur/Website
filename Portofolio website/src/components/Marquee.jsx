import React from 'react';
import './Marquee.css';

const SKILLS = ['Game Design', 'UI/UX Design', 'Systems', 'Playtesting', 'Prototyping', 'Balancing', 'Front-end'];
const TOOLS = ['Unity', 'C#', 'Figma', 'React', 'JavaScript', 'Swift', 'p5.js', 'Python', 'Excel'];

// One scrolling strip; the list is doubled so the loop is seamless
const Tape = ({ items, className }) => (
    <div className={`tape ${className}`}>
        <div className="tape-track">
            {[...items, ...items].map((item, i) => (
                <span key={i} className="tape-item">
                    {item}<span className="tape-star" aria-hidden="true">✦</span>
                </span>
            ))}
        </div>
    </div>
);

const Marquee = () => (
    <div className="marquee" aria-hidden="true">
        <Tape items={TOOLS} className="tape-back" />
        <Tape items={SKILLS} className="tape-front" />
    </div>
);

export default Marquee;
