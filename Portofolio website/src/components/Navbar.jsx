import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    // State to track if user has scrolled down
    const [scrolled, setScrolled] = useState(false);

    // Listen for scroll events
    useEffect(() => {
        const handleScroll = () => {
            // If scrolled more than 50px, toggle "scrolled" state
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Clean up event listener
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        // Add 'scrolled' class if page is scrolled
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                {/* Logo */}
                <a href="#" className="logo">Portfolio<span className="dot">.</span></a>

                {/* Menu Links */}
                <ul className="nav-links">
                    <li><a href="#about">About</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="/cv.pdf" download className="nav-btn">Download CV</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
