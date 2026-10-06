import React from 'react';
import { Play } from '@phosphor-icons/react';
import './Featured.css';
import musterBattle from '../assets/muster-battle.jpg';
import musterPhone from '../assets/muster-phone.jpg';

const FACTS = [
    { value: '~24,000', label: 'bot matches simulated for balance' },
    { value: '5 min', label: 'for a full match' },
    { value: '4', label: 'units in the counter cycle' },
    { value: '3', label: 'dice to spend every turn' }
];

// Featured Muster panel: screenshots on the left, the pitch and the facts on the right
const Featured = ({ onCaseStudy, category }) => {
    return (
        <article className="featured">
            <div className="featured-media">
                <a
                    href="/muster/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="featured-shot"
                    aria-label="Play Muster in your browser"
                >
                    <img
                        src={musterBattle}
                        alt="Muster battle screen: blue and red mages duel while both army lines wait at the sides"
                        width="1600"
                        height="900"
                    />
                </a>
                <img
                    src={musterPhone}
                    alt="Muster running in landscape on a phone"
                    className="featured-phone"
                    width="1600"
                    height="739"
                />
                <span className="featured-sticker" aria-hidden="true">Play it<br />in your<br />browser</span>
            </div>

            <div className="featured-info">
                <p className="featured-meta">
                    <span className="chip" style={{ '--chip-color': category.color }}>{category.title}</span>
                    Featured
                </p>
                <h3 className="featured-title display">Muster</h3>
                <p className="featured-desc">
                    A 5-minute, two-player strategy duel. Roll three dice, spend them to grow your economy and recruit an army, then secretly line up your troops for a battle where counters and wounds decide who holds the line.
                </p>

                {/* Read like the back of a game box: number, then what it means */}
                <dl className="fact-list">
                    {FACTS.map(fact => (
                        <div key={fact.label} className="fact">
                            <dt>{fact.value}</dt>
                            <dd>{fact.label}</dd>
                        </div>
                    ))}
                </dl>

                <div className="featured-actions">
                    <a href="/muster/index.html" target="_blank" rel="noopener noreferrer" className="btn">
                        <Play size={14} weight="fill" aria-hidden="true" /> Play Muster
                    </a>
                    <button type="button" className="btn btn-secondary" onClick={onCaseStudy}>Read case study</button>
                </div>
            </div>
        </article>
    );
};

export default Featured;
