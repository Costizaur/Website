import React, { useEffect, useRef, useState } from 'react';
import Dice from './Dice';
import './Hero.css';

const ROLES = ['Game Designer', 'UI/UX Designer', 'Front-end Developer', 'Systems Tinkerer'];
const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

// Cycles through ROLES, scrambling each word into the next
const useScrambleText = (words, holdMs = 2400) => {
    const [text, setText] = useState(words[0]);

    useEffect(() => {
        let index = 0;
        let current = words[0];
        let frame;
        let hold;

        const scrambleTo = (target) => {
            const length = Math.max(current.length, target.length);
            current = target;
            const start = performance.now();
            const duration = 700;

            const tick = (now) => {
                const p = Math.min(1, (now - start) / duration);
                let out = '';
                for (let i = 0; i < length; i++) {
                    const settle = i / length;
                    if (p >= settle + 0.25 || p === 1) out += target[i] || '';
                    else if (p >= settle) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                    else out += target[i] ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : '';
                }
                setText(out);
                if (p < 1) frame = requestAnimationFrame(tick);
                else hold = setTimeout(next, holdMs);
            };
            frame = requestAnimationFrame(tick);
        };

        const next = () => {
            index = (index + 1) % words.length;
            scrambleTo(words[index]);
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        hold = setTimeout(next, holdMs);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(hold);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return text;
};

// Interactive dot grid: dots swell and turn gold around the cursor
const DotGrid = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const SPACING = 28;
        const RADIUS = 170;
        let width = 0;
        let height = 0;
        let dots = [];
        let raf;
        let visible = true;
        const mouse = { x: -9999, y: -9999, active: false };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            dots = [];
            for (let y = SPACING / 2; y < height; y += SPACING) {
                for (let x = SPACING / 2; x < width; x += SPACING) dots.push({ x, y });
            }
        };

        const draw = (t) => {
            ctx.clearRect(0, 0, width, height);

            // With no mouse (touch or idle), a point drifts around on its own
            const fx = mouse.active ? mouse.x : width * (0.65 + 0.25 * Math.sin(t / 3100));
            const fy = mouse.active ? mouse.y : height * (0.45 + 0.3 * Math.cos(t / 2300));

            for (const d of dots) {
                const dx = d.x - fx;
                const dy = d.y - fy;
                const dist = Math.hypot(dx, dy);
                const k = Math.max(0, 1 - dist / RADIUS);
                const wave = 0.5 + 0.5 * Math.sin(t / 900 + (d.x + d.y) * 0.012);

                if (k > 0) {
                    const push = k * k * 12;
                    const px = d.x + (dx / (dist || 1)) * push;
                    const py = d.y + (dy / (dist || 1)) * push;
                    ctx.fillStyle = `rgba(255, 197, 61, ${0.15 + k * 0.85})`;
                    ctx.beginPath();
                    ctx.arc(px, py, 1.1 + k * 2.6, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = `rgba(243, 239, 230, ${0.06 + wave * 0.07})`;
                    ctx.fillRect(d.x - 0.9, d.y - 0.9, 1.8, 1.8);
                }
            }
        };

        const loop = (t) => {
            if (visible) draw(t);
            raf = requestAnimationFrame(loop);
        };

        const onMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = e.pointerType === 'mouse';
        };
        const onLeave = () => { mouse.active = false; };

        resize();
        window.addEventListener('resize', resize);

        const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
        io.observe(canvas);

        if (reduced) {
            draw(0);
        } else {
            window.addEventListener('pointermove', onMove, { passive: true });
            document.documentElement.addEventListener('pointerleave', onLeave);
            raf = requestAnimationFrame(loop);
        }

        return () => {
            cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('pointermove', onMove);
            document.documentElement.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    return <canvas ref={canvasRef} className="hero-canvas" aria-hidden="true" />;
};

// Split a word into letter spans that hop when hovered
const SplitWord = ({ word, offset = 0 }) => (
    <>
        {word.split('').map((ch, i) => (
            <span key={i} className="char" style={{ '--i': i + offset }}>{ch}</span>
        ))}
    </>
);

const Hero = () => {
    const role = useScrambleText(ROLES);

    return (
        <section className="hero">
            <DotGrid />
            <div className="hero-glow" aria-hidden="true"></div>

            <div className="container hero-inner">
                <div className="hero-badge">
                    <span className="status-dot"></span>
                    Open to internships &amp; junior roles
                </div>

                <h1 className="hero-name" aria-label="Costin Sarghiuta">
                    <span className="line" aria-hidden="true"><SplitWord word="Costin" /></span>
                    <span className="line line-2" aria-hidden="true">
                        <SplitWord word="Sarghiuta" offset={6} /><span className="char name-dot" style={{ '--i': 15 }}>.</span>
                    </span>
                </h1>

                <div className="hero-bottom">
                    <div className="hero-copy">
                        <p className="hero-role">
                            <span className="prompt">&gt;</span> <span className="role-text">{role}</span><span className="caret"></span>
                        </p>
                        <p className="hero-subtitle">
                            I design games and interfaces people understand in seconds, then build them myself, from Figma prototypes to Unity and React.
                        </p>
                        <div className="hero-actions">
                            <a href="/muster/index.html" target="_blank" rel="noopener noreferrer" className="btn btn-primary" data-cursor="Play">
                                <span className="play-icon" aria-hidden="true">▶</span> Play Muster
                            </a>
                            <a href="#projects" className="btn btn-outline">See my work</a>
                        </div>
                    </div>

                    <Dice />
                </div>
            </div>

            <a href="#about" className="scroll-cue" aria-label="Scroll to About">
                <span>Scroll</span>
                <span className="scroll-line"></span>
            </a>
        </section>
    );
};

export default Hero;
