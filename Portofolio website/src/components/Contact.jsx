import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                <div className="contact-wrapper">
                    <div className="contact-info">
                        <h2 className="section-title">Let's Work Together</h2>
                        <p className="contact-text">
                            I'm currently available for work. If you have a project that needs some creative touch, I'd love to hear about it.
                        </p>
                        <div className="contact-details">
                            <div className="contact-item">
                                <span className="label">Email</span>
                                <a href="mailto:hello@example.com" className="value">costin.sarghiuta@gmail.com</a>
                            </div>
                            <div className="contact-item">
                                <span className="label">Socials</span>
                                <div className="social-links">
                                    <a href="https://www.linkedin.com/in/costin-sarghiuta-b01788217/?locale=en_US">LinkedIn</a>
                                    <a href="#">GitHub</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="contact-form" action="https://api.web3forms.com/submit" method="POST">
                        <input type="hidden" name="access_key" value="6bcd15d9-36a9-42dd-bfc1-b7bb9f107117" />
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" name="name" placeholder="Your Name" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" placeholder="your@email.com" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" rows="5" placeholder="Tell me about your project" required></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
