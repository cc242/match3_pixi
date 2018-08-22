/* global*/
// This is for cross domain tracking in One C
export let tracked_events = {
    EXAMPLE_TRACKED_EVENT: 'example tracked event',
    TAP_TO_WEBSITE: 'tap to website'
};

/**
 * One Creative tracking bridge
 * @param name
 */
export function trackMe(name) {
    console.log('%c Tracking: '+name+' ', 'background: #ffcc00; color: #000000');
    try {
        var event = new CustomEvent("tracking", {
            detail: {
                label: name
            }
        });
        window.dispatchEvent(event);
    } catch(e) {
        console.log('Failed to track', name, e);
    }
}