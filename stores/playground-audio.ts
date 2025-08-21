import { defineStore } from "pinia";
import { computed, ref, shallowRef } from "vue";

import type { AudioEngine, AudioSettings, InstrumentId } from "~/types/playground-audio";

import { useSessionStorage } from "~/composables/use-session-storage";
import { DEFAULT_REVERB_ROOM_SIZE, DEFAULT_VOLUME_DB } from "~/constants/audio";

// Default settings matching PRD requirements
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  isMuted: false,
  volumeDb: DEFAULT_VOLUME_DB,
  reverbEnabled: false,
  reverbRoomSize: DEFAULT_REVERB_ROOM_SIZE,
  lowLatency: false,
  instrument: "piano",
};

export const usePlaygroundAudioStore = defineStore("playground-audio", () => {
  // Session storage for persistence (as per PRD requirement)
  const settingsStorage = useSessionStorage("pianopal-audio-settings", DEFAULT_AUDIO_SETTINGS);
  const settingsRef = settingsStorage.value;

  // Other reactive state
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Audio instance singleton
  const audioRef = shallowRef<AudioEngine | null>(null);

  const chainInitialized = computed(() => audioRef.value?.audioInitialized.value ?? false);
  const contextRunning = computed(() => audioRef.value?.isContextRunning?.() ?? false);
  const audioReady = computed(() => chainInitialized.value && contextRunning.value);

  /**
   * Initialize audio system with lazy loading
   */
  async function initializeAudio() {
    if (audioRef.value)
      return audioRef.value;

    try {
      isLoading.value = true;
      error.value = null;

      const { useAudioSynth } = await import("~/composables/use-audio-synth");

      const instance = useAudioSynth({
        isMuted: settingsRef.value.isMuted,
        volumeDb: settingsRef.value.volumeDb,
        reverbEnabled: settingsRef.value.reverbEnabled,
        reverbRoomSize: settingsRef.value.reverbRoomSize,
        lowLatency: settingsRef.value.lowLatency,
        instrument: settingsRef.value.instrument,
      });
      audioRef.value = instance;

      isInitialized.value = true;
      return instance;
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown audio error";
      error.value = `Failed to initialize audio: ${errorMessage}`;
      console.error("Audio initialization failed:", err);
      throw err;
    }
    finally {
      isLoading.value = false;
    }
  }

  function preload() {
    if (!audioRef.value)
      void initializeAudio();
  }

  /**
   * Apply stored settings to the audio instance
   */
  async function applySettings() {
    if (!audioRef.value)
      return;

    try {
      audioRef.value.setMuted(settingsRef.value.isMuted);
      audioRef.value.setVolume(settingsRef.value.volumeDb);
      audioRef.value.setReverbEnabled(settingsRef.value.reverbEnabled);
      audioRef.value.setLowLatency(settingsRef.value.lowLatency);
      audioRef.value.setInstrument(settingsRef.value.instrument);
    }
    catch (err) {
      console.warn("Failed to apply audio settings:", err);
    }
  }

  /**
   * Enable audio with user gesture compliance
   */
  async function enableAudio() {
    try {
      if (!audioRef.value)
        await initializeAudio();

      if (!audioRef.value)
        throw new Error("Failed to initialize audio instance");

      await audioRef.value.startAudioContextIfNeeded();

      if (!audioRef.value.audioInitialized.value)
        await audioRef.value.initAudioChain();

      await applySettings();
      error.value = null;
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to enable audio";
      error.value = errorMessage;
      console.error("Failed to enable audio:", err);
      throw err;
    }
  }

  // Setting update functions
  function updateMute(isMuted: boolean) {
    settingsRef.value.isMuted = isMuted;
    audioRef.value?.setMuted(isMuted);
  }

  function updateVolume(volumeDb: number) {
    const clampedVolume = Math.max(-60, Math.min(0, volumeDb));
    settingsRef.value.volumeDb = clampedVolume;
    audioRef.value?.setVolume(clampedVolume);
  }

  function updateReverbEnabled(enabled: boolean) {
    settingsRef.value.reverbEnabled = enabled;
    audioRef.value?.setReverbEnabled(enabled);
  }

  function updateReverbRoomSize(roomSize: number) {
    const clampedSize = Math.max(0, Math.min(1, roomSize));
    settingsRef.value.reverbRoomSize = clampedSize;
  }

  function updateLowLatency(lowLatency: boolean) {
    settingsRef.value.lowLatency = lowLatency;
    audioRef.value?.setLowLatency(lowLatency);
  }

  function updateInstrument(instrument: InstrumentId) {
    settingsRef.value.instrument = instrument;
    audioRef.value?.setInstrument(instrument);
  }

  /**
   * Play a note
   */
  async function playNote(noteId: string) {
    try {
      if (!audioRef.value)
        await initializeAudio();

      if (!audioRef.value)
        throw new Error("Audio instance not available");

      if (!audioRef.value.audioInitialized.value)
        await enableAudio();

      await audioRef.value.noteOn(noteId);
    }
    catch (err) {
      console.warn(`Failed to play note ${noteId}:`, err);
    }
  }

  /**
   * Stop playing a note
   */
  async function stopNote(noteId: string) {
    try {
      if (audioRef.value)
        await audioRef.value.noteOff(noteId);
    }
    catch (err) {
      console.warn(`Failed to stop note ${noteId}:`, err);
    }
  }

  /**
   * Stop all currently playing notes
   */
  function stopAllNotes() {
    try {
      if (audioRef.value)
        audioRef.value.releaseAll();
    }
    catch (err) {
      console.warn("Failed to stop all notes:", err);
    }
  }

  /**
   * Reset settings to defaults
   */
  function resetToDefaults() {
    Object.assign(settingsRef.value, DEFAULT_AUDIO_SETTINGS);
    if (audioRef.value)
      applySettings();
  }

  function getInstance() {
    return audioRef.value;
  }

  /**
   * Cleanup audio resources and reset state
   */
  function cleanup() {
    if (audioRef.value) {
      audioRef.value.cleanup();
      audioRef.value = null;
    }
    isInitialized.value = false;
    isLoading.value = false;
    error.value = null;
  }

  return {
    // State
    settings: computed(() => settingsRef.value),
    isInitialized,
    isLoading,
    error,

    // Computed
    chainInitialized,
    contextRunning,
    audioReady,

    // Actions
    initializeAudio,
    preload,
    enableAudio,
    playNote,
    stopNote,
    stopAllNotes,
    resetToDefaults,
    cleanup,

    // Settings
    updateMute,
    updateVolume,
    updateReverbEnabled,
    updateReverbRoomSize,
    updateLowLatency,
    updateInstrument,

    // Advanced
    getInstance,
  };
});
