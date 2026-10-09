import React from 'react';

const PLACES = [
    ['work', 'Work', '#'],
    ['about', 'About', '#about'],
    ['contact', 'Contact', '#contact'],
    ['cv', 'CV', '#cv']
];

// The menu. It sits on the desk and again on the About, Contact and CV pages, in the same spot,
// so it seems to stay put while the page changes around it. `current` is where it is now;
// `onGo(place, event)` is told which link was clicked.
const SiteNav = ({ current, onGo }) => (
    <nav className="h-nav" aria-label="Main">
        <a className="h-brand" href="#" onClick={(e) => onGo('work', e)}>Costin Sarghiuta</a>
        <ul className="h-links">
            {PLACES.map(([place, label, href]) => (
                <li key={place} data-place={place}>
                    <a href={href} data-nav={place} aria-current={current === place ? 'page' : undefined} onClick={(e) => onGo(place, e)}>
                        {label}
                    </a>
                </li>
            ))}
            <li className="h-links-end">
                <a className="h-play" href="/muster/index.html" target="_blank" rel="noopener noreferrer">Play Muster</a>
            </li>
        </ul>
    </nav>
);

export default SiteNav;
