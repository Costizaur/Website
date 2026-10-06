import React from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            {/* Oversized outlined wordmark */}
            <div className="footer-wordmark" aria-hidden="true">Sarghiuta</div>

            <div className="container footer-content">
                <p>&copy; {new Date().getFullYear()} Costin Sarghiuta. Designed and built in React.</p>

                <a href="#" className="back-to-top">
                    Back to top <ArrowUp size={14} weight="bold" aria-hidden="true" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;
