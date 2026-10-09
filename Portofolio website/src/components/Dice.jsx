import React, { useState, useRef, useEffect } from 'react';
import './Dice.css';

// Which pips (cells 1-9 of a 3x3 grid) are filled for each face value
const PIPS = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9]
};

// Cube rotation [x, y] that brings each face to the front
const FACE_ROTATION = {
    1: [0, 0],
    2: [-90, 0],
    3: [0, -90],
    4: [0, 90],
    5: [90, 0],
    6: [0, 180]
};

// Face value -> CSS class that places it on the cube
const FACES = [
    [1, 'front'], [6, 'back'], [3, 'right'],
    [4, 'left'], [2, 'top'], [5, 'bottom']
];

// Outward direction of each face before the die turns (x right, y down, z towards you)
const NORMALS = {
    front: [0, 0, 1], back: [0, 0, -1], right: [1, 0, 0],
    left: [-1, 0, 0], top: [0, -1, 0], bottom: [0, 1, 0]
};

// The light stays put while the die turns. For each value on show, work out where
// every face ends up: facing you, facing up, on the visible side, or turned away.
const LIGHT = Object.fromEntries(Object.keys(FACE_ROTATION).map(value => {
    const [rx, ry] = FACE_ROTATION[value].map(deg => (deg * Math.PI) / 180);
    const lit = {};
    for (const side of Object.keys(NORMALS)) {
        const [x, y, z] = NORMALS[side];
        const x1 = x * Math.cos(ry) + z * Math.sin(ry);
        const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
        const y2 = y * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
        lit[side] = z2 > 0.5 ? 'front' : y2 < -0.5 ? 'top' : x1 < -0.5 ? 'side' : 'away';
    }
    return [value, lit];
}));

const DICE_COLORS = ['bone', 'gold', 'bone'];

const Face = ({ value, side, lit }) => (
    <span className={`die-face die-${side}`} data-lit={lit}>
        {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={PIPS[value].includes(i + 1) ? 'pip-dot' : 'pip-dot empty'} />
        ))}
    </span>
);

// One die; `turns` adds whole spins so each roll tumbles forward instead of snapping back
const Die = ({ value, turns, color }) => {
    const [rx, ry] = FACE_ROTATION[value];
    const style = { transform: `rotateX(${rx + turns[0] * 360}deg) rotateY(${ry + turns[1] * 360}deg)` };
    return (
        <span className={`die-slot die-${color}`}>
            <span className="die-shadow" />
            <span className="die-lift">
                <span className="die-tilt">
                    <span className="die" style={style}>
                        {/* Solid core, so the rounded corners never show through */}
                        {FACES.map(([, side]) => <span key={`core-${side}`} className={`core-face die-${side}`} />)}
                        {FACES.map(([v, side]) => <Face key={side} value={v} side={side} lit={LIGHT[value][side]} />)}
                    </span>
                </span>
            </span>
        </span>
    );
};

const roll = () => 1 + Math.floor(Math.random() * 6);

const AT_REST = [[0, 0], [0, 0], [0, 0]];
// One spin short of rest, so the dice tumble as they are thrown in
const MID_THROW = [[-1, -1], [-1, 0], [0, -1]];

const Dice = () => {
    // On first load the dice are thrown onto the table once (skipped with reduced motion)
    const [entering, setEntering] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const [values, setValues] = useState([3, 5, 1]);
    const [turns, setTurns] = useState(entering ? MID_THROW : AT_REST);
    const [rollCount, setRollCount] = useState(0);
    const [rolling, setRolling] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    useEffect(() => {
        if (!entering) return;
        const frame = requestAnimationFrame(() => setTurns(AT_REST));
        const done = setTimeout(() => setEntering(false), 1300);
        return () => {
            cancelAnimationFrame(frame);
            clearTimeout(done);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // You can roll again mid-roll: the dice just take off from where they are
    const rollAll = () => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setValues([roll(), roll(), roll()]);
        setTurns(prev => prev.map(([x, y]) => [x + 1 + Math.round(Math.random()), y + 1 + Math.round(Math.random())]));
        setRollCount(count => count + 1);
        setEntering(false);
        setRolling(!reduced);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setRolling(false), 1250);
    };

    const total = values.reduce((a, b) => a + b, 0);
    // Two identical jump animations; swapping between them restarts the jump on every roll
    const jump = rolling ? (rollCount % 2 ? 'is-rolling jump-a' : 'is-rolling jump-b') : entering ? 'is-entering' : '';

    return (
        <div className="dice-tray">
            <button type="button" className={`dice-stage ${jump}`} onClick={rollAll} aria-label="Roll the dice">
                {values.map((v, i) => (
                    <Die key={i} value={v} turns={turns[i]} color={DICE_COLORS[i]} />
                ))}
            </button>

            <div className="dice-readout">
                <p className="dice-result" aria-live="polite">
                    {rolling ? (
                        'Rolling…'
                    ) : rollCount === 0 ? (
                        <>
                            <span className="hint-click">Click the dice to roll</span>
                            <span className="hint-tap">Tap the dice to roll</span>
                        </>
                    ) : (
                        <>Rolled {values.join(' + ')} = <b>{total}</b></>
                    )}
                </p>
                <p className="dice-note">In Muster, every die is a decision.</p>
            </div>
        </div>
    );
};

export default Dice;
