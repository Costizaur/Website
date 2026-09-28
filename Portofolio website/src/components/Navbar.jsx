import React, { useState, useEffect } from 'react';
import './Navbar.css';
import cvPdf from '../assets/cv_costin_sarghiuta (2).pdf';

const Navbar = () => {
    // Track if the user has scrolled down, and how far through the page they are
    const [scrolled, setScrolled] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? window.scrollY / max : 0);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                {/* Logo: a die face monogram */}
                <a href="#" className="logo" aria-label="Costin Sarghiuta, back to top">
                    <span className="logo-die" aria-hidden="true">
                        <i></i><i></i><i></i>
                    </span>
                    <span className="logo-name">Costin Sarghiuta</span>
                </a>

                {/* Menu Links */}
                <ul className="nav-links">
                    <li className="nav-about"><a href="#about">About</a></li>
                    <li><a href="#projects">Work</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href={cvPdf} target="_blank" rel="noopener noreferrer" className="nav-btn">CV ↗</a></li>
                </ul>
            </div>

            {/* Scroll progress, styled like an XP bar */}
            <div className="xp-bar" aria-hidden="true">
                <div className="xp-fill" style={{ transform: `scaleX(${progress})` }}></div>
            </div>
        </nav>
    );
};

export default Navbar;
