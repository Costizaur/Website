import React from 'react';
import './About.css';

const About = () => {
    return (
        <section id="about" className="section about-section">
            <div className="container">
                <h2 className="section-title">About Me</h2>
                <div className="about-content">
                    <div className="about-text">
                        <p>
                            Hello! I am a student focused on transforming well-designed interfaces into responsive, working websites. I develop websites and applications using modern HTML, CSS, and JavaScript.
                        </p>
                        <p>
                            I am actively looking for job and internship opportunities in the field.
                        </p>
                        <div className="skills-grid">
                            <div className="skill-item">Figma</div>
                            <div className="skill-item">React</div>
                            <div className="skill-item">Canva</div>
                            <div className="skill-item">CSS</div>
                            <div className="skill-item">HTML</div>
                            <div className="skill-item">JS</div>
                        </div>
                    </div>
                    <div className="about-image">
                        {/* Placeholder for user image */}
                        <div className="image-placeholder"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
