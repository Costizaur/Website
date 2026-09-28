import React, { useState, useRef, useEffect } from 'react';
import './Contact.css';

const EMAIL = 'sarghiuta.costin@gmail.com';

const Contact = () => {
    const [copied, setCopied] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    // Copy the address; fall back to opening the mail app if the clipboard is blocked
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(EMAIL);
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 1800);
        } catch {
            window.location.href = `mailto:${EMAIL}`;
        }
    };

    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                <div className="section-head" data-reveal>
                    <div className="section-label">03 · Contact</div>
                    <h2 className="section-title contact-title">Let's make something <em>playable.</em></h2>
                </div>

                <div className="contact-wrapper">

                    {/* Left Column: Contact Details */}
                    <div className="contact-info" data-reveal>
                        <p className="contact-text">
                            I'm open to internships and junior roles. Have a project, a role, or just want to talk games and interfaces? Send me a message.
                        </p>

                        <button type="button" className={`email-card ${copied ? 'is-copied' : ''}`} onClick={copyEmail}>
                            <span className="email-label">Email · click to copy</span>
                            <span className="email-value">{EMAIL}</span>
                            <span className="email-toast" aria-live="polite">{copied ? 'Copied ✓' : ''}</span>
                        </button>
                        <a href={`mailto:${EMAIL}`} className="mail-app-link">or open your mail app ↗</a>

                        <div className="social-links">
                            <a href="https://www.linkedin.com/in/costin-sarghiuta-b01788217/?locale=en_US" target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
                            <a href="https://github.com/Costizaur" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    {/* Uses Web3Forms API to send emails without server code */}
                    <form className="contact-form spot-card" action="https://api.web3forms.com/submit" method="POST" data-reveal style={{ '--reveal-delay': '0.1s' }}>
                        {/* Hidden key for the API service */}
                        <input type="hidden" name="access_key" value="6bcd15d9-36a9-42dd-bfc1-b7bb9f107117" />

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input type="text" id="name" name="name" placeholder="Your name" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" placeholder="you@email.com" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" rows="5" placeholder="Tell me about your project or role" required></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary">Send message <span aria-hidden="true">→</span></button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
