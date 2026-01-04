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
                {images.map((img, index) => (
                    <div key={index} className="carousel-item">
                        {/* Check if it's an object with src and description */}
                        {typeof img === 'object' && img.src ? (
                            <img src={img.src} alt={`Slide ${index + 1}`} />
                        ) : typeof img === 'string' && img.startsWith('#') ? (
                            <div className="carousel-placeholder" style={{ backgroundColor: img }}>
                                <span>Image {index + 1}</span>
                            </div>
                        ) : (
                            <img src={img} alt={`Slide ${index + 1}`} />
                        )}
                    </div>
                ))}
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
