import { formatTime } from "@/utils/date-formatter";

describe("date-formatter", () => {
    describe("formatTime", () => {
        it("should format a timestamp to HH:MM:SS format", () => {
            // 2026-01-15 14:30:45 UTC
            const timestamp = new Date("2026-01-15T14:30:45Z").getTime();
            const result = formatTime(timestamp);

            // Should contain two colons (HH:MM:SS)
            expect(result.split(":").length).toBe(3);
        });

        it("should return a string with exactly 8 characters (HH:MM:SS)", () => {
            const timestamp = new Date("2026-06-01T09:05:03Z").getTime();
            const result = formatTime(timestamp);

            // Format: "HH:MM:SS" → 8 chars
            expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });

        it("should handle midnight correctly", () => {
            const midnight = new Date("2026-01-01T00:00:00Z").getTime();
            const result = formatTime(midnight);

            expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        });

        it("should handle edge case timestamps", () => {
            const result = formatTime(0); // Unix epoch
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
