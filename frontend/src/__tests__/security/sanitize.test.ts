import { sanitizeText } from "@/security/sanitize";

describe("sanitize", () => {
    describe("sanitizeText", () => {
        it("should remove angle brackets", () => {
            expect(sanitizeText("<div>hello</div>")).toBe("divhello/div");
        });

        it("should remove script tags", () => {
            expect(sanitizeText("alert('xss')")).toBe("alert('xss')");
            expect(sanitizeText("<script>alert('xss')</script>")).not.toContain(
                "script"
            );
        });

        it("should trim whitespace", () => {
            expect(sanitizeText("  hello  ")).toBe("hello");
        });

        it("should handle empty strings", () => {
            expect(sanitizeText("")).toBe("");
        });

        it("should preserve normal text", () => {
            expect(sanitizeText("Juan Pérez")).toBe("Juan Pérez");
        });

        it("should handle special characters", () => {
            const input = "María O'Brien";
            expect(sanitizeText(input)).toBe("María O'Brien");
        });

        it("should remove case-insensitive script keywords", () => {
            expect(sanitizeText("SCRIPT")).not.toContain("SCRIPT");
            expect(sanitizeText("Script")).not.toContain("Script");
        });

        it("should handle combined attacks", () => {
            const input = '<script>document.cookie</script>';
            const result = sanitizeText(input);

            expect(result).not.toContain("<");
            expect(result).not.toContain(">");
            expect(result).not.toContain("script");
        });
    });
});
