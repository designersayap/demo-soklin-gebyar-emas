"use client";

import { createContext, useContext, useState, useEffect } from "react";

export const BuilderSelectionContext = createContext({
    selectedElementIds: [],
    toggleElementSelection: () => { },
    activeElementId: null,
    setActiveElementId: () => { },
    activePopoverId: null,
    setActivePopoverId: () => { }
});

export function BuilderSelectionProvider({ children }) {
    const [activeElementId, setActiveElementId] = useState(null);
    const [activePopoverId, setActivePopoverId] = useState(null);

    // Close overlay/popover when clicking outside
    useEffect(() => {
        const handleWindowClick = (e) => {
            if (e.target.closest('[data-builder-ui]')) return;
            setActiveElementId(null);
            setActivePopoverId(null);
        };

        window.addEventListener('click', handleWindowClick);
        return () => window.removeEventListener('click', handleWindowClick);
    }, []);

    return (
        <BuilderSelectionContext.Provider value={{
            activeElementId,
            setActiveElementId,
            activePopoverId,
            setActivePopoverId,
            selectedElementIds: children.props?.value?.selectedElementIds || [],
            toggleElementSelection: children.props?.value?.toggleElementSelection || (() => { })
        }}>
            {children}
        </BuilderSelectionContext.Provider>
    );
}

export function useBuilderSelection() {
    return useContext(BuilderSelectionContext);
}

/**
 * Calculate popover position within viewport bounds
 */
export function calculatePopoverPosition(triggerRect, options = {}) {
    const { width = 362, height = 500, padding = 12 } = options;

    let left = triggerRect.right + padding;
    let top = triggerRect.top;

    // Flip to left if overflows right
    if (left + width > window.innerWidth) {
        left = triggerRect.left - width - padding;
    }

    // Clamp to viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - width - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - height - padding));

    return { top, left };
}
