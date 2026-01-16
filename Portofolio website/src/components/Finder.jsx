import React, { useState, useEffect } from 'react';
import './Finder.css';
import Folder from './Folder';

const Finder = ({ categories, initialCategory, onClose, onSelectProject }) => {
    // Current folder being viewed (e.g., "UI/UX Design")
    const [activeCategory, setActiveCategory] = useState(initialCategory || categories[0]);

    // Update active folder if prop changes
    useEffect(() => {
        if (initialCategory) {
            setActiveCategory(initialCategory);
        }
    }, [initialCategory]);

    // Switch folders via sidebar
    const handleCategoryClick = (category) => {
        setActiveCategory(category);
    };

    // Get list of items in current folder
    const currentItems = activeCategory ? activeCategory.images : [];

    return (
        <div className="finder-overlay" onClick={onClose}>
            {/* Main Window */}
            <div className="finder-window" onClick={e => e.stopPropagation()}>

                {/* --- HEADER (Traffic Lights + Title) --- */}
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
                    {/* --- SIDEBAR (Category List) --- */}
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

                    {/* --- MAIN CONTENT (Grid of Files) --- */}
                    <div className="finder-content">
                        <div className="projects-grid-view">
                            {currentItems.map((item, index) => (
                                <div
                                    key={item.title || index}
                                    className="finder-item"
                                    onClick={() => onSelectProject(activeCategory, index)}
                                >
                                    <div className="finder-item-icon">
                                        {/* Show Image Thumbnail or Generic Folder Icon */}
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
