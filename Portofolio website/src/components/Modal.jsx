import React, { useEffect } from 'react';
import Carousel from './Carousel';
import './Modal.css';
import unfoldVideo from '../assets/unfold-video.mp4';
import unfoldImage from '../assets/unfold-image.png';

const Modal = ({ project, onClose }) => {
    const [currentDescription, setCurrentDescription] = React.useState('');
    const [unfoldState, setUnfoldState] = React.useState('idle'); // idle, playing-1, showing-image, playing-2

    useEffect(() => {
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        // Initialize description
        if (project) {
            setCurrentDescription(project.description);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [project]);

    const handleSlideChange = (index) => {
        if (!project || !project.images) return;

        const currentImage = project.images[index];
        if (typeof currentImage === 'object' && currentImage.description) {
            setCurrentDescription(currentImage.description);
        } else {
            setCurrentDescription(project.description);
        }
    };

    const handleUnfoldClick = () => {
        setUnfoldState('playing-1');
    };

    const handleVideoEnd = () => {
        if (unfoldState === 'playing-1') {
            setUnfoldState('showing-image');
        } else if (unfoldState === 'playing-2') {
            setUnfoldState('idle');
        }
    };

    const handleImageClick = () => {
        if (unfoldState === 'showing-image') {
            setUnfoldState('playing-2');
        }
    };

    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {unfoldState === 'idle' && (
                    <button className="unfold-btn" onClick={handleUnfoldClick}>Unfold</button>
                )}
                <button className="modal-close" onClick={onClose}>&times;</button>

                {unfoldState !== 'idle' ? (
                    <div className="unfold-overlay">
                        {(unfoldState === 'playing-1' || unfoldState === 'playing-2') && (
                            <video
                                src={unfoldVideo}
                                autoPlay
                                className="unfold-media"
                                onEnded={handleVideoEnd}
                                onClick={handleVideoEnd} /* Fallback for quick testing */
                            />
                        )}
                        {unfoldState === 'showing-image' && (
                            <img
                                src={unfoldImage}
                                alt="Unfolded"
                                className="unfold-media clickable"
                                onClick={handleImageClick}
                            />
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
