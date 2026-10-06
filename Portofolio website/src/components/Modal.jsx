import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowUUpLeft, MapTrifold, Play } from '@phosphor-icons/react';
import Carousel from './Carousel';
import './Modal.css';

// True on phone-sized screens; used to pick the portrait unfold video
const useIsPhone = () => {
    const query = '(max-width: 768px)';
    const [isPhone, setIsPhone] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const onChange = (e) => setIsPhone(e.matches);
        media.addEventListener('change', onChange);
        return () => media.removeEventListener('change', onChange);
    }, []);

    return isPhone;
};

// Project detail, shown inside the window: screenshots, the write-up, links, and the unfold
const Modal = ({ category, item }) => {
    // Unfold steps: 'idle' -> 'opening' (video) -> 'open' (notes on the paper) -> 'closing' (video) -> 'idle'
    const [unfold, setUnfold] = useState('idle');
    const endVideo = useRef(null);
    const sheet = useRef(null);
    const isPhone = useIsPhone();

    // Item fields override the folder's
    const description = item.description || category.description;
    const longDescription = item.longDescription || category.longDescription;
    const tags = item.tags || category.tags || [];
    const tools = item.tools || tags;
    const images = item.extraImages && item.extraImages.length > 0 ? item.extraImages : [item.src];

    // --- UNFOLD LOGIC ---
    // Select appropriate video based on device (Mobile/Desktop)
    const videoStart = (isPhone && item.unfoldVideoStartMobile) || item.unfoldVideoStart;
    const videoEnd = (isPhone && item.unfoldVideoEndMobile) || item.unfoldVideoEnd;
    const unfoldText = item.unfoldText;
    const canUnfold = Boolean(videoStart); // Only show button if video exists

    const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const startUnfold = () => setUnfold(reducedMotion() ? 'open' : 'opening');

    const foldBack = () => {
        const video = endVideo.current;
        if (reducedMotion() || !video) {
            setUnfold('idle');
            return;
        }
        setUnfold('closing');
        video.play().catch(() => setUnfold('idle'));
    };

    // Once the paper is open, put focus on it so the notes can be read and scrolled straight away
    useEffect(() => {
        if (unfold === 'open' && sheet.current) sheet.current.focus({ preventScroll: true });
    }, [unfold]);

    return (
        <div className="project">
            <div className="project-scroll">
            {/* --- SCREENSHOTS --- */}
            <div className="project-media">
                <Carousel images={images} title={item.title} />
            </div>

            {/* --- DETAILS --- */}
            <div className="project-info">
                <h3 className="project-name display">{item.title}</h3>

                {tags.length > 0 && (
                    <ul className="project-tags" aria-label="Tags">
                        {tags.map(tag => (
                            <li key={tag} className="tag">{tag}</li>
                        ))}
                    </ul>
                )}

                <p className="project-desc">{description}</p>
                {longDescription && <p className="project-long">{longDescription}</p>}

                {tools.length > 0 && (
                    <p className="project-tools"><span>Tools used:</span> {tools.join(', ')}</p>
                )}

                {/* External links and the unfold */}
                <div className="project-actions">
                    {item.gameLink && (
                        <a href={item.gameLink} target="_blank" rel="noopener noreferrer" className="btn">
                            <Play size={14} weight="fill" aria-hidden="true" /> Play {item.title}
                        </a>
                    )}
                    {item.designLink && (
                        <a href={item.designLink} target="_blank" rel="noopener noreferrer" className="btn">
                            View design in Figma <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                        </a>
                    )}
                    {item.liveLink && (
                        <a href={item.liveLink} target="_blank" rel="noopener noreferrer" className="btn">
                            View live app <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                        </a>
                    )}
                    {canUnfold && (
                        <button type="button" className="btn btn-secondary" onClick={startUnfold}>
                            <MapTrifold size={18} weight="bold" aria-hidden="true" /> Unfold the process
                        </button>
                    )}
                </div>
            </div>
            </div>

            {/* --- UNFOLD: a sheet of paper opens over the project, with the process written on it --- */}
            {unfold !== 'idle' && (
                <div className="unfold" data-step={unfold}>
                    {/* The folding-back video waits underneath; its first frame is the open sheet */}
                    <video
                        ref={endVideo}
                        src={videoEnd}
                        className="unfold-video"
                        muted
                        playsInline
                        preload="auto"
                        onEnded={() => setUnfold('idle')}
                        onError={() => unfold === 'closing' && setUnfold('idle')}
                    />
                    {unfold === 'opening' && (
                        <video
                            src={videoStart}
                            className="unfold-video"
                            muted
                            playsInline
                            autoPlay
                            onEnded={() => setUnfold('open')}
                            onError={() => setUnfold('open')}
                            onClick={() => setUnfold('open')}
                        />
                    )}

                    {unfold === 'open' && (
                        <div className="unfold-sheet" ref={sheet} tabIndex={-1} role="region" aria-label={`${item.title}: process notes`}>
                            <button type="button" className="unfold-back" onClick={foldBack}>
                                <ArrowUUpLeft size={16} weight="bold" aria-hidden="true" /> Fold back
                            </button>

                            {Array.isArray(unfoldText) ? (
                                <div className="unfold-grid">
                                    {unfoldText.map((section, index) => (
                                        <section key={index} className="unfold-note">
                                            <h4>{section.title}</h4>
                                            <ul>
                                                {section.items.map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        </section>
                                    ))}
                                </div>
                            ) : (
                                <p className="unfold-plain">{unfoldText}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Modal;
