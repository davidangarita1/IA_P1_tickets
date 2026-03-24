import { AudioNotifier } from "@/domain/ports/AudioNotifier";

export class BrowserAudioAdapter implements AudioNotifier {
  private audio: HTMLAudioElement | null = null;
  private enabled = false;
  private ready = false;

  init(src: string, volume = 0.6): void {
    if (this.audio) return;

    this.audio = new Audio(src);
    this.audio.volume = volume;
    this.audio.preload = "auto";

    this.audio.addEventListener("canplaythrough", () => {
      this.ready = true;
    });
  }

  async unlock(): Promise<void> {
    if (!this.audio || this.enabled) return;

    try {
      await this.audio.play();
      this.audio.pause();
      this.audio.currentTime = 0;
      this.enabled = true;
    } catch {
      this.enabled = false;
    }
  }

  play(): void {
    if (!this.audio || !this.enabled || !this.ready) return;

    try {
      this.audio.currentTime = 0;
      const promise = this.audio.play();
      if (promise !== undefined) {
        promise.catch(() => {});
      }
    } catch {}
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}
