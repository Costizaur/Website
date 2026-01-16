import { useState } from 'react';
import './Folder.css';

// --- HELPER FUNCTION ---
// Darkens a hex color code by a given percentage
// Used to create the "back" of the folder which is in shadow
const darkenColor = (hex, percent) => {
    let color = hex.startsWith('#') ? hex.slice(1) : hex;
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }
    const num = parseInt(color, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Apply dimming
    r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
    g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
    b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));

    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder = ({ color = '#5227FF', size = 1, items = [], className = '', transparentPapers = false }) => {
    // We show up to 3 "papers" popping out of the folder
    const maxItems = 3;
    const papers = items.slice(0, maxItems);

    // Fill remaining slots with nulls if fewer than 3 items
    while (papers.length < maxItems) {
        papers.push(null);
    }

    const [open, setOpen] = useState(false);

    // Tracks mouse movement over papers for a "magnetic" parallax effect
    const [paperOffsets, setPaperOffsets] = useState(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 })));

    // Generate color variants
    const folderBackColor = darkenColor(color, 0.08);
    const paper1 = transparentPapers ? 'transparent' : darkenColor('#ffffff', 0.1);
    const paper2 = transparentPapers ? 'transparent' : darkenColor('#ffffff', 0.05);
    const paper3 = transparentPapers ? 'transparent' : '#ffffff';

    const handleClick = () => {
        setOpen(prev => !prev);
        if (open) {
            setPaperOffsets(Array.from({ length: maxItems }, () => ({ x: 0, y: 0 }))); // Reset on close
        }
    };

    // Calculate parallax offset based on mouse position
    const handlePaperMouseMove = (e, index) => {
        if (!open) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const offsetX = (e.clientX - centerX) * 0.15;
        const offsetY = (e.clientY - centerY) * 0.15;
        setPaperOffsets(prev => {
            const newOffsets = [...prev];
            newOffsets[index] = { x: offsetX, y: offsetY };
            return newOffsets;
        });
    };

    const handlePaperMouseLeave = (e, index) => {
        setPaperOffsets(prev => {
            const newOffsets = [...prev];
            newOffsets[index] = { x: 0, y: 0 }; // Reset when mouse leaves
            return newOffsets;
        });
    };

    // CSS Variables for dynamic coloring
    const folderStyle = {
        '--folder-color': color,
        '--folder-back-color': folderBackColor,
        '--paper-1': paper1,
        '--paper-2': paper2,
        '--paper-3': paper3
    };

    const folderClassName = `folder ${open ? 'open' : ''}`.trim();
    const scaleStyle = { transform: `scale(${size})` };

    return (
        <div style={scaleStyle} className={className}>
            <div className={folderClassName} style={folderStyle} onClick={handleClick}>
                <div className="folder__back">
                    {/* Render the 3 paper inserts */}
                    {papers.map((item, i) => (
                        <div
                            key={i}
                            className={`paper paper-${i + 1}`}
                            onMouseMove={e => handlePaperMouseMove(e, i)}
                            onMouseLeave={e => handlePaperMouseLeave(e, i)}
                            style={
                                open
                                    ? {
                                        // Apply the calculated magnetic offset
                                        '--magnet-x': `${paperOffsets[i]?.x || 0}px`,
                                        '--magnet-y': `${paperOffsets[i]?.y || 0}px`
                                    }
                                    : {}
                            }
                        >
                            {item}
                        </div>
                    ))}

                    {/* Front Flap of the folder */}
                    <div className="folder__front"></div>
                    <div className="folder__front right"></div>
                </div>
            </div>
        </div>
    );
};

export default Folder;
