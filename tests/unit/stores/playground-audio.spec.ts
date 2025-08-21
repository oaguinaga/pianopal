import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import { usePlaygroundAudioStore } from "~/stores/playground-audio";

// Mock session storage
const mockSessionStorage = {
  getItem: vi.fn().mockReturnValue(null), // Return null by default (no stored value)
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Mock the audio synth composable
const mockAudioSynth = {
  isSupported: { value: true },
  audioInitialized: { value: false },
  isLoading: { value: false },
  setMuted: vi.fn(),
  setVolume: vi.fn(),
  setReverbEnabled: vi.fn(),
  setReverbRoomSize: vi.fn(),
  setLowLatency: vi.fn(),
  setInstrument: vi.fn(),
  startAudioContextIfNeeded: vi.fn(),
  initAudioChain: vi.fn(),
  noteOn: vi.fn(),
  noteOff: vi.fn(),
  releaseAll: vi.fn(),
  cleanup: vi.fn(),
  isContextRunning: vi.fn(() => true),
  getSettings: vi.fn(() => ({
    isMuted: false,
    volumeDb: -12,
    reverbEnabled: false,
    reverbRoomSize: 0.8,
    lowLatency: false,
    instrument: "piano",
  })),
};
vi.mock("~/composables/use-audio-synth", () => ({
  useAudioSynth: vi.fn((_initialSettings) => {
    // Reset mock states for each call if needed
    mockAudioSynth.audioInitialized.value = false;
    return mockAudioSynth;
  }),
}));

describe("audio Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  it("should initialize with default settings", () => {
    const audioStore = usePlaygroundAudioStore();

    expect(audioStore.settings.isMuted).toBe(false);
    expect(audioStore.settings.volumeDb).toBe(-12);
    expect(audioStore.settings.reverbEnabled).toBe(false);
    expect(audioStore.settings.reverbRoomSize).toBe(0.8);
    expect(audioStore.settings.lowLatency).toBe(false);
    expect(audioStore.settings.instrument).toBe("piano");
  });

  it("should load settings from session storage (camelCase)", () => {
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify({
      isMuted: true,
      volumeDb: -20,
      instrument: "polysynth",
    }));

    const audioStore = usePlaygroundAudioStore();

    expect(audioStore.settings.isMuted).toBe(true);
    expect(audioStore.settings.volumeDb).toBe(-20);
    expect(audioStore.settings.instrument).toBe("polysynth");
    // Defaults should be preserved for missing keys
    expect(audioStore.settings.reverbEnabled).toBe(false);
  });

  it("should migrate snake_case settings from session storage", () => {
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify({
      is_muted: true,
      volume_db: -25,
      reverb_enabled: true,
      reverb_room_size: 0.5,
      low_latency: true,
      instrument: "amsynth",
    }));

    const audioStore = usePlaygroundAudioStore();

    expect(audioStore.settings.isMuted).toBe(true);
    expect(audioStore.settings.volumeDb).toBe(-25);
    expect(audioStore.settings.reverbEnabled).toBe(true);
    expect(audioStore.settings.reverbRoomSize).toBe(0.5);
    expect(audioStore.settings.lowLatency).toBe(true);
    expect(audioStore.settings.instrument).toBe("amsynth");
  });

  it("should update mute setting and persist to session storage", async () => {
    const audioStore = usePlaygroundAudioStore();

    audioStore.updateMute(true);

    expect(audioStore.settings.isMuted).toBe(true);

    // Wait for the watcher to trigger persistence
    await nextTick();

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "pianopal-audio-settings",
      expect.stringContaining("\"isMuted\":true"),
    );
  });

  it("should update volume with proper clamping", () => {
    const audioStore = usePlaygroundAudioStore();

    // Test normal volume
    audioStore.updateVolume(-20);
    expect(audioStore.settings.volumeDb).toBe(-20);

    // Test volume too low (should clamp to -60)
    audioStore.updateVolume(-100);
    expect(audioStore.settings.volumeDb).toBe(-60);

    // Test volume too high (should clamp to 0)
    audioStore.updateVolume(10);
    expect(audioStore.settings.volumeDb).toBe(0);
  });

  it("should update reverb room size with proper clamping", () => {
    const audioStore = usePlaygroundAudioStore();

    // Test normal room size
    audioStore.updateReverbRoomSize(0.5);
    expect(audioStore.settings.reverbRoomSize).toBe(0.5);

    // Test room size too low (should clamp to 0)
    audioStore.updateReverbRoomSize(-0.1);
    expect(audioStore.settings.reverbRoomSize).toBe(0);

    // Test room size too high (should clamp to 1)
    audioStore.updateReverbRoomSize(1.5);
    expect(audioStore.settings.reverbRoomSize).toBe(1);
  });

  it("should reset to default settings", async () => {
    const audioStore = usePlaygroundAudioStore();

    // Change some settings
    audioStore.updateMute(true);
    audioStore.updateVolume(-30);
    audioStore.updateInstrument("polysynth");

    // Verify settings were changed
    expect(audioStore.settings.isMuted).toBe(true);
    expect(audioStore.settings.volumeDb).toBe(-30);
    expect(audioStore.settings.instrument).toBe("polysynth");

    // Reset to defaults
    audioStore.resetToDefaults();

    // Wait for reactivity to update
    await nextTick();

    expect(audioStore.settings.isMuted).toBe(false);
    expect(audioStore.settings.volumeDb).toBe(-12);
    expect(audioStore.settings.instrument).toBe("piano");
  });

  it("should handle audio playback gracefully when not initialized", async () => {
    const audioStore = usePlaygroundAudioStore();

    // Should not throw when playing notes before initialization
    await expect(audioStore.playNote("C4")).resolves.not.toThrow();
    await expect(audioStore.stopNote("C4")).resolves.not.toThrow();

    // Should not throw when stopping all notes
    expect(() => audioStore.stopAllNotes()).not.toThrow();
  });

  it("should cleanup audio resources properly", async () => {
    const audioStore = usePlaygroundAudioStore();

    // Initialize audio first
    await audioStore.initializeAudio();

    // Verify audio is initialized
    expect(audioStore.isInitialized).toBe(true);

    // Call cleanup
    audioStore.cleanup();

    // Verify state is reset
    expect(audioStore.isInitialized).toBe(false);
    expect(audioStore.isLoading).toBe(false);
    expect(audioStore.error).toBe(null);

    // Verify the underlying audio instance is nullified
    expect(audioStore.getInstance()).toBe(null);
  });

  it("should preserve mute state during audio initialization", async () => {
    // Mock session storage to return muted state (snake_case for migration test)
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify({
      is_muted: true,
    }));

    const audioStore = usePlaygroundAudioStore();

    // Verify the muted state is loaded from storage
    expect(audioStore.settings.isMuted).toBe(true);

    // Enable audio (which calls initializeAudio and applySettings)
    await audioStore.enableAudio();

    // Verify the audio instance received the muted state
    const audioInstance = audioStore.getInstance();
    expect(audioInstance?.setMuted).toHaveBeenCalledWith(true);
  });
});
