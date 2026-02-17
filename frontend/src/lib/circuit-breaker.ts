// ⚕️ HUMAN CHECK - Extracted from httpClient.ts to respect SRP
// CircuitBreaker manages connection health per host

type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export class CircuitBreaker {
    private state: CircuitState = "CLOSED";
    private failures = 0;
    private nextTry = 0;

    constructor(
        private failureThreshold = 5,
        private cooldownTime = 10_000 // ms
    ) {}

    canRequest(): boolean {
        if (this.state === "OPEN") {
            if (Date.now() > this.nextTry) {
                this.state = "HALF_OPEN";
                return true;
            }
            return false;
        }
        return true;
    }

    success(): void {
        this.failures = 0;
        this.state = "CLOSED";
    }

    fail(): void {
        this.failures++;

        if (this.failures >= this.failureThreshold) {
            this.state = "OPEN";
            this.nextTry = Date.now() + this.cooldownTime;
        }
    }

    getState(): CircuitState {
        return this.state;
    }
}

/**
 * Global circuit per host (prevents overwhelming backend)
 */
const circuits = new Map<string, CircuitBreaker>();

export function getCircuit(url: string): CircuitBreaker {
    const host = new URL(url, "http://dummy").host;

    if (!circuits.has(host)) {
        circuits.set(host, new CircuitBreaker());
    }

    return circuits.get(host)!;
}
