import React, { useEffect, useRef, useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import './Carousel.css';

// What kind of slide is this: an embedded player, a video file, a colour placeholder or an image
const slideType = (src, img) => {
    if (typeof src !== 'string') return 'image';
    if ((typeof img === 'object' && img.isIframe) || /kaltura\.com|youtube\.com|vimeo\.com|iframeplaykit|iframeembed|embed/.test(src)) return 'iframe';
    if ((typeof img === 'object' && img.isVideo) || /\.(mp4|webm|ogg)$/.test(src)) return 'video';
    if (src.startsWith('#')) return 'color';
    return 'image';
};

// Screenshot carousel. It is a native scroll-snap strip, so swiping on a phone feels right;
// the arrows, the thumbnails and the arrow keys just scroll it.
const Carousel = ({ images, title = 'Project' }) => {
    const trackRef = useRef(null);
    const [index, setIndex] = useState(0);
    const count = images ? images.length : 0;

    // The slide that is mostly in view is the current one
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setIndex(Number(entry.target.dataset.index));
            });
        }, { root: track, threshold: 0.6 });
        track.querySelectorAll('.slide').forEach(slide => io.observe(slide));
        return () => io.disconnect();
    }, [count]);

    if (!images || count === 0) return null;

    const goTo = (next) => {
        const track = trackRef.current;
        const clamped = Math.max(0, Math.min(count - 1, next));
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        track.scrollTo({ left: track.clientWidth * clamped, behavior: reduced ? 'auto' : 'smooth' });
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    };

    return (
        <div className="carousel" role="group" aria-roledescription="carousel" aria-label={`${title} screenshots`} onKeyDown={onKeyDown}>
            <div className="carousel-stage">
                <div className="carousel-track" ref={trackRef} tabIndex={count > 1 ? 0 : undefined}>
                    {images.map((img, i) => {
                        const src = typeof img === 'object' ? img.src : img;
                        const type = slideType(src, img);
                        const label = `${title}, image ${i + 1} of ${count}`;
                        return (
                            <div key={i} className="slide" data-index={i}>
                                {type === 'iframe' ? (
                                    <iframe
                                        src={src}
                                        title={typeof img === 'object' && img.title ? img.title : label}
                                        allowFullScreen
                                        allow="autoplay *; fullscreen *; encrypted-media *"
                                        sandbox="allow-downloads allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation"
                                    />
                                ) : type === 'video' ? (
                                    <video src={src} controls playsInline />
                                ) : type === 'color' ? (
                                    <div className="slide-blank" style={{ backgroundColor: src }}>
                                        <span>{typeof img === 'object' && img.title ? img.title : `Image ${i + 1}`}</span>
                                    </div>
                                ) : (
                                    <img src={src} alt={label} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" draggable="false" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {count > 1 && (
                    <>
                        <button type="button" className="carousel-btn is-prev" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous image">
                            <CaretLeft size={18} weight="bold" aria-hidden="true" />
                        </button>
                        <button type="button" className="carousel-btn is-next" onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label="Next image">
                            <CaretRight size={18} weight="bold" aria-hidden="true" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnails show how many screenshots there are and let you jump to one */}
            {count > 1 && (
                <ul className="carousel-thumbs">
                    {images.map((img, i) => {
                        const src = typeof img === 'object' ? img.src : img;
                        const isPicture = slideType(src, img) === 'image';
                        return (
                            <li key={i}>
                                <button
                                    type="button"
                                    className="carousel-thumb"
                                    onClick={() => goTo(i)}
                                    aria-label={`Show image ${i + 1} of ${count}`}
                                    aria-current={i === index ? 'true' : undefined}
                                >
                                    {isPicture ? <img src={src} alt="" loading="lazy" decoding="async" /> : <span>{i + 1}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default Carousel;
