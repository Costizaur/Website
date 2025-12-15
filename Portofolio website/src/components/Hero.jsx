import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="container hero-content">
                <h1 className="hero-title">
                    Building digital <br />
                    <span className="gradient-text">experiences</span> that matter.
                </h1>
                <p className="hero-subtitle">
                    I'm a creative student passionate about crafting accessible, pixel-perfect user interfaces that blend art and code.
                </p>
                <div className="hero-actions">
                    <a href="#projects" className="btn btn-primary">View Work</a>
                    <a href="#contact" className="btn btn-outline">Contact Me</a>
                </div>
            </div>
            <div className="hero-background">
                <div className="glow glow-1"></div>
                <div className="glow glow-2"></div>
            </div>
        </section>
    );
};

export default Hero;
