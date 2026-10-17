import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import Folder from './Folder';
import './About.css';
import profileImg from '../assets/profile.jpg';

const TOOLKIT = ['Figma', 'Unity', 'C#', 'React', 'JavaScript', 'Swift', 'HTML', 'CSS', 'p5.js', 'Python', 'Canva', 'Excel'];

// Each discipline carries the colour of its folder, and opens it
const DISCIPLINES = [
    { name: 'Game design', note: 'Loops, rules, balance', color: '#ffc53d', folder: 'games' },
    { name: 'UI/UX design', note: 'Research to prototype', color: '#ff7a6b', folder: 'uiux' },
    { name: 'Front-end', note: 'React, JS, CSS', color: '#4d8dff', folder: 'web' }
];

// The parts marked data-rise come in one after another as the page opens
const About = ({ onNav, onOpenFolder }) => {
    return (
        <div className="about">
            <div className="about-words">
                <h1 className="info-title" id="about-title" tabIndex={-1} data-rise>
                    <span>Design&nbsp;it,</span> <span>test&nbsp;it,</span> <span>build&nbsp;it.</span>
                </h1>

                {/* Bio */}
                <p className="info-lead" data-rise>
                    I like making things that are easy to use and fun to play.
                </p>
                <div className="about-text" data-rise>
                    <p>
                        I'm a student working across game design, UI/UX and front-end development. I care most about the first few seconds: can someone figure out what I made, and do they want to keep going?
                    </p>
                    <p>
                        I like decisions backed by players and data. For Muster I balanced the rules by simulating around 24,000 bot matches. For ShiftPro I tested my prototypes with 12 people and fixed what they struggled with.
                    </p>
                </div>

                {/* Status */}
                <p className="about-status" data-rise>
                    <span className="status-dot" aria-hidden="true"></span>
                    <span>Looking for <b>internships</b> and <b>junior roles</b> in game design, UI/UX or front-end.</span>
                    <a href="#contact" className="key-btn" onClick={(e) => onNav('contact', e)}>
                        Get in touch <ArrowRight size="1em" weight="bold" aria-hidden="true" />
                    </a>
                </p>
            </div>

            {/* Photo, lying on the desk like a print */}
            <figure className="about-photo" data-rise>
                <img src={profileImg} alt="Portrait of Costin Sarghiuta" width="682" height="1024" />
                <figcaption>Player 1</figcaption>
            </figure>

            <div className="about-lists" data-rise>
                {/* Disciplines */}
                <div>
                    <h2 className="info-label">What I do</h2>
                    <ul className="disc-list">
                        {DISCIPLINES.map(d => (
                            <li key={d.name}>
                                <a href={`#${d.folder}`} className="disc" onClick={(e) => onOpenFolder(d.folder, e)}>
                                    <Folder color={d.color} />
                                    <span>
                                        <span className="disc-name">{d.name}</span>
                                        <span className="disc-note">{d.note}</span>
                                    </span>
                                    <ArrowRight className="disc-go" size="1em" weight="bold" aria-hidden="true" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Toolkit */}
                <div>
                    <h2 className="info-label">Toolkit</h2>
                    <ul className="toolkit">
                        {TOOLKIT.map(tool => (
                            <li key={tool}>{tool}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default About;
