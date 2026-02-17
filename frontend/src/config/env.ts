// 🛡️ HUMAN CHECK:
// Se agregó validación runtime para evitar crash si falta variable.
// En producción, la app debe fallar de forma controlada.

function required(name: string, value?: string): string {
    if (!value) {
        throw new Error(`Missing env variable: ${name}`);
    }
    return value;
}

export const env = {
    API_BASE_URL: required(
        "NEXT_PUBLIC_API_BASE_URL",
        process.env.NEXT_PUBLIC_API_BASE_URL
    ),

    // ⚕️ HUMAN CHECK - URL del WebSocket
    // En producción, usar wss:// (WebSocket seguro)
    WS_URL: required(
        "NEXT_PUBLIC_WS_URL",
        process.env.NEXT_PUBLIC_WS_URL
    ),
};

// ⚕️ HUMAN CHECK - Startup validation (FRONT-D2)
// Forces all env vars to be resolved at import time instead of lazily.
// Prevents late crashes when a page accesses an undefined variable.
if (typeof window === "undefined") {
    try {
        Object.values(env);
    } catch (e) {
        console.error("[ENV] Startup validation failed:", e);
    }
}
