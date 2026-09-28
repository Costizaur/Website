import React, { useEffect, useRef, useState } from 'react';
import './Cursor.css';

const INTERACTIVE = 'a, button, [data-cursor], .folder, .finder-item, .sidebar-item, .control-dot, label, .keycap';

// A dot that sits on the pointer and a ring that trails behind it.
// Also feeds --mx/--my to .spot-card elements for their hover spotlight.
const Cursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches);

    useEffect(() => {
        // Spotlight positions for cards work on any device with a pointer
        const onSpot = (e) => {
            document.querySelectorAll('.spot-card').forEach(card => {
                const r = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - r.left}px`);
                card.style.setProperty('--my', `${e.clientY - r.top}px`);
            });
        };
        window.addEventListener('pointermove', onSpot, { passive: true });
        return () => window.removeEventListener('pointermove', onSpot);
    }, []);

    useEffect(() => {
        if (!enabled) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const root = document.documentElement;
        root.classList.add('has-cursor');

        const dot = dotRef.current;
        const ring = ringRef.current;
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const ringPos = { ...pos };
        let raf;

        const onMove = (e) => {
            pos.x = e.clientX;
            pos.y = e.clientY;
            dot.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
            root.classList.remove('cursor-hidden');
        };

        const onOver = (e) => {
            const target = e.target.closest ? e.target.closest(INTERACTIVE) : null;
            const typing = e.target.closest && e.target.closest('input, textarea');
            ring.classList.toggle('is-hover', !!target);
            root.classList.toggle('cursor-typing', !!typing);
            const label = target && target.getAttribute('data-cursor');
            ring.dataset.label = label || '';
            ring.classList.toggle('has-label', !!label);
        };

        const onDown = () => ring.classList.add('is-down');
        const onUp = () => ring.classList.remove('is-down');
        const onLeave = () => root.classList.add('cursor-hidden');

        const loop = () => {
            const ease = reduced ? 1 : 0.18;
            ringPos.x += (pos.x - ringPos.x) * ease;
            ringPos.y += (pos.y - ringPos.y) * ease;
            ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px)`;
            raf = requestAnimationFrame(loop);
        };

        window.addEventListener('pointermove', onMove, { passive: true });
        document.addEventListener('pointerover', onOver);
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        document.documentElement.addEventListener('pointerleave', onLeave);
        raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            root.classList.remove('has-cursor', 'cursor-typing', 'cursor-hidden');
            window.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerover', onOver);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            document.documentElement.removeEventListener('pointerleave', onLeave);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <>
            <div ref={ringRef} className="cursor-ring" aria-hidden="true"><span className="cursor-ring-inner" /></div>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
        </>
    );
};

export default Cursor;
