import React from 'react';
import './About.css';
import profileImg from '../assets/profile.jpg';

const TOOLKIT = ['Figma', 'Unity', 'C#', 'React', 'JavaScript', 'HTML', 'CSS', 'p5.js', 'Python', 'Canva', 'Excel'];

const DISCIPLINES = [
    { name: 'Game design', note: 'Loops, rules, balance', color: 'var(--accent)' },
    { name: 'UI/UX design', note: 'Research to prototype', color: 'var(--coral)' },
    { name: 'Front-end', note: 'React, JS, CSS', color: 'var(--blue)' }
];

const About = () => {
    return (
        <section id="about" className="section about-section">
            <div className="container">
                <div className="section-head" data-reveal>
                    <div className="section-label">01 · About</div>
                    <h2 className="section-title">Design it, test it, <em>build it.</em></h2>
                </div>

                <div className="bento">
                    {/* Photo */}
                    <div className="bento-card bento-photo spot-card" data-reveal>
                        <img src={profileImg} alt="Portrait of Costin Sarghiuta" className="profile-img" />
                        <span className="sticker">Player 1</span>
                    </div>

                    {/* Bio */}
                    <div className="bento-card bento-bio spot-card" data-reveal style={{ '--reveal-delay': '0.08s' }}>
                        <p className="bio-lead">
                            I make things that feel good to use, and even better to play.
                        </p>
                        <p>
                            I'm a student working across game design, UI/UX and front-end development. I care most about the first few seconds: can someone figure out what I made, and do they want to keep going?
                        </p>
                        <p>
                            I like decisions backed by players and data. For Muster I balanced the rules by simulating around 24,000 bot matches. For Roomerr I A/B tested two swipe directions before choosing one.
                        </p>
                    </div>

                    {/* Status */}
                    <div className="bento-card bento-status spot-card" data-reveal style={{ '--reveal-delay': '0.16s' }}>
                        <div className="card-label"><span className="status-dot"></span>Currently</div>
                        <p className="status-text">Looking for <b>internships</b> and <b>junior roles</b> in game design, UI/UX or front-end.</p>
                        <a href="#contact" className="status-link">Get in touch →</a>
                    </div>

                    {/* Toolkit as pressable keycaps */}
                    <div className="bento-card bento-tools spot-card" data-reveal style={{ '--reveal-delay': '0.1s' }}>
                        <div className="card-label">Toolkit</div>
                        <div className="keycaps">
                            {TOOLKIT.map(tool => (
                                <span key={tool} className="keycap">{tool}</span>
                            ))}
                        </div>
                    </div>

                    {/* Disciplines */}
                    <div className="bento-card bento-disc spot-card" data-reveal style={{ '--reveal-delay': '0.2s' }}>
                        <div className="card-label">What I do</div>
                        <ul className="disc-list">
                            {DISCIPLINES.map(d => (
                                <li key={d.name} style={{ '--disc-color': d.color }}>
                                    <span className="disc-name">{d.name}</span>
                                    <span className="disc-note">{d.note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
