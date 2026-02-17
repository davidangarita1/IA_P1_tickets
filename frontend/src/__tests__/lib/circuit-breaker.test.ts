import { CircuitBreaker, getCircuit } from "@/lib/circuit-breaker";

describe("CircuitBreaker", () => {
    let breaker: CircuitBreaker;

    beforeEach(() => {
        breaker = new CircuitBreaker(3, 1000); // 3 failures, 1s cooldown
    });

    describe("initial state", () => {
        it("should start in CLOSED state", () => {
            expect(breaker.getState()).toBe("CLOSED");
        });

        it("should allow requests when CLOSED", () => {
            expect(breaker.canRequest()).toBe(true);
        });
    });

    describe("failure tracking", () => {
        it("should stay CLOSED below failure threshold", () => {
            breaker.fail();
            breaker.fail();
            expect(breaker.getState()).toBe("CLOSED");
            expect(breaker.canRequest()).toBe(true);
        });

        it("should open circuit at failure threshold", () => {
            breaker.fail();
            breaker.fail();
            breaker.fail();
            expect(breaker.getState()).toBe("OPEN");
        });

        it("should reject requests when OPEN", () => {
            breaker.fail();
            breaker.fail();
            breaker.fail();
            expect(breaker.canRequest()).toBe(false);
        });
    });

    describe("success resets", () => {
        it("should reset failure count on success", () => {
            breaker.fail();
            breaker.fail();
            breaker.success();
            expect(breaker.getState()).toBe("CLOSED");
            expect(breaker.canRequest()).toBe(true);
        });

        it("should allow requests after reset", () => {
            breaker.fail();
            breaker.fail();
            breaker.success();

            // Need 3 more failures to open again
            breaker.fail();
            breaker.fail();
            expect(breaker.getState()).toBe("CLOSED");
        });
    });

    describe("HALF_OPEN state", () => {
        it("should transition to HALF_OPEN after cooldown", () => {
            jest.useFakeTimers();

            const fastBreaker = new CircuitBreaker(1, 500);
            fastBreaker.fail(); // Opens the circuit

            expect(fastBreaker.getState()).toBe("OPEN");
            expect(fastBreaker.canRequest()).toBe(false);

            // Advance time past cooldown
            jest.advanceTimersByTime(501);

            const canReq = fastBreaker.canRequest();
            expect(canReq).toBe(true);
            expect(fastBreaker.getState()).toBe("HALF_OPEN");

            jest.useRealTimers();
        });
    });
});

describe("getCircuit", () => {
    it("should return the same circuit for the same host", () => {
        const c1 = getCircuit("http://api.example.com/turnos");
        const c2 = getCircuit("http://api.example.com/other");

        expect(c1).toBe(c2);
    });

    it("should return different circuits for different hosts", () => {
        const c1 = getCircuit("http://api.example.com/turnos");
        const c2 = getCircuit("http://other.example.com/turnos");

        expect(c1).not.toBe(c2);
    });

    it("should return a CircuitBreaker instance", () => {
        const circuit = getCircuit("http://test.com/path");
        expect(circuit).toBeInstanceOf(CircuitBreaker);
    });
});
