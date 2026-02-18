describe("AudioService", () => {
    let audioService: { init: Function; unlock: Function; play: Function; isEnabled: Function };

    // Mock HTMLAudioElement
    const mockPlay = jest.fn().mockResolvedValue(undefined);
    const mockPause = jest.fn();
    const mockAddEventListener = jest.fn();

    beforeEach(() => {
        jest.resetModules();

        // Mock the Audio constructor
        global.Audio = jest.fn().mockImplementation(() => ({
            play: mockPlay,
            pause: mockPause,
            addEventListener: mockAddEventListener,
            volume: 0,
            preload: "",
            currentTime: 0,
        })) as unknown as typeof Audio;

        mockPlay.mockClear();
        mockPause.mockClear();
        mockAddEventListener.mockClear();

        // Fresh import each time (singleton reset)
        const mod = require("@/infrastructure/AudioService");
        audioService = mod.audioService;
    });

    it("should not be enabled before init", () => {
        expect(audioService.isEnabled()).toBe(false);
    });

    it("should create Audio element on init", () => {
        audioService.init("/sounds/ding.mp3", 0.6);
        expect(global.Audio).toHaveBeenCalledWith("/sounds/ding.mp3");
    });

    it("should not recreate Audio on second init", () => {
        audioService.init("/sounds/ding.mp3");
        audioService.init("/sounds/ding.mp3");

        // Audio constructor called only once
        expect(global.Audio).toHaveBeenCalledTimes(1);
    });

    it("should enable after successful unlock", async () => {
        audioService.init("/sounds/ding.mp3");
        await audioService.unlock();

        expect(mockPlay).toHaveBeenCalled();
        expect(mockPause).toHaveBeenCalled();
        expect(audioService.isEnabled()).toBe(true);
    });

    it("should not enable if unlock fails", async () => {
        mockPlay.mockRejectedValueOnce(new Error("Autoplay blocked"));

        audioService.init("/sounds/ding.mp3");
        await audioService.unlock();

        expect(audioService.isEnabled()).toBe(false);
    });

    it("should not play if not enabled", () => {
        audioService.init("/sounds/ding.mp3");
        audioService.play();

        // play() should not be called through the public play method
        // because isEnabled is false (unlock not called)
        // The mock was only called if unlock was called first
        expect(mockPlay).not.toHaveBeenCalled();
    });
});
