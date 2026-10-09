import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Check, Copy, GithubLogo, LinkedinLogo } from '@phosphor-icons/react';
import './Contact.css';

const EMAIL = 'sarghiuta.costin@gmail.com';

// The parts marked data-rise come in one after another as the page opens
const Contact = () => {
    const [copied, setCopied] = useState(false);
    // Form state: 'idle' | 'sending' | 'sent' | 'error'
    const [status, setStatus] = useState('idle');
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

    // Send through Web3Forms without leaving the page. Without JavaScript the form still posts normally.
    const sendMessage = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setStatus('sending');
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { Accept: 'application/json' },
                body: new FormData(form)
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error('Not sent');
            form.reset();
            setStatus('sent');
        } catch {
            setStatus('error');
        }
    };

    return (
        <div className="contact">
            {/* Left Column: Contact Details */}
            <div className="contact-words">
                <h1 className="info-title" id="contact-title" tabIndex={-1} data-rise>
                    <span>Let's make</span> <span>something</span> <span>playable.</span>
                </h1>

                <p className="info-lead" data-rise>
                    I'm open to internships and junior roles. Have a project, a role, or just want to talk games and interfaces? Send me a message.
                </p>

                <div className="contact-ways" data-rise>
                    <button type="button" className={`email-card ${copied ? 'is-copied' : ''}`} onClick={copyEmail}>
                        <span className="email-label">Email</span>
                        <span className="email-value">{EMAIL}</span>
                        <span className="email-action" aria-live="polite">
                            {copied ? (
                                <span key="copied" className="swap-in"><Check size="1em" weight="bold" aria-hidden="true" /> Copied</span>
                            ) : (
                                <span key="copy" className="swap-in"><Copy size="1em" weight="bold" aria-hidden="true" /> Copy</span>
                            )}
                        </span>
                    </button>
                    <a href={`mailto:${EMAIL}`} className="mail-app-link">
                        or open your mail app <ArrowUpRight size="0.9em" weight="bold" aria-hidden="true" />
                    </a>

                    <ul className="social-links">
                        <li>
                            <a href="https://www.linkedin.com/in/costin-sarghiuta-b01788217/?locale=en_US" target="_blank" rel="noopener noreferrer">
                                <LinkedinLogo size="1.2em" weight="fill" aria-hidden="true" /> LinkedIn
                                <ArrowUpRight size="0.9em" weight="bold" aria-hidden="true" />
                            </a>
                        </li>
                        <li>
                            <a href="https://github.com/Costizaur" target="_blank" rel="noopener noreferrer">
                                <GithubLogo size="1.2em" weight="fill" aria-hidden="true" /> GitHub
                                <ArrowUpRight size="0.9em" weight="bold" aria-hidden="true" />
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right Column: Contact Form, on a sheet like the project sheets */}
            {/* Uses Web3Forms API to send emails without server code */}
            <form className="contact-form" action="https://api.web3forms.com/submit" method="POST" onSubmit={sendMessage} data-rise>
                {/* Hidden key for the API service */}
                <input type="hidden" name="access_key" value="6bcd15d9-36a9-42dd-bfc1-b7bb9f107117" />

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input type="text" id="name" name="name" placeholder="Your name" autoComplete="name" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" id="email" name="email" placeholder="you@email.com" autoComplete="email" required />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows="5" placeholder="Tell me about your project or role" enterKeyHint="enter" required></textarea>
                </div>

                <div className="form-footer">
                    <button type="submit" className="key-btn" disabled={status === 'sending'}>
                        {status === 'sending' ? 'Sending…' : <>Send message <ArrowRight size="1em" weight="bold" aria-hidden="true" /></>}
                    </button>
                    <p className={`form-status is-${status}`} role="status">
                        {status === 'sent' && <><Check size="1em" weight="bold" aria-hidden="true" /> Message sent. Thank you!</>}
                        {status === 'error' && <>That did not send. Please try again, or email me directly.</>}
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Contact;
