import { InputSanitizer } from "@/domain/ports/InputSanitizer";

export class HtmlSanitizer implements InputSanitizer {
  sanitize(input: string): string {
    return input
      .replace(/[<>]/g, "")          // XSS: elimina etiquetas HTML
      .replace(/script/gi, "")       // XSS: elimina keyword script
      .replace(/\$[a-zA-Z]+/g, "")   // NoSQL injection: elimina operadores $gt, $where, $regex, etc.
      .replace(/__proto__|prototype|constructor/gi, "") // Prototype pollution
      .trim();
  }
}
