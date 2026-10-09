import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import './Navbar.css';
import cvPdf from '../assets/cv_costin_sarghiuta (2).pdf';

const SECTIONS = [
    { id: 'projects', label: 'Work' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
];

const Navbar = () => {
    // The bar gets a solid backdrop once the page leaves the very top.
    // A sentinel and an observer do this without a scroll listener.
    const [scrolled, setScrolled] = useState(false);
    const [current, setCurrent] = useState(null);
    const sentinel = useRef(null);

    useEffect(() => {
        const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
        io.observe(sentinel.current);
        return () => io.disconnect();
    }, []);

    // Highlight the link of the section that is crossing the middle of the screen
    useEffect(() => {
        const sections = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setCurrent(entry.target.id);
                else setCurrent(id => (id === entry.target.id ? null : id));
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(section => io.observe(section));
        return () => io.disconnect();
    }, []);

    return (
        <>
            <div ref={sentinel} className="nav-sentinel" aria-hidden="true"></div>

            <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
                <nav className="container navbar-inner" aria-label="Main">
                    {/* Logo: a die showing three */}
                    <a href="#" className="brand" aria-label="Costin Sarghiuta, back to top">
                        <span className="brand-die" aria-hidden="true">
                            <i></i><i></i><i></i>
                        </span>
                        <span className="brand-name">Costin Sarghiuta</span>
                    </a>

                    {/* Menu Links */}
                    <ul className="nav-links">
                        {SECTIONS.map(section => (
                            <li key={section.id}>
                                <a href={`#${section.id}`} aria-current={current === section.id ? 'true' : undefined}>
                                    {section.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <a href={cvPdf} target="_blank" rel="noopener noreferrer" className="nav-cv">
                                CV <ArrowUpRight size={14} weight="bold" aria-hidden="true" />
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Scroll progress, like an XP bar. CSS only, see Navbar.css */}
                <div className="nav-progress" aria-hidden="true"></div>
            </header>
        </>
    );
};

export default Navbar;
