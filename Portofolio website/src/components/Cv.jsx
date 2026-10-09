import React from 'react';
import { ArrowUpRight, DownloadSimple, EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react';
import Folder from './Folder';
import { cv } from '../data/cv';
import './Cv.css';
import profileImg from '../assets/profile.jpg';

// The file the Download button hands over, and the name it is saved under
const PDF = '/cv.pdf';
const PDF_NAME = 'Costin-Sarghiuta-CV.pdf';

const Point = ({ point }) => (
    typeof point === 'string' ? <li>{point}</li> : <li><b>{point.lead}</b> {point.text}</li>
);

const Chips = ({ items }) => (
    <ul className="cv-chips">
        {items.map(item => <li key={item}>{item}</li>)}
    </ul>
);

// The CV as a page of the site: its sections are sheets lying on the desk. The same page,
// printed, is the PDF behind the Download button: one A4 sheet, without the desk under it.
// The parts marked data-rise come in one after another as the page opens.
const Cv = () => (
    <div className="cv">
        {/* ===== The words ===== */}
        <div className="cv-col cv-main">
            <header className="cv-who">
                <h1 className="info-title cv-name" id="cv-title" tabIndex={-1} data-rise>
                    <span>{cv.name[0]}</span> <span>{cv.name[1]}</span>
                </h1>
                <p className="cv-role" data-rise>{cv.role}</p>
                <div data-rise>
                    <p className="cv-profile">{cv.profile}</p>
                    <p className="cv-get">
                        <a className="key-btn" href={PDF} download={PDF_NAME}>
                            Download PDF <DownloadSimple size="1em" weight="bold" aria-hidden="true" />
                        </a>
                    </p>
                </div>
            </header>

            <div className="cv-sheets" data-rise>
                {cv.sections.map(section => (
                    <section key={section.title} className="cv-sheet" style={{ '--folder': section.color }}>
                        <h2 className="cv-label"><Folder color={section.color} />{section.title}</h2>
                        {section.entries.map(entry => (
                            <article key={entry.title} className="cv-entry">
                                <div className="cv-entry-head">
                                    <h3>{entry.title}</h3>
                                    <span className="cv-when">{entry.when}</span>
                                </div>
                                <p className="cv-sub">{entry.sub}</p>
                                {entry.points && (
                                    <ul className="cv-points">
                                        {entry.points.map((point, n) => <Point key={n} point={point} />)}
                                    </ul>
                                )}
                            </article>
                        ))}
                    </section>
                ))}
            </div>
        </div>

        {/* ===== The narrow column ===== */}
        <aside className="cv-col cv-side">
            <figure className="about-photo cv-photo" data-rise>
                <img src={profileImg} alt="Portrait of Costin Sârghiuță" width="682" height="1024" />
                <figcaption>Player 1</figcaption>
            </figure>

            <div className="cv-sheets" data-rise>
                <section className="cv-sheet">
                    <h2 className="cv-label">Contact</h2>
                    <ul className="cv-contact">
                        <li><MapPin size="1.1em" weight="bold" aria-hidden="true" /> {cv.contact.place}</li>
                        <li>
                            <a href={`mailto:${cv.contact.email}`}>
                                <EnvelopeSimple size="1.1em" weight="bold" aria-hidden="true" /> {cv.contact.email}
                            </a>
                        </li>
                        <li>
                            <a href={`tel:${cv.contact.phone.replace(/\s/g, '')}`}>
                                <Phone size="1.1em" weight="bold" aria-hidden="true" /> {cv.contact.phone}
                            </a>
                        </li>
                        {/* Only on paper: on the site you are already here */}
                        <li className="cv-site">
                            <a href={`https://www.${cv.contact.site}`}>
                                {cv.contact.site} <ArrowUpRight size="0.9em" weight="bold" aria-hidden="true" />
                            </a>
                        </li>
                    </ul>
                </section>

                <section className="cv-sheet">
                    <h2 className="cv-label">Skills</h2>
                    {cv.skills.map(group => (
                        <div key={group.title} className="cv-group">
                            <h3>{group.title}</h3>
                            <Chips items={group.items} />
                        </div>
                    ))}
                </section>

                <section className="cv-sheet">
                    <h2 className="cv-label">Soft skills</h2>
                    <Chips items={cv.softSkills} />
                </section>

                <section className="cv-sheet">
                    <h2 className="cv-label">Languages</h2>
                    <ul className="cv-levels">
                        {cv.languages.map(([language, level]) => (
                            <li key={language}><b>{language}</b> <span>{level}</span></li>
                        ))}
                    </ul>
                </section>
            </div>
        </aside>
    </div>
);

export default Cv;
