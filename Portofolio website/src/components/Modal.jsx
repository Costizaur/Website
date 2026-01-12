import React, { useEffect } from 'react';
import Carousel from './Carousel';
import './Modal.css';

const Modal = ({ project, onClose, onBack }) => {
    const [currentDescription, setCurrentDescription] = React.useState('');
    const [unfoldState, setUnfoldState] = React.useState('idle'); // idle, playing-1, showing-image, playing-2
    const [currentIndex, setCurrentIndex] = React.useState(project.initialIndex || 0); // Use initialIndex if provided
    const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        // Initialize description
        if (project) {
            setCurrentDescription(project.description);
            setCurrentIndex(project.initialIndex || 0); // Reset to initialIndex on open
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [project]);

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

    // Use the FIRST image (primary item) for unfold logic to keep it persistent
    const primaryItem = project.images[0];
    const activeUnfoldVideoStart = (isMobile && primaryItem?.unfoldVideoStartMobile)
        ? primaryItem.unfoldVideoStartMobile
        : primaryItem?.unfoldVideoStart;

    const activeUnfoldVideoEnd = (isMobile && primaryItem?.unfoldVideoEndMobile)
        ? primaryItem.unfoldVideoEndMobile
        : primaryItem?.unfoldVideoEnd;

    const activeUnfoldText = primaryItem?.unfoldText;



    const canUnfold = !!activeUnfoldVideoStart;

    const handleUnfoldClick = () => {
        if (canUnfold) {
            setUnfoldState('playing-1');
        }
    };

    const handleVideoEnd = () => {
        if (unfoldState === 'playing-1') {
            setUnfoldState('showing-image');
        } else if (unfoldState === 'playing-2') {
            setUnfoldState('idle');
        }
    };

    const handleReverseStart = (e) => {
        e.stopPropagation();
        // e.target.play(); // Removed: causing error if target is not video. State change triggers autoPlay video.
        setUnfoldState('playing-2');
    };

    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {unfoldState === 'idle' && canUnfold && (
                    <button className="unfold-btn" onClick={handleUnfoldClick}>Unfold</button>
                )}
                <button className="modal-close" onClick={onClose}>&times;</button>
                {onBack && (
                    <button
                        className="modal-back"
                        onClick={onBack}
                    >
                        &larr;
                    </button>
                )}

                {unfoldState !== 'idle' ? (
                    <div className="unfold-overlay">
                        {unfoldState === 'playing-1' && (
                            <video
                                src={activeUnfoldVideoStart}
                                autoPlay
                                className="unfold-media"
                                onEnded={handleVideoEnd}
                                onClick={handleVideoEnd}
                            />
                        )}
                        {unfoldState === 'playing-2' && (
                            <video
                                src={activeUnfoldVideoEnd}
                                autoPlay
                                className="unfold-media"
                                onEnded={handleVideoEnd}
                                onClick={handleVideoEnd}
                            />
                        )}
                        {unfoldState === 'showing-image' && (
                            <div className="unfold-paused-container" onClick={handleReverseStart}>
                                <video
                                    src={activeUnfoldVideoEnd}
                                    className="unfold-media"
                                />
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
                    <div className="modal-body">
                        <div className="modal-carousel-container">
                            <Carousel images={project.images || [project.color]} onSlideChange={handleSlideChange} initialIndex={project.initialIndex || 0} />
                        </div>

                        <div className="modal-info">
                            <h2 className="modal-title">{project.title}</h2>
                            <div className="modal-tags">
                                {project.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                            <p className="modal-description">{currentDescription}</p>
                            {/* Add more detailed description here if available in project object */}
                            <div className="modal-long-description">
                                <p>{project.longDescription}</p>
                                <p>Tools used: {project.tags.join(', ')}</p>
                            </div>
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

