import React, { useState } from 'react';
import './Carousel.css';

const Carousel = ({ images, onSlideChange, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Notify parent of slide change
    React.useEffect(() => {
        if (onSlideChange) {
            onSlideChange(currentIndex);
        }
    }, [currentIndex, onSlideChange]);

    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className="carousel">
            <div className="carousel-inner" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((img, index) => {
                    const src = typeof img === 'object' ? img.src : img;
                    const isIframe = (typeof img === 'object' && img.isIframe) || 
                                     (typeof src === 'string' && (src.includes('kaltura.com') || src.includes('youtube.com') || src.includes('vimeo.com') || src.includes('iframeplaykit') || src.includes('iframeembed') || src.includes('embed')));
                    const isVideo = !isIframe && ((typeof img === 'object' && img.isVideo) || 
                                    (typeof src === 'string' && (src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg'))));
                    
                    return (
                        <div key={index} className="carousel-item">
                            {isIframe ? (
                                <iframe 
                                    src={src} 
                                    title={typeof img === 'object' && img.title ? img.title : "video"}
                                    style={{ width: '100%', height: '100%', minHeight: '400px', border: 0, background: '#000' }}
                                    allowFullScreen
                                    webkitallowfullscreen="true"
                                    mozallowfullscreen="true"
                                    allow="autoplay *; fullscreen *; encrypted-media *"
                                    sandbox="allow-downloads allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
                                />
                            ) : isVideo ? (
                                <video 
                                    src={src} 
                                    controls 
                                    className="carousel-video" 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '500px', background: '#000' }}
                                />
                            ) : typeof img === 'object' && img.src && !img.src.startsWith('#') ? (
                                <img src={img.src} alt={`Slide ${index + 1}`} />
                            ) : typeof src === 'string' && src.startsWith('#') ? (
                                <div className="carousel-placeholder" style={{ backgroundColor: src }}>
                                    <span>{typeof img === 'object' && img.title ? img.title : `Image ${index + 1}`}</span>
                                </div>
                            ) : (
                                <img src={img} alt={`Slide ${index + 1}`} />
                            )}
                        </div>
                    );
                })}
            </div>

            {images.length > 1 && (
                <>
                    <button className="carousel-btn prev" onClick={prevSlide}>&lt;</button>
                    <button className="carousel-btn next" onClick={nextSlide}>&gt;</button>
                </>
            )}

            <div className="carousel-indicators">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Carousel;
