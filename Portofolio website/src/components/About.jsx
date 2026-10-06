import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';
import './About.css';
import profileImg from '../assets/profile.jpg';

const TOOLKIT = ['Figma', 'Unity', 'C#', 'React', 'JavaScript', 'Swift', 'HTML', 'CSS', 'p5.js', 'Python', 'Canva', 'Excel'];

// Each discipline carries the colour of its folder in the Work section
const DISCIPLINES = [
    { name: 'Game design', note: 'Loops, rules, balance', color: '#ffc53d' },
    { name: 'UI/UX design', note: 'Research to prototype', color: '#ff7a6b' },
    { name: 'Front-end', note: 'React, JS, CSS', color: '#4d8dff' }
];

const About = () => {
    return (
        <section id="about" className="section about-section">
            <div className="container about-grid">
                <h2 className="h2 display about-heading">Design&nbsp;it, test&nbsp;it, build&nbsp;it<span className="pip">.</span></h2>

                {/* Photo */}
                <figure className="about-photo">
                    <img src={profileImg} alt="Portrait of Costin Sarghiuta" width="682" height="1024" loading="lazy" />
                    <figcaption className="about-tag">Player 1</figcaption>
                </figure>

                <div className="about-body">
                    {/* Bio */}
                    <p className="about-lead">
                        I make things that feel good to use, and even better to play.
                    </p>
                    <p className="lead">
                        I'm a student working across game design, UI/UX and front-end development. I care most about the first few seconds: can someone figure out what I made, and do they want to keep going?
                    </p>
                    <p className="lead">
                        I like decisions backed by players and data. For Muster I balanced the rules by simulating around 24,000 bot matches. For ShiftPro I tested each prototype with real people and fixed what they struggled with.
                    </p>

                    {/* Status */}
                    <p className="about-status">
                        <span className="status-dot" aria-hidden="true"></span>
                        <span>Looking for <b>internships</b> and <b>junior roles</b> in game design, UI/UX or front-end.</span>
                        <a href="#contact" className="link-arrow">
                            Get in touch <ArrowRight size={16} weight="bold" aria-hidden="true" />
                        </a>
                    </p>

                    <div className="about-lists">
                        {/* Disciplines */}
                        <div>
                            <h3 className="about-label">What I do</h3>
                            <ul className="disc-list">
                                {DISCIPLINES.map(d => (
                                    <li key={d.name} style={{ '--folder': d.color }}>
                                        <span className="disc-name">{d.name}</span>
                                        <span className="disc-note">{d.note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Toolkit as keycaps */}
                        <div>
                            <h3 className="about-label">Toolkit</h3>
                            <ul className="keycaps">
                                {TOOLKIT.map(tool => (
                                    <li key={tool} className="keycap">{tool}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
