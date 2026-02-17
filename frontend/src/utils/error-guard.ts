// ⚕️ HUMAN CHECK - Utility for type-safe error handling across the frontend
// Replaces all `any` types in catch blocks with `unknown` + type guards

/**
 * Type guard: checks if a value is an Error instance
 */
export function isError(e: unknown): e is Error {
    return e instanceof Error;
}

/**
 * Extracts a message string from any unknown error
 */
export function getErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "UNKNOWN_ERROR";
}

/**
 * Socket.IO error type — replaces `Error | any`
 */
export type SocketError = Error | { message: string } | string;

/**
 * Extracts message from a Socket.IO error
 */
export function getSocketErrorMessage(err: SocketError): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (typeof err === "object" && "message" in err) return err.message;
    return "Unknown connection error";
}

/**
 * Maps HTTP client error codes to user-friendly messages.
 * ⚕️ HUMAN CHECK - Extracted from useAppointmentRegistration (FRONT-B2)
 */
export function getUserErrorMessage(err: unknown): string {
    const code = err instanceof Error ? err.message : "UNKNOWN_ERROR";

    switch (code) {
        case "TIMEOUT":
            return "The server took too long. Please try again.";
        case "RATE_LIMIT":
            return "Too many requests. Please wait a few seconds.";
        case "HTTP_ERROR":
        case "SERVER_ERROR":
            return "Server error. Please try later.";
        case "CIRCUIT_OPEN":
            return "Server temporarily unavailable. Retrying...";
        default:
            return "Could not register the appointment.";
    }
}
