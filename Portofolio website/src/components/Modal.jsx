import React, { useEffect } from 'react';
import Carousel from './Carousel';
import './Modal.css';

const Modal = ({ project, onClose }) => {
    const [currentDescription, setCurrentDescription] = React.useState('');
    const [unfoldState, setUnfoldState] = React.useState('idle'); // idle, playing-1, showing-image, playing-2
    const [currentIndex, setCurrentIndex] = React.useState(0);

    useEffect(() => {
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        // Initialize description
        if (project) {
            setCurrentDescription(project.description);
            setCurrentIndex(0); // Reset to first slide on open
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

    const activeUnfoldVideoStart = project?.images?.[currentIndex]?.unfoldVideoStart;
    const activeUnfoldVideoEnd = project?.images?.[currentIndex]?.unfoldVideoEnd;
    const activeUnfoldText = project?.images?.[currentIndex]?.unfoldText;

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
                            <Carousel images={project.images || [project.color]} onSlideChange={handleSlideChange} />
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;

