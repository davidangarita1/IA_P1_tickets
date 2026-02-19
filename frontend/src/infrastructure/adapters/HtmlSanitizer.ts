import { InputSanitizer } from "@/domain/ports/InputSanitizer";

export class HtmlSanitizer implements InputSanitizer {
  sanitize(input: string): string {
    return input
      .replace(/[<>]/g, "")
      .replace(/script/gi, "")
      .trim();
  }
}
