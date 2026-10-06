import React from 'react';
import { Play } from '@phosphor-icons/react';
import Dice from './Dice';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-inner">
                <div className="hero-copy">
                    <p className="hero-status">
                        <span className="status-dot" aria-hidden="true"></span>
                        Open to internships &amp; junior roles
                    </p>

                    <h1 className="hero-name display">
                        <span className="line">Costin</span>{' '}
                        <span className="line">Sarghiuta<span className="pip">.</span></span>
                    </h1>

                    <p className="hero-role">Game designer&nbsp;&amp; UI/UX&nbsp;designer</p>

                    <p className="hero-subtitle lead">
                        I design games and interfaces people understand in seconds, then build them myself, from Figma prototypes to Unity and React.
                    </p>

                    <div className="hero-actions">
                        <a href="/muster/index.html" target="_blank" rel="noopener noreferrer" className="btn">
                            <Play size={14} weight="fill" aria-hidden="true" /> Play Muster
                        </a>
                        <a href="#projects" className="btn btn-secondary">See my work</a>
                    </div>
                </div>

                <Dice />
            </div>
        </section>
    );
};

export default Hero;
