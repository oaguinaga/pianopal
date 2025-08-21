import type { Ref } from "vue";

/**
 * Defines the available musical instruments.
 */
export type InstrumentId = "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth";

/**
 * Represents the settings for the audio synthesizer.
 * These settings are persisted in session storage.
 */
export type AudioSettings = {
  isMuted: boolean;
  volumeDb: number;
  reverbEnabled: boolean;
  reverbRoomSize: number;
  lowLatency: boolean;
  instrument: InstrumentId;
};

/**
 * Defines the interface for the audio engine controls.
 */
export type AudioEngine = {
  isSupported: Ref<boolean>;
  audioInitialized: Ref<boolean>;
  isLoading: Ref<boolean>;
  initAudioChain: () => Promise<void>;
  noteOn: (note: string, velocity?: number) => Promise<void>;
  noteOff: (note: string) => Promise<void>;
  releaseAll: () => void;
  getSettings: () => AudioSettings;
  startAudioContextIfNeeded: () => Promise<void>;
  isContextRunning: () => boolean;
  setMuted: (isMuted: boolean) => void;
  setVolume: (volumeDb: number) => void;
  setReverbEnabled: (enabled: boolean) => void;
  setReverbRoomSize: (roomSize: number) => void;
  setLowLatency: (lowLatency: boolean) => void;
  setInstrument: (instrument: InstrumentId) => void;
  cleanup: () => void;
  toggleMute: () => void;
};
