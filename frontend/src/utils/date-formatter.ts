// ⚕️ HUMAN CHECK - Centralized date formatting (FRONT-B7)
// Eliminates duplicate formatTime functions across pages

/**
 * Formats a timestamp to readable time (HH:MM:SS)
 */
export function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
}
