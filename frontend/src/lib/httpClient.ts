/**
 * 🛡️ HUMAN CHECK:
 * Resilient HTTP client — production grade.
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Timeout via AbortController
 * - Circuit Breaker (extracted to circuit-breaker.ts)
 * - Fail-Fast when backend is down
 * - Request storm protection
 * - Typed errors (zero `any`)
 */

import { getCircuit } from "./circuit-breaker";
import { isError } from "@/utils/error-guard";

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

async function request<T>(
    url: string,
    options: RequestInit,
    retries = 2,
    timeout = 4000
): Promise<T> {
    const circuit = getCircuit(url);

    if (!circuit.canRequest()) {
        throw new Error("CIRCUIT_OPEN");
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
            });

            clearTimeout(id);

            if (!res.ok) {
                if (res.status === 429) throw new Error("RATE_LIMIT");
                if (res.status >= 500) throw new Error("SERVER_ERROR");
                throw new Error("HTTP_ERROR");
            }

            const data = await res.json();

            circuit.success();
            return data;
        } catch (err: unknown) {
            clearTimeout(id);

            // ⚕️ HUMAN CHECK - Replaced `any` with `unknown` + type guards
            const error = isError(err) ? err : new Error(String(err));

            /**
             * TIMEOUT → retry
             */
            if (error.name === "AbortError") {
                if (attempt === retries) {
                    circuit.fail();
                    throw new Error("TIMEOUT");
                }
            }

            /**
             * SERVER ERROR → retry + breaker
             */
            else if (error.message === "SERVER_ERROR") {
                if (attempt === retries) {
                    circuit.fail();
                    throw error;
                }
            }

            /**
             * RATE LIMIT → no aggressive retry
             */
            else if (error.message === "RATE_LIMIT") {
                throw error;
            }

            /**
             * Other errors
             */
            else {
                if (attempt === retries) {
                    circuit.fail();
                    throw error;
                }
            }

            /**
             * Exponential Backoff
             */
            const backoff = 300 * Math.pow(2, attempt);
            await sleep(backoff);
        }
    }

    throw new Error("UNEXPECTED_HTTP_ERROR");
}

/**
 * Public API
 */

export function httpGet<T>(url: string): Promise<T> {
    return request<T>(url, { method: "GET", cache: "no-store" });
}

export function httpPost<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
}
