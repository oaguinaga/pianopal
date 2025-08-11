import { onUnmounted, ref } from "vue";

import { useClientModule } from "~/composables/use-client-module";
import { PIANO_SALAMANDER_MAP, SALAMANDER_BASE_URL } from "~/constants/piano";

/**
 * Identifier for available instruments.
 * - "piano" uses a Sampler with Salamander samples
 * - others are PolySynth wrappers with gentle defaults
 */
type InstrumentId = "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth";

export function useAudioSynth() {
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";

  // SSR-safe Tone loader
  const ToneRef = ref<any>(null);
  const toneLoader = useClientModule<any>();

  // State
  const audioInitialized = ref(false);
  const isMuted = ref(false);
  // Fixed configuration constants (UPPER_SNAKE_CASE)
  const DEFAULT_VOLUME_DB = -10; // headroom for stacked voices
  const DEFAULT_REVERB_ROOM_SIZE = 0.8;
  const LOOKAHEAD_LOW = 0.005 as const;
  const LOOKAHEAD_NORMAL = 0.05 as const;

  const volumeDb = ref(DEFAULT_VOLUME_DB);
  const reverbEnabled = ref(false);
  const reverbRoomSize = ref(DEFAULT_REVERB_ROOM_SIZE);
  const lowLatency = ref(false);
  const instrument = ref<InstrumentId>("piano");

  // Nodes
  let synth: any | null = null;
  let volNode: any | null = null;
  let reverb: any | null = null;
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
    synth.connect(volNode);
    volNode.toDestination();
    volNode.connect(reverb);
    reverb.toDestination();

    // Ensure not muted by default
    isMuted.value = false;
    volNode.mute = false;

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
        await waitForSynthLoaded(synth);
        if (prevVol)
          synth.connect(prevVol);
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
    isMuted.value = !isMuted.value;
    if (volNode)
      volNode.mute = isMuted.value;
  }

  function setMuted(muted: boolean) {
    isMuted.value = muted;
    if (volNode)
      volNode.mute = muted;
  }

  function setReverbEnabled(enabled: boolean) {
    reverbEnabled.value = enabled;
    if (reverb)
      reverb.wet.value = enabled ? 0.5 : 0;
  }

  function setReverbRoomSize(size: number) {
    reverbRoomSize.value = size;
    if (reverb)
      reverb.roomSize = size;
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

  onUnmounted(() => {
    if (typeof window !== "undefined" && blurHandler) {
      window.removeEventListener("blur", blurHandler);
      blurHandler = null;
    }
    disposeChain();
  });

  return {
    // state
    audioInitialized,
    isMuted,
    volumeDb,
    reverbEnabled,
    reverbRoomSize,
    lowLatency,
    instrument,
    // lifecycle / context
    ensureToneLoaded,
    startAudioContextIfNeeded,
    initAudioChain,
    disposeChain,
    releaseAll,
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
  };
}
