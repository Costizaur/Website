import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CaretRight, X } from '@phosphor-icons/react';
import Finder from './Finder';
import Modal from './Modal';
import './ProjectWindow.css';

// One window for the whole journey: a folder's file list (Finder) and, inside the same
// frame, the project you open from it (Modal). It is a native <dialog>, which traps
// focus, closes on Escape and makes the page behind it inert.
const ProjectWindow = ({ categories, win, onNavigate, onClose }) => {
    const dialogRef = useRef(null);
    const titleRef = useRef(null);
    const pressedBackdrop = useRef(false);
    const lastItem = useRef(null);
    const [closing, setClosing] = useState(false);
    // Which way the view inside the window last changed: 'forward' into a project, 'back' out of it
    const [direction, setDirection] = useState('none');
    const [instant] = useState(Boolean(win.instant));

    const category = categories.find(c => c.id === win.categoryId) || categories[0];
    const item = win.itemIndex == null ? null : category.images[win.itemIndex];
    const count = category.images.length;
    const inProject = Boolean(item);

    // Open as a modal, growing out of the spot that was clicked
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog.open) dialog.showModal();
        if (win.origin) {
            const rect = dialog.getBoundingClientRect();
            dialog.style.transformOrigin = `${win.origin.x - rect.left}px ${win.origin.y - rect.top}px`;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Opening a project moves focus to its title, so it is announced and Tab carries on from there
    useEffect(() => {
        if (inProject) titleRef.current.focus({ preventScroll: true });
    }, [inProject]);

    // Mouse and touch get a short slide between the list and a project; the keyboard gets none
    const showCategory = (next) => onNavigate({ categoryId: next.id, itemIndex: null });
    const openItem = (index, e) => {
        setDirection(e && e.detail === 0 ? 'none' : 'forward');
        onNavigate({ categoryId: category.id, itemIndex: index });
    };
    const back = (e) => {
        lastItem.current = win.itemIndex;
        setDirection(e && e.detail === 0 ? 'none' : 'back');
        onNavigate({ categoryId: category.id, itemIndex: null });
    };

    // Play the closing animation first, then really close
    const requestClose = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            dialogRef.current.close();
        } else {
            setClosing(true);
        }
    };

    // Escape closes straight away: keyboard actions are never made to wait for an animation
    const handleCancel = (e) => {
        e.preventDefault();
        dialogRef.current.close();
    };

    const handleAnimationEnd = (e) => {
        if (closing && e.target === dialogRef.current) dialogRef.current.close();
    };

    // A click on the dim area closes the window, but only if the press started there too
    const handlePointerDown = (e) => {
        pressedBackdrop.current = e.target === dialogRef.current;
    };

    const handleClick = (e) => {
        if (pressedBackdrop.current && e.target === dialogRef.current) requestClose();
    };

    return (
        <dialog
            ref={dialogRef}
            className={`window ${closing ? 'is-closing' : ''} ${instant ? 'is-instant' : ''}`}
            style={{ '--folder': category.color }}
            aria-labelledby="window-title"
            onCancel={handleCancel}
            onClose={onClose}
            onAnimationEnd={handleAnimationEnd}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
        >
            {/* Title bar */}
            <header className="window-bar">
                <div className="window-bar-side">
                    {inProject ? (
                        <button type="button" className="window-btn" onClick={back} aria-label={`Back to ${category.title}`}>
                            <ArrowLeft size={18} weight="bold" aria-hidden="true" />
                        </button>
                    ) : (
                        <span className="window-bar-icon" aria-hidden="true"><span className="mini-folder"></span></span>
                    )}
                </div>
                <h2 id="window-title" ref={titleRef} tabIndex={-1} className="window-title" title={inProject ? item.title : category.title}>
                    {inProject ? item.title : category.title}
                </h2>
                <div className="window-bar-side is-end">
                    <button type="button" className="window-btn" onClick={requestClose} aria-label="Close window">
                        <X size={18} weight="bold" aria-hidden="true" />
                    </button>
                </div>
            </header>

            <div className="window-body" data-direction={direction}>
                {inProject ? (
                    <Modal key={`${category.id}-${win.itemIndex}`} category={category} item={item} />
                ) : (
                    <Finder
                        categories={categories}
                        category={category}
                        focusIndex={lastItem.current}
                        onSelectCategory={showCategory}
                        onOpenItem={openItem}
                    />
                )}
            </div>

            {/* Path bar, like the one along the bottom of a Finder window */}
            <footer className="window-path">
                <p className="window-crumbs">
                    <span>Projects</span>
                    <CaretRight size={12} weight="bold" aria-hidden="true" />
                    {inProject ? (
                        <>
                            <button type="button" className="window-crumb" onClick={back}>{category.title}</button>
                            <CaretRight size={12} weight="bold" aria-hidden="true" />
                            <span className="is-current">{item.title}</span>
                        </>
                    ) : (
                        <span className="is-current">{category.title}</span>
                    )}
                </p>
                <p className="window-count">
                    {inProject ? `${win.itemIndex + 1} of ${count}` : `${count} ${count === 1 ? 'item' : 'items'}`}
                </p>
            </footer>
        </dialog>
    );
};

export default ProjectWindow;
