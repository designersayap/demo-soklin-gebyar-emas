
/**
 * Creates an update handler function for component props
 * @param {Function} onUpdate - The component's onUpdate callback
 */
export const createUpdateHandler = (onUpdate) => (key) => (value) => {
    onUpdate?.({ [key]: value });
};

export const openDialog = (id) => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lunar:open-dialog', { detail: { id } }));
    }
};
