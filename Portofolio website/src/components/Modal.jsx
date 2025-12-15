import React, { useEffect } from 'react';
import Carousel from './Carousel';
import './Modal.css';

const Modal = ({ project, onClose }) => {
    useEffect(() => {
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!project) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>

                <div className="modal-body">
                    <div className="modal-carousel-container">
                        <Carousel images={project.images || [project.color]} />
                    </div>

                    <div className="modal-info">
                        <h2 className="modal-title">{project.title}</h2>
                        <div className="modal-tags">
                            {project.tags.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
                        </div>
                        <p className="modal-description">{project.description}</p>
                        {/* Add more detailed description here if available in project object */}
                        <div className="modal-long-description">
                            <p>{project.longDescription}</p>
                            <p>Tools used: {project.tags.join(', ')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
