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

const DICE_COLORS = ['gold', 'coral', 'blue'];

const Face = ({ value, side }) => (
    <div className={`die-face die-${side}`}>
        {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className={PIPS[value].includes(i + 1) ? 'pip' : 'pip empty'} />
        ))}
    </div>
);

// One die; `turns` adds whole spins so each roll tumbles forward instead of snapping back
const Die = ({ value, turns, color, delay, onClick }) => {
    const [rx, ry] = FACE_ROTATION[value];
    const style = {
        transform: `rotateX(${rx + turns[0] * 360}deg) rotateY(${ry + turns[1] * 360}deg)`,
        transitionDelay: `${delay}s`
    };
    return (
        <button className={`die-wrap die-${color}`} onClick={onClick} aria-label={`Die showing ${value}. Click to roll.`}>
            <div className="die-float">
                <div className="die" style={style}>
                    {FACES.map(([v, side]) => <Face key={side} value={v} side={side} />)}
                </div>
            </div>
            <div className="die-shadow" />
        </button>
    );
};

const roll = () => 1 + Math.floor(Math.random() * 6);

const Dice = () => {
    const [values, setValues] = useState([3, 5, 1]);
    const [turns, setTurns] = useState([[0, 0], [0, 0], [0, 0]]);
    const [rolling, setRolling] = useState(false);
    const [hasRolled, setHasRolled] = useState(false);
    const timer = useRef(null);

    useEffect(() => () => clearTimeout(timer.current), []);

    const rollAll = () => {
        if (rolling) return;
        setRolling(true);
        setValues([roll(), roll(), roll()]);
        setTurns(prev => prev.map(([x, y]) => [x + 1 + Math.round(Math.random()), y + 1 + Math.round(Math.random())]));
        timer.current = setTimeout(() => {
            setRolling(false);
            setHasRolled(true);
        }, 1500);
    };

    const total = values.reduce((a, b) => a + b, 0);

    return (
        <div className={`dice-tray ${rolling ? 'is-rolling' : ''}`}>
            <div className="dice-row">
                {values.map((v, i) => (
                    <Die key={i} value={v} turns={turns[i]} color={DICE_COLORS[i]} delay={i * 0.08} onClick={rollAll} />
                ))}
            </div>

            <div className="dice-readout" aria-live="polite">
                {!hasRolled || rolling ? (
                    <span className="dice-hint">{rolling ? 'Rolling…' : '↑ Click the dice to roll'}</span>
                ) : (
                    <span>
                        Rolled <b>{values.join(' · ')}</b> = {total}.{' '}
                        <span className="dice-sub">In Muster, every die is a decision.</span>
                    </span>
                )}
            </div>
        </div>
    );
};

export default Dice;
