import React, { useEffect } from 'react';
import Carousel from './Carousel';
import './Modal.css';

const Modal = ({ project, onClose, onBack }) => {
    // --- STATE MANAGEMENT ---
    const [currentDescription, setCurrentDescription] = React.useState('');
    // Track "Unfold" animation state: 'idle' -> 'playing-1' (open) -> 'showing-image' (text) -> 'playing-2' (close) -> 'idle'
    const [unfoldState, setUnfoldState] = React.useState('idle');

    // Track currently visible slide
    const [currentIndex, setCurrentIndex] = React.useState(project.initialIndex || 0);

    // Check if on mobile to swap video assets
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    // --- EFFECT HOOKS ---
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Lock body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Initialize state from props
        if (project) {
            setCurrentDescription(project.description);
            setCurrentIndex(project.initialIndex || 0);
        }
        return () => {
            document.body.style.overflow = 'unset'; // Unlock scroll on close
        };
    }, [project]);

    // Update description when slide changes
    const handleSlideChange = (index) => {
        setCurrentIndex(index);
        if (!project || !project.images) return;

        const currentImage = project.images[index];
        if (typeof currentImage === 'object' && currentImage.description) {
            setCurrentDescription(currentImage.description);
        } else {
            setCurrentDescription(project.description);
        }
    };

    // --- UNFOLD LOGIC ---
    // The "Unfold" animation is tied to the first item
    const primaryItem = project.images[0];

    // Select appropriate video based on device (Mobile/Desktop)
    const activeUnfoldVideoStart = (isMobile && primaryItem?.unfoldVideoStartMobile)
        ? primaryItem.unfoldVideoStartMobile
        : primaryItem?.unfoldVideoStart;

    const activeUnfoldVideoEnd = (isMobile && primaryItem?.unfoldVideoEndMobile)
        ? primaryItem.unfoldVideoEndMobile
        : primaryItem?.unfoldVideoEnd;

    const activeUnfoldText = primaryItem?.unfoldText;

    const canUnfold = !!activeUnfoldVideoStart; // Only show button if video exists

    const handleUnfoldClick = () => {
        if (canUnfold) {
            setUnfoldState('playing-1'); // Start opening animation
        }
    };

    const handleVideoEnd = () => {
        if (unfoldState === 'playing-1') {
            setUnfoldState('showing-image'); // Show static content after open
        } else if (unfoldState === 'playing-2') {
            setUnfoldState('idle'); // Reset after closing
        }
    };

    const handleReverseStart = (e) => {
        e.stopPropagation();
        setUnfoldState('playing-2'); // Start closing animation
    };

    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>

                {/* --- CONTROLS --- */}
                {unfoldState === 'idle' && canUnfold && (
                    <button className="unfold-btn" onClick={handleUnfoldClick}>Unfold</button>
                )}
                <button className="modal-close" onClick={onClose}>&times;</button>

                {onBack && (
                    <button className="modal-back" onClick={onBack}>&larr;</button>
                )}

                {/* --- CONTENT RENDERER --- */}
                {unfoldState !== 'idle' ? (
                    // 1. UNFOLD ANIMATION MODE
                    <div className="unfold-overlay">
                        {/* Phase 1: Opening Video */}
                        {unfoldState === 'playing-1' && (
                            <video
                                src={activeUnfoldVideoStart}
                                autoPlay
                                className="unfold-media"
                                onEnded={handleVideoEnd}
                                onClick={handleVideoEnd}
                            />
                        )}
                        {/* Phase 3: Closing Video */}
                        {unfoldState === 'playing-2' && (
                            <video
                                src={activeUnfoldVideoEnd}
                                autoPlay
                                className="unfold-media"
                                onEnded={handleVideoEnd}
                                onClick={handleVideoEnd}
                            />
                        )}
                        {/* Phase 2: Static Content (Text overlay on last frame) */}
                        {unfoldState === 'showing-image' && (
                            <div className="unfold-paused-container" onClick={handleReverseStart}>
                                <video
                                    src={activeUnfoldVideoEnd} // Use end video (first frame matches start video last frame)
                                    className="unfold-media"
                                />
                                {/* Overlay Text Grid */}
                                {Array.isArray(activeUnfoldText) ? (
                                    <div className="unfold-grid-overlay">
                                        {activeUnfoldText.map((section, index) => (
                                            <div key={index} className="unfold-grid-item">
                                                <h4>{section.title}</h4>
                                                <ul>
                                                    {section.items.map((item, i) => (
                                                        <li key={i}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="unfold-text-overlay">
                                        <p>{activeUnfoldText}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    // 2. STANDARD CAROUSEL MODE
                    <div className="modal-body">
                        <div className="modal-carousel-container">
                            <Carousel images={project.images || [project.color]} onSlideChange={handleSlideChange} initialIndex={project.initialIndex || 0} />
                        </div>

                        {/* Project Details */}
                        <div className="modal-info">
                            <h2 className="modal-title">{project.title}</h2>
                            <div className="modal-tags">
                                {project.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            <p className="modal-description">{currentDescription}</p>

                            <div className="modal-long-description">
                                <p>{project.longDescription}</p>
                                <p>Tools used: {project.tags.join(', ')}</p>
                            </div>

                            {/* External Links */}
                            {project.designLink && (
                                <a
                                    href={project.designLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-link"
                                    style={{ marginTop: '20px', display: 'inline-block' }}
                                >
                                    View Design in Figma &rarr;
                                </a>
                            )}
                            {project.gameLink && (
                                <a
                                    href={project.gameLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="project-link"
                                    style={{ marginTop: '20px', marginLeft: '10px', display: 'inline-block' }}
                                >
                                    Play Game &rarr;
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
