export interface AudioNotifier {
  init(src: string, volume?: number): void;
  unlock(): Promise<void>;
  play(): void;
  isEnabled(): boolean;
}
