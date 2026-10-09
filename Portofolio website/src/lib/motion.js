// Small motion tools for the folder worlds: easing curves, a reversible clock and a spring.
// Frame times come from the requestAnimationFrame timestamp only. Mixing it with
// performance.now() broke the animation in testing, so nothing here reads another clock.

export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
// Where v sits between a and b, from 0 to 1. This is how one clock staggers many elements:
// each of them animates over its own slice of it.
export const range = (v, a, b) => clamp01((v - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);
export const easeOut5 = (x) => 1 - Math.pow(1 - x, 5);
export const easeInOut = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);
// Ease out with a small overshoot before it settles
export const easeBack = (x, s = 1.15) => {
    const y = x - 1;
    return 1 + (s + 1) * y * y * y + s * y * y;
};

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => motionQuery.matches;

// A reversible clock from 0 to 1. Turning it around mid-way just runs the same path backwards,
// about 1.35 times faster on the way back.
export const makeTrack = (duration, onUpdate) => {
    let value = 0, target = 0, raf = 0, last = 0, done = null;

    const step = (now) => {
        const dt = last ? Math.max(0, Math.min(0.05, (now - last) / 1000)) : 0;
        last = now;
        const dir = target > value ? 1 : -1;
        value += dir * dt * (dir > 0 ? 1 : 1.35) / duration;
        if ((dir > 0 && value >= target) || (dir < 0 && value <= target)) {
            value = target;
            raf = 0;
            onUpdate(value);
            const cb = done;
            done = null;
            if (cb) cb();
            return;
        }
        onUpdate(value);
        raf = requestAnimationFrame(step);
    };

    return {
        get value() { return value; },
        // Draw the current moment again, for example after the window changed size
        render() { onUpdate(value); },
        // Jump straight to a moment
        set(v) {
            cancelAnimationFrame(raf);
            raf = 0;
            done = null;
            value = target = v;
            onUpdate(v);
        },
        // Run to a moment, then call back
        to(v, cb) {
            if (reducedMotion()) {
                this.set(v);
                if (cb) cb();
                return;
            }
            target = v;
            done = cb || null;
            if (value === v) {
                const end = done;
                done = null;
                if (end) end();
                return;
            }
            if (!raf) {
                last = 0;
                raf = requestAnimationFrame(step);
            }
        },
        stop() {
            cancelAnimationFrame(raf);
            raf = 0;
            done = null;
        }
    };
};

// A spring that keeps its velocity when it is given a new target, so it can be
// turned around halfway without a jolt.
export const makeSpring = (onUpdate) => {
    let x = 0, v = 0, target = 0, raf = 0, last = 0, k = 160, c = 25, done = null;

    const step = (now) => {
        // Two half steps per frame keep the spring stable on slow frames
        const dt = last ? Math.max(0, Math.min(0.032, (now - last) / 1000)) / 2 : 0;
        last = now;
        for (let i = 0; i < 2; i++) {
            v += (-k * (x - target) - c * v) * dt;
            x += v * dt;
        }
        if (Math.abs(v) < 0.01 && Math.abs(x - target) < 0.001) {
            x = target;
            v = 0;
            raf = 0;
            onUpdate(x);
            const cb = done;
            done = null;
            if (cb) cb();
            return;
        }
        onUpdate(x);
        raf = requestAnimationFrame(step);
    };

    return {
        get value() { return x; },
        render() { onUpdate(x); },
        set(val) {
            cancelAnimationFrame(raf);
            raf = 0;
            done = null;
            x = target = val;
            v = 0;
            onUpdate(x);
        },
        to(val, stiffness, ratio, cb) {
            if (reducedMotion()) {
                this.set(val);
                if (cb) cb();
                return;
            }
            target = val;
            k = stiffness;
            c = 2 * Math.sqrt(stiffness) * ratio;
            done = cb || null;
            if (!raf) {
                last = 0;
                raf = requestAnimationFrame(step);
            }
        },
        stop() {
            cancelAnimationFrame(raf);
            raf = 0;
            done = null;
        }
    };
};
