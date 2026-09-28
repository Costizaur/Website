import React, { useEffect, useRef, useState } from 'react';
import './Featured.css';
import musterBattle from '../assets/muster-battle.jpg';
import musterPhone from '../assets/muster-phone.jpg';

const STATS = [
    { value: 24000, prefix: '~', label: 'bot matches simulated for balance' },
    { value: 5, suffix: ' min', label: 'for a full match' },
    { value: 4, label: 'units in the counter cycle' },
    { value: 3, label: 'dice to spend every turn' }
];

// Counts up from zero the first time it scrolls into view
const CountUp = ({ value, prefix = '', suffix = '' }) => {
    const ref = useRef(null);
    const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [shown, setShown] = useState(reduced ? value : 0);

    useEffect(() => {
        const el = ref.current;
        if (reduced) return;
        let raf;
        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const tick = (now) => {
                const p = Math.min(1, (now - start) / 1600);
                setShown(Math.round(value * (1 - Math.pow(1 - p, 4))));
                if (p < 1) raf = requestAnimationFrame(tick);
            };
            raf = requestAnimationFrame(tick);
        }, { threshold: 0.6 });
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [value, reduced]);

    return <span ref={ref}>{prefix}{shown.toLocaleString('en-US')}{suffix}</span>;
};

// Featured Muster card with a 3D tilt screenshot
const Featured = ({ onCaseStudy }) => {
    const mediaRef = useRef(null);

    const handleMove = (e) => {
        const el = mediaRef.current;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
        el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
        el.style.setProperty('--gx', `${x * 100}%`);
        el.style.setProperty('--gy', `${y * 100}%`);
    };

    const handleLeave = () => {
        const el = mediaRef.current;
        el.style.setProperty('--ry', '0deg');
        el.style.setProperty('--rx', '0deg');
    };

    return (
        <article className="featured spot-card" data-reveal>
            <div className="featured-stage" onPointerMove={handleMove} onPointerLeave={handleLeave}>
                <div className="featured-media" ref={mediaRef}>
                    <a href="/muster/index.html" target="_blank" rel="noopener noreferrer" className="featured-shot" data-cursor="Play">
                        <img src={musterBattle} alt="Muster battle screen: blue and red mages duel while both army lines wait at the sides" />
                        <span className="glare" aria-hidden="true"></span>
                    </a>
                    <img src={musterPhone} alt="Muster running in landscape on a phone" className="featured-phone" />
                    <span className="featured-sticker">Play it<br />in your<br />browser</span>
                </div>
            </div>

            <div className="featured-info">
                <div className="featured-kicker">
                    <span className="kicker-dot"></span> Featured · Game design
                </div>
                <h3 className="featured-title">Muster</h3>
                <p className="featured-desc">
                    A 5-minute, two-player strategy duel. Roll three dice, spend them to grow your economy and recruit an army, then secretly line up your troops for a battle where counters and wounds decide who holds the line.
                </p>

                <dl className="stat-grid">
                    {STATS.map(s => (
                        <div key={s.label} className="stat">
                            <dt className="stat-value"><CountUp {...s} /></dt>
                            <dd className="stat-label">{s.label}</dd>
                        </div>
                    ))}
                </dl>

                <div className="featured-actions">
                    <a href="/muster/index.html" target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-cursor="Play">
                        <span aria-hidden="true">▶</span> Play in browser
                    </a>
                    <button type="button" className="btn btn-outline" onClick={onCaseStudy}>Read case study</button>
                </div>
            </div>
        </article>
    );
};

export default Featured;
