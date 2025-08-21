import { ref } from "vue";

import type { AudioEngine, AudioSettings, InstrumentId } from "~/types/playground-audio";

import { useClientModule } from "~/composables/use-client-module";
import { DEFAULT_REVERB_ROOM_SIZE, DEFAULT_VOLUME_DB, LOOKAHEAD_LOW, LOOKAHEAD_NORMAL } from "~/constants/audio";
import { PIANO_SALAMANDER_MAP, SALAMANDER_BASE_URL } from "~/constants/piano";

export function useAudioSynth(initialSettings?: Partial<AudioSettings>): AudioEngine {
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";
  const isSupported = ref(isClient && (!!window.AudioContext || !!(window as any).webkitAudioContext));

  // SSR-safe Tone loader
  const ToneRef = ref<any>(null);
  const toneLoader = useClientModule<any>();

  // State
  const audioInitialized = ref(false);
  const isLoading = ref(false);
  const isMuted = ref(initialSettings?.isMuted ?? false);
  const volumeDb = ref(initialSettings?.volumeDb ?? DEFAULT_VOLUME_DB);
  const reverbEnabled = ref(initialSettings?.reverbEnabled ?? false);
  const reverbRoomSize = ref(initialSettings?.reverbRoomSize ?? DEFAULT_REVERB_ROOM_SIZE);
  const lowLatency = ref(initialSettings?.lowLatency ?? false);
  const instrument = ref<InstrumentId>(initialSettings?.instrument ?? "piano");

  // Nodes
  let synth: any | null = null;
  let volNode: any | null = null;
  let reverb: any | null = null;
  let masterGain: any | null = null;
  let blurHandler: (() => void) | null = null;

  /**
   * Dynamically import Tone on the client and memoize it in ToneRef.
   * Prevents SSR crashes and defers heavy code until audio is needed.
   */
  async function ensureToneLoaded() {
    if (!isClient)
      return;
    if (!ToneRef.value) {
      const mod = await toneLoader.load(() => import("tone"));
      ToneRef.value = mod;
    }
  }

  /** Ensure the WebAudio context is running (call from a user gesture). */
  async function startAudioContextIfNeeded() {
    if (!isClient)
      return;
    await ensureToneLoaded();
    if (!ToneRef.value)
      return;
    // Gate on user gesture: caller should invoke this inside a click/tap handler
    await ToneRef.value.start();
  }

  /**
   * Create the active instrument instance.
   * The optional config param allows injecting custom instruments for tests or extension.
   */
  function createSynthById(
    id: InstrumentId,
    config?: {
      Tone?: any;
      pianoSamplerUrls?: Record<string, string>;
      pianoBaseUrl?: string;
    },
  ) {
    const Tone = config?.Tone ?? ToneRef.value;
    switch (id) {
      case "piano": {
        // Acoustic piano using Salamander samples hosted by Tone.js
        // Sparse multisample map for reasonable load time
        const sampler = new Tone.Sampler({
          urls: config?.pianoSamplerUrls ?? PIANO_SALAMANDER_MAP,
          baseUrl: config?.pianoBaseUrl ?? SALAMANDER_BASE_URL,
          release: 1,
        });
        return sampler;
      }
      case "amsynth":
        return new Tone.PolySynth(Tone.AMSynth);
      case "fmsynth":
        return new Tone.PolySynth(Tone.FMSynth);
      case "membranesynth":
        return new Tone.PolySynth(Tone.MembraneSynth);
      case "polysynth":
      default:
        return new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "triangle" },
          envelope: { attack: 0.02, decay: 0.12, sustain: 0.7, release: 0.35 },
        });
    }
  }

  /**
   * Create audio nodes and connect the chain:
   *  synth -> Volume (dry) -> Destination
   *                \-> Freeverb (wet) -> Destination
   */
  async function initAudioChain() {
    if (!isClient)
      return;
    await ensureToneLoaded();
    if (!ToneRef.value)
      return;

    const Tone = ToneRef.value;

    // Create nodes (default to audible state)
    synth = createSynthById(instrument.value);
    volNode = new Tone.Volume(volumeDb.value);
    reverb = new Tone.Freeverb({ roomSize: reverbRoomSize.value, wet: reverbEnabled.value ? 0.2 : 0 });

    // Connect chain with parallel dry/wet paths so dry signal is heard even when reverb is off
    // Route both dry and wet paths through a master gain to guarantee global mute
    masterGain = new Tone.Gain(1);
    masterGain.toDestination();

    synth.connect(volNode);
    volNode.connect(masterGain);
    volNode.connect(reverb);
    reverb.connect(masterGain);

    // Apply master mute via gain (0 when muted, 1 otherwise)
    if (masterGain)
      masterGain.gain.value = isMuted.value ? 0 : 1;

    audioInitialized.value = true;

    // Note: warm-up was causing edge-case muting during first key press.
    // If needed later, reintroduce with a safer strategy.

    // Safety: release all on window blur to prevent hung notes
    if (!blurHandler) {
      blurHandler = () => {
        releaseAll();
      };
      if (typeof window !== "undefined")
        window.addEventListener("blur", blurHandler);
    }
  }

  function disposeChain() {
    if (synth) {
      try {
        synth.disconnect();
        synth.dispose?.();
      }
      catch {}
      synth = null;
    }
    if (volNode) {
      try {
        volNode.disconnect();
        volNode.dispose?.();
      }
      catch {}
      volNode = null;
    }
    if (reverb) {
      try {
        reverb.disconnect();
        reverb.dispose?.();
      }
      catch {}
      reverb = null;
    }
    if (masterGain) {
      try {
        masterGain.disconnect();
        masterGain.dispose?.();
      }
      catch {}
      masterGain = null;
    }
  }

  async function noteOn(noteId: string) {
    if (!isClient)
      return;
    await ensureToneLoaded();
    if (!audioInitialized.value || !synth)
      return;
    // Ensure context is running; do not block on sample load to avoid missed plays
    try {
      await startAudioContextIfNeeded();
    }
    catch {}
    try {
      if (instrument.value === "piano") {
        // Sampler behaves like a real piano: sustain until key up
        synth.triggerAttack?.(noteId);
      }
      else {
        // For synth engines, avoid stuck notes by using short TAR
        synth.triggerAttackRelease?.(noteId, "8n");
      }
    }
    catch {}
  }

  async function noteOff(noteId: string) {
    if (!isClient)
      return;
    await ensureToneLoaded();
    if (!audioInitialized.value || !synth)
      return;
    if (!synth)
      return;
    try {
      // Release for sampler (piano) or synths that support it
      synth.triggerRelease?.(noteId);
    }
    catch {}
  }

  function releaseAll() {
    try {
      (synth as any)?.releaseAll?.();
    }
    catch {}
  }

  function setInstrument(id: InstrumentId) {
    instrument.value = id;
    if (!ToneRef.value)
      return;
    // Recreate synth maintaining chain
    if (audioInitialized.value) {
      isLoading.value = true; // Start loading indicator
      const prevVol = volNode;
      synth?.disconnect();
      synth?.dispose?.();
      synth = createSynthById(id);
      /**
       * Reconnect the newly created synth to the existing Volume/FX chain.
       * Some instruments (e.g., Tone.Sampler) expose a `loaded` Promise that
       * resolves when remote assets (samples) have finished loading. We await
       * that if present to avoid connecting/playing before assets are ready.
       */
      /** Wait for the synth to load its samples (if applicable). */
      async function waitForSynthLoaded(current: any) {
        const isPromiseLike
          = current && "loaded" in current && typeof (current as any).loaded?.then === "function";

        if (isPromiseLike) {
          try {
            await (current as any).loaded;
          }
          catch (err) {
            if (import.meta.dev)
              console.error("Synth load failed:", err);
          }
        }
      }

      const maybeConnect = async () => {
        try {
          await waitForSynthLoaded(synth);
          if (prevVol)
            synth.connect(prevVol);
        }
        finally {
          isLoading.value = false; // Stop loading indicator
        }
      };
      // Fire and forget
      void maybeConnect();
    }
  }

  function setVolume(db: number) {
    volumeDb.value = db;
    if (volNode)
      volNode.volume.value = db;
  }

  function toggleMute() {
    setMuted(!isMuted.value);
  }

  function setMuted(muted: boolean) {
    isMuted.value = muted;
    // Drive mute via master gain so all branches are affected
    if (masterGain) {
      masterGain.gain.value = muted ? 0 : 1;
    }
  }

  function setReverbEnabled(enabled: boolean) {
    reverbEnabled.value = enabled;
    if (reverb)
      reverb.wet.value = enabled ? 0.5 : 0;
  }

  function setReverbRoomSize(size: number) {
    reverbRoomSize.value = size;
    if (reverb) {
      try {
        reverb.roomSize = size;
      }
      catch (err) {
        console.warn("Cannot set reverb roomSize (read-only property):", err);
        // Note: In some Tone.js versions, roomSize is read-only after creation
        // You would need to recreate the reverb effect to change room size
      }
    }
  }

  /** Adjust scheduling lookAhead for perceived latency. */
  function setLowLatency(enabled: boolean) {
    lowLatency.value = enabled;
    const Tone = ToneRef.value;
    if (!Tone)
      return;
    // Adjust scheduling lookAhead instead of trying to mutate context.latencyHint (getter-only)
    const transport = typeof Tone.getTransport === "function" ? Tone.getTransport() : Tone.Transport;
    if (transport) {
      transport.lookAhead = enabled ? LOOKAHEAD_LOW : LOOKAHEAD_NORMAL;
    }
  }

  /**
   * Check if the underlying AudioContext is running (autoplay policy satisfied)
   */
  function isContextRunning(): boolean {
    const Tone = ToneRef.value;
    if (!Tone)
      return false;
    const ctx = typeof Tone.getContext === "function" ? Tone.getContext() : (Tone as any).context;
    const state = ctx?.rawContext?.state ?? ctx?.state;
    return state === "running";
  }

  /**
   * Explicit cleanup function to replace onUnmounted hook.
   * Call this manually when you want to dispose the audio system.
   * Safe to call multiple times.
   */
  function cleanup() {
    // Remove window blur event listener if it was registered
    if (typeof window !== "undefined" && blurHandler) {
      window.removeEventListener("blur", blurHandler);
      blurHandler = null;
    }

    // Dispose the audio chain
    disposeChain();

    // Reset state
    audioInitialized.value = false;
  }

  function getSettings(): AudioSettings {
    return {
      isMuted: isMuted.value,
      volumeDb: volumeDb.value,
      reverbEnabled: reverbEnabled.value,
      reverbRoomSize: reverbRoomSize.value,
      lowLatency: lowLatency.value,
      instrument: instrument.value,
    };
  }

  return {
    // state
    isSupported,
    audioInitialized,
    isLoading,
    // lifecycle / context
    startAudioContextIfNeeded,
    initAudioChain,
    releaseAll,
    cleanup,
    // controls
    noteOn,
    noteOff,
    setInstrument,
    setVolume,
    toggleMute,
    setMuted,
    setReverbEnabled,
    setReverbRoomSize,
    setLowLatency,
    isContextRunning,
    getSettings,
  };
}
