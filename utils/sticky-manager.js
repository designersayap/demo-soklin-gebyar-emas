"use client";
import React, { useRef, useState, useEffect, Children } from 'react';

/**
 * StickyManager
 * 
 * Manages sticky positioning and stacking for children components.
 * Mimics the logic used in the internal page builder Canvas.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number[]} props.stickyIndices - Array of child indices that should be sticky
 */
export default function StickyManager({ children, stickyIndices = [], stackedIndices = [], blurIndices = [], overlayIndices = [] }) {
    const [offsets, setOffsets] = useState({});
    const refs = useRef({});

    // We strictly use indices for keys to match the render order

    useEffect(() => {
        if (stickyIndices.length === 0) return;

        const updateOffsets = () => {
            let currentOffset = 0;
            const newOffsets = {};
            const winH = typeof window !== 'undefined' ? window.innerHeight : 1000;

            stickyIndices.forEach(index => {
                const el = refs.current[index];
                if (el) {
                    const isStacked = stackedIndices.includes(index);

                    if (isStacked) {
                        // Dynamic top for stacked items (see useStickyStacking for logic details)
                        const height = el.offsetHeight;

                        // We store the calculated top in the offsets map for this index
                        // effectively 'currentOffset' acts as the base sticky pos (e.g. below header)
                        // but we adjust it down (negative) if the element is tall.
                        newOffsets[index] = Math.min(currentOffset, winH - height);
                    } else {
                        newOffsets[index] = currentOffset;
                    }

                    if (!isStacked && !overlayIndices.includes(index)) {
                        currentOffset += el.offsetHeight;
                    }
                }
            });

            // Deep comparison to avoid infinite loops if nothing changed
            setOffsets(prev => {
                const isSame = Object.keys(newOffsets).every(k => newOffsets[k] === prev[k]);
                return isSame ? prev : newOffsets;
            });
        };

        // Create observer
        const resizeObserver = new ResizeObserver(() => {
            updateOffsets();
        });

        // Observe all sticky elements
        stickyIndices.forEach(index => {
            const el = refs.current[index];
            if (el) resizeObserver.observe(el);
        });

        window.addEventListener('resize', updateOffsets);

        // Initial check
        updateOffsets();

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateOffsets);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(stickyIndices), JSON.stringify(stackedIndices)]); // Use stringified to react to array value changes

    // Stacked Blur and Background Effect
    useEffect(() => {
        if (stackedIndices.length === 0) return;

        const handleScroll = () => {
            stackedIndices.forEach(index => {
                const container = refs.current[index];
                if (!container) return;

                const overlay = container.querySelector('.stacked-white-overlay');
                const content = container.querySelector('.stacked-content-blur');
                const isBlurred = blurIndices.includes(index);

                // Start searching for the next visible element (the one that slides over)
                let nextElement = container.nextElementSibling;
                // Skip if no next element found immediately
                if (!nextElement) return;

                // Logic for NON-BLURRED stacked items
                if (!isBlurred) {
                    // Reset effects if they were present
                    if (overlay) overlay.style.opacity = 0;
                    if (content) content.style.filter = 'none';

                    // Enforce White Background on all subsequent siblings
                    let sibling = nextElement;
                    let count = 0;
                    while (sibling && count < 20) {
                        if (sibling.style) {
                            sibling.style.setProperty('background-color', 'var(--background-neutral--default, #ffffff)', 'important');

                            // Ensure the covering element is positioned and has higher z-index than the sticky element (zIndex: 0)
                            // otherwise the sticky element might visually sit on top of the static sibling.
                            const computed = getComputedStyle(sibling);
                            if (computed.position === 'static') {
                                sibling.style.setProperty('position', 'relative', 'important');
                            }
                            // 10 is safe enough to be above 0 but below dropdowns/modals (usually 1000+)
                            sibling.style.setProperty('z-index', '10', 'important');
                        }
                        sibling = sibling.nextElementSibling;
                        count++;
                    }
                    return;
                }

                // Logic for BLURRED stacked items
                const rect = nextElement.getBoundingClientRect();
                const winH = window.innerHeight;

                // Effect range logic
                const startPoint = winH;
                const endPoint = winH * 0.5;
                const current = rect.top;

                let progress = 0;
                if (current < startPoint) {
                    progress = (startPoint - current) / (startPoint - endPoint);
                }
                progress = Math.max(0, Math.min(1, progress));

                // Apply Overlay & Blur
                if (overlay) overlay.style.opacity = progress;
                if (content) content.style.filter = `blur(${progress * 10}px)`;

                // Apply Blur Reveal to Next Component (starts blurred 10px, becomes clear 0px)
                if (nextElement && nextElement.style) {
                    const inverseBlur = (1 - progress) * 10;
                    nextElement.style.filter = `blur(${inverseBlur}px)`;
                }

                // Manage Next Element Background (Transparent -> White)
                // When overlapping (progress < 1), it needs to be transparent to show the blur.
                // When fully scrolled over (progress >= 1), it should be white (or opaque) to signify the end of the section.
                const targetBg = progress >= 1 ? 'var(--background-neutral--default, #ffffff)' : 'transparent';

                let sibling = nextElement;
                let count = 0;
                while (sibling && count < 20) {
                    if (sibling.style) {
                        sibling.style.setProperty('background-color', targetBg, 'important');

                        // Ensure the covering element is positioned and has higher z-index than the sticky element (zIndex: 0)
                        const computed = getComputedStyle(sibling);
                        if (computed.position === 'static') {
                            sibling.style.setProperty('position', 'relative', 'important');
                        }
                        sibling.style.setProperty('z-index', '10', 'important');
                    }
                    sibling = sibling.nextElementSibling;
                    count++;
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        // Initial check
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);

            // Cleanup phase: Reset backgrounds on unmount/update
            stackedIndices.forEach(index => {
                const container = refs.current[index];
                // Clean up multiple siblings
                if (container) {
                    let sibling = container.nextElementSibling;
                    let count = 0;
                    while (sibling && count < 20) {
                        if (sibling.style) {
                            sibling.style.backgroundColor = '';
                            sibling.style.zIndex = '';
                            sibling.style.position = '';
                        }
                        sibling = sibling.nextElementSibling;
                        count++;
                    }
                }
            });
        };
    }, [JSON.stringify(stackedIndices), JSON.stringify(blurIndices)]);

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            {(() => {


                return Children.map(children, (child, index) => {
                    if (!child) return null;

                    const isSticky = stickyIndices.includes(index);
                    const isStacked = stackedIndices.includes(index);
                    const isOverlay = overlayIndices.includes(index);



                    if (!isSticky) {
                        return child;
                    }

                    const topOffset = offsets[index] || 0;

                    return (
                        <div
                            ref={el => refs.current[index] = el}
                            style={{
                                // ...forcedBgStyle, is removed
                                position: 'sticky',
                                top: topOffset,
                                // Invert z-index: Earlier items (higher up) should be on top of later items
                                // This prevents the Navbar from covering the Top Bar during initial load or overlap
                                zIndex: isStacked ? 0 : 100 - index,
                                display: 'flex',
                                flexDirection: 'column',
                                marginBottom: isOverlay ? `-${refs.current[index]?.offsetHeight || 100}px` : undefined
                            }}
                        >
                            {isStacked ? (
                                <>
                                    <div
                                        className="stacked-white-overlay"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor: 'var(--background-neutral--default, #ffffff)',
                                            zIndex: 2,
                                            pointerEvents: 'none',
                                            opacity: 0,
                                        }}
                                    />
                                    <div
                                        className="stacked-content-blur"
                                        style={{
                                            position: 'relative',
                                            zIndex: 1,
                                            width: '100%',
                                            height: '100%',
                                        }}
                                    >
                                        {child}
                                    </div>
                                </>
                            ) : (
                                child
                            )}
                        </div>
                    );
                });
            })()}
        </div>
    );
}
