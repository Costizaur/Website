import React from 'react';
import SiteNav from './SiteNav';
import About from './About';
import Contact from './Contact';
import './InfoPage.css';

// About and Contact. One page lies over the desk and holds both; `panel` says which one is
// showing. Both stay in the page, so a half-written message is still there when you come back.
// lib/stageMotion.js spreads the page out from the link that was clicked.
const InfoPage = ({ open, panel, onNav, onOpenFolder }) => (
    <div className="info" inert={!open}>
        <div className="frame">
            <SiteNav current={panel} onGo={onNav} />
            <div className="info-body">
                <section className="info-panel" hidden={panel !== 'about'} aria-labelledby="about-title">
                    <About onNav={onNav} onOpenFolder={onOpenFolder} />
                </section>
                <section className="info-panel" hidden={panel !== 'contact'} aria-labelledby="contact-title">
                    <Contact />
                </section>
            </div>
        </div>
    </div>
);

export default InfoPage;
