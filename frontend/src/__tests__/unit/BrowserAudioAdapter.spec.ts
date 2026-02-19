import { BrowserAudioAdapter } from "@/infrastructure/adapters/BrowserAudioAdapter";

describe("BrowserAudioAdapter", () => {
  let adapter: BrowserAudioAdapter;
  let mockPlay: jest.Mock;
  let mockPause: jest.Mock;
  let listeners: Record<string, () => void>;

  beforeEach(() => {
    mockPlay = jest.fn().mockResolvedValue(undefined);
    mockPause = jest.fn();
    listeners = {};

    jest.spyOn(globalThis, "Audio").mockImplementation(
      () =>
        ({
          play: mockPlay,
          pause: mockPause,
          volume: 0,
          preload: "",
          currentTime: 0,
          addEventListener: jest.fn((event: string, cb: () => void) => {
            listeners[event] = cb;
          }),
        }) as unknown as HTMLAudioElement
    );

    adapter = new BrowserAudioAdapter();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("starts with audio disabled", () => {
    expect(adapter.isEnabled()).toBe(false);
  });

  it("initializes audio element with src and volume", () => {
    adapter.init("/sounds/ding.mp3", 0.6);

    expect(Audio).toHaveBeenCalledWith("/sounds/ding.mp3");
  });

  it("does not create multiple audio elements on repeated init", () => {
    adapter.init("/sounds/ding.mp3");
    adapter.init("/sounds/ding.mp3");

    expect(Audio).toHaveBeenCalledTimes(1);
  });

  it("unlocks audio on user interaction", async () => {
    adapter.init("/sounds/ding.mp3");

    await adapter.unlock();

    expect(mockPlay).toHaveBeenCalled();
    expect(mockPause).toHaveBeenCalled();
    expect(adapter.isEnabled()).toBe(true);
  });

  it("does not play when not enabled", () => {
    adapter.init("/sounds/ding.mp3");
    listeners["canplaythrough"]?.();

    adapter.play();

    expect(mockPlay).not.toHaveBeenCalled();
  });

  it("plays sound when enabled and ready", async () => {
    adapter.init("/sounds/ding.mp3");
    listeners["canplaythrough"]?.();
    await adapter.unlock();
    mockPlay.mockClear();

    adapter.play();

    expect(mockPlay).toHaveBeenCalledTimes(1);
  });

  it("handles play failure gracefully during unlock", async () => {
    adapter.init("/sounds/ding.mp3");
    mockPlay.mockRejectedValueOnce(new Error("NotAllowedError"));

    await adapter.unlock();

    expect(adapter.isEnabled()).toBe(false);
  });
});
