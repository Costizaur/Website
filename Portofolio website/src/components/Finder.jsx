import React, { useEffect, useRef } from 'react';
import { CaretRight } from '@phosphor-icons/react';
import './Finder.css';

// The Finder view inside the window: folders down the side, the open folder's files as a list
const Finder = ({ categories, category, focusIndex, onSelectCategory, onOpenItem }) => {
    const listRef = useRef(null);

    // Coming back from a project puts focus on the row you came from
    useEffect(() => {
        if (focusIndex == null) return;
        const rows = listRef.current ? listRef.current.querySelectorAll('.file-row') : [];
        if (rows[focusIndex]) rows[focusIndex].focus({ preventScroll: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // On a phone the folders are a scrolling row of tabs: keep the open one in view
    const tabsRef = useRef(null);
    useEffect(() => {
        const tabs = tabsRef.current;
        const active = tabs ? tabs.querySelector('[aria-current="true"]') : null;
        if (!active || tabs.scrollWidth <= tabs.clientWidth) return;
        tabs.scrollTo({ left: active.offsetLeft - (tabs.clientWidth - active.offsetWidth) / 2 });
    }, [category.id]);

    const items = category.images || [];

    return (
        <div className="finder">
            {/* --- SIDEBAR (Category List) --- */}
            <nav className="finder-sidebar" aria-label="Folders">
                <p className="finder-sidebar-title">Categories</p>
                <ul className="finder-tabs" ref={tabsRef}>
                    {categories.map(c => (
                        <li key={c.id}>
                            <button
                                type="button"
                                className="finder-tab"
                                style={{ '--folder': c.color }}
                                title={c.title}
                                aria-current={c.id === category.id ? 'true' : undefined}
                                onClick={() => onSelectCategory(c)}
                            >
                                <span className="mini-folder" aria-hidden="true"></span>
                                <span className="finder-tab-name">{c.title}</span>
                                <span className="finder-tab-count">{c.images.length}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* --- MAIN CONTENT (List of Files) --- */}
            <div className="finder-main">
                <p className="finder-desc">{category.description}</p>

                {items.length === 0 ? (
                    <p className="finder-empty">No items in this folder</p>
                ) : (
                    <ul className="finder-list" ref={listRef}>
                        {items.map((item, index) => {
                            const isColor = typeof item.src === 'string' && item.src.startsWith('#');
                            return (
                                <li key={item.title || index}>
                                    <button type="button" className="file-row" title={item.title} onClick={(e) => onOpenItem(index, e)}>
                                        {/* App icon if the project has one, else a plain tile in the folder colour */}
                                        {item.icon ? (
                                            <img src={item.icon} alt="" className="file-icon" />
                                        ) : (
                                            <span className="file-icon is-blank" style={isColor ? { background: item.src } : undefined}></span>
                                        )}
                                        <span className="file-text">
                                            <span className="file-title">{item.title || `Item ${index + 1}`}</span>
                                            {item.description && <span className="file-desc">{item.description}</span>}
                                        </span>
                                        {item.src && !isColor && (
                                            <img src={item.src} alt="" className="file-shot" loading="lazy" decoding="async" />
                                        )}
                                        <CaretRight className="file-caret" size={16} weight="bold" aria-hidden="true" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Finder;
