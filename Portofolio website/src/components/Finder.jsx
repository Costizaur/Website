import React, { useState, useEffect } from 'react';
import './Finder.css';
import Folder from './Folder';

const Finder = ({ categories, initialCategory, onClose, onSelectProject }) => {
    const [activeCategory, setActiveCategory] = useState(initialCategory || categories[0]);

    useEffect(() => {
        if (initialCategory) {
            setActiveCategory(initialCategory);
        }
    }, [initialCategory]);

    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    const currentItems = activeCategory ? activeCategory.images : [];

    return (
        <div className="finder-overlay" onClick={onClose}>
            <div className="finder-window" onClick={e => e.stopPropagation()}>
                <div className="finder-header">
                    <div className="window-controls">
                        <div className="control-dot close" onClick={onClose}></div>
                        <div className="control-dot minimize"></div>
                        <div className="control-dot maximize"></div>
                    </div>
                    <div className="finder-title">Projects — {activeCategory ? activeCategory.title : 'All'}</div>
                    <div className="finder-toolbar"></div>
                </div>
                <div className="finder-body">
                    <div className="finder-sidebar">
                        <div className="sidebar-group">
                            <div className="sidebar-title">Categories</div>
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    className={`sidebar-item ${activeCategory.id === category.id ? 'active' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <span className="sidebar-icon">📂</span>
                                    <span className="sidebar-text">{category.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="finder-content">
                        <div className="projects-grid-view">
                            {currentItems.map((item, index) => (
                                <div
                                    key={item.title || index}
                                    className="finder-item"
                                    onClick={() => onSelectProject(activeCategory, index)}
                                >
                                    <div className="finder-item-icon">
                                        {/* If it's a string starting with # or empty, show generic folder/file, else show image thumbnail */}
                                        {typeof item === 'string' || !item.src ? (
                                            <div className="folder-shape"></div>
                                        ) : (
                                            <img src={item.src} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                    </div>
                                    <span className="finder-item-name">{item.title || `Item ${index + 1}`}</span>
                                </div>
                            ))}
                            {currentItems.length === 0 && (
                                <div style={{ color: '#999', padding: '20px', width: '100%', textAlign: 'center' }}>No items in this folder</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finder;
