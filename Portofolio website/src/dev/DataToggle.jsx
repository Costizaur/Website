import React from 'react';

// DEV ONLY. Shown when the URL has ?data=..., to flip between the real projects and
// the stress-test sets in stressData.js. Plain on purpose: it is not part of the design.
const STATES = [
    ['demo', 'Demo data'],
    ['worst', 'Worst case'],
    ['empty', 'Empty'],
    ['one', 'One'],
    ['many', '40 rows']
];

const DataToggle = () => {
    const current = new URLSearchParams(window.location.search).get('data');
    if (!current) return null;

    return (
        <div style={{
            position: 'fixed', left: '50%', bottom: 12, transform: 'translateX(-50%)', zIndex: 800,
            display: 'flex', gap: 2, padding: 3, borderRadius: 8, background: '#d4d4d4',
            font: '12px/1 system-ui, sans-serif', boxShadow: '0 2px 8px rgba(0,0,0,.4)'
        }}>
            {STATES.map(([value, label]) => (
                <a
                    key={value}
                    href={`?data=${value}#projects`}
                    style={{
                        padding: '6px 10px', borderRadius: 6, color: '#111', whiteSpace: 'nowrap',
                        background: current === value ? '#fff' : 'transparent'
                    }}
                >
                    {label}
                </a>
            ))}
        </div>
    );
};

export default DataToggle;
