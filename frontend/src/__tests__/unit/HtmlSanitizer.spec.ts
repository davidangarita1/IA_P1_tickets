import { HtmlSanitizer } from "@/infrastructure/adapters/HtmlSanitizer";

describe("HtmlSanitizer", () => {
  let sanitizer: HtmlSanitizer;

  beforeEach(() => {
    sanitizer = new HtmlSanitizer();
  });

  it("removes angle brackets", () => {
    expect(sanitizer.sanitize("<div>hello</div>")).toBe("divhello/div");
  });

  it('removes "script" keyword (case-insensitive)', () => {
    expect(sanitizer.sanitize("alert(Script)")).toBe("alert()");
    expect(sanitizer.sanitize("SCRIPT")).toBe("");
    expect(sanitizer.sanitize("ScRiPt")).toBe("");
  });

  it("trims whitespace", () => {
    expect(sanitizer.sanitize("  hello  ")).toBe("hello");
  });

  it("handles combined XSS attempt", () => {
    const input = '<script>alert("xss")</script>';
    const result = sanitizer.sanitize(input);
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result.toLowerCase()).not.toContain("script");
  });

  it("returns empty string for whitespace-only input", () => {
    expect(sanitizer.sanitize("   ")).toBe("");
  });

  it("passes through clean strings unchanged", () => {
    expect(sanitizer.sanitize("Carlos Pérez")).toBe("Carlos Pérez");
  });
});
