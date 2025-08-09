import { onUnmounted, ref } from "vue";

type InstrumentId = "piano" | "polysynth" | "amsynth" | "fmsynth" | "membranesynth";

export function useAudioSynth() {
  const isClient = typeof window !== "undefined" && typeof document !== "undefined";

  // Runtime Tone import holder to keep SSR safe
  const ToneRef = ref<any>(null);

  // State
  const audioInitialized = ref(false);
  const isMuted = ref(false);
  const volumeDb = ref(-10); // headroom for stacked voices
  const reverbEnabled = ref(false);
  const reverbRoomSize = ref(0.8);
  const lowLatency = ref(false);
  const instrument = ref<InstrumentId>("piano");

  // Nodes
  let synth: any | null = null;
  let volNode: any | null = null;
  let reverb: any | null = null;
  let blurHandler: (() => void) | null = null;

  async function ensureToneLoaded() {
    if (!isClient)
      return;
    if (!ToneRef.value) {
      const mod = await import("tone");
      // Support both ESM namespace and default export styles
      ToneRef.value = (mod as any).default ?? mod;
    }
  }

  async function startAudioContextIfNeeded() {
    if (!isClient)
      return;
    await ensureToneLoaded();
    if (!ToneRef.value)
      return;
    // Gate on user gesture: caller should invoke this inside a click/tap handler
    await ToneRef.value.start();
  }

  async function testBeep(durationSec = 0.2, freq = 440) {
    if (!isClient)
      return;
    await ensureToneLoaded();
    const Tone = ToneRef.value;
    const osc = new Tone.Oscillator({ frequency: freq, type: "sine" }).toDestination();
    osc.start();
    await new Promise(resolve => setTimeout(resolve, durationSec * 1000));
    osc.stop();
    osc.disconnect();
  }

  function createSynthById(id: InstrumentId) {
    const Tone = ToneRef.value;
    switch (id) {
      case "piano": {
        // Acoustic piano using Salamander samples hosted by Tone.js
        // Sparse multisample map for reasonable load time
        const sampler = new Tone.Sampler({
          urls: {
            "A0": "A0.mp3",
            "C1": "C1.mp3",
            "D#1": "Ds1.mp3",
            "F#1": "Fs1.mp3",
            "A1": "A1.mp3",
            "C2": "C2.mp3",
            "D#2": "Ds2.mp3",
            "F#2": "Fs2.mp3",
            "A2": "A2.mp3",
            "C3": "C3.mp3",
            "D#3": "Ds3.mp3",
            "F#3": "Fs3.mp3",
            "A3": "A3.mp3",
            "C4": "C4.mp3",
            "D#4": "Ds4.mp3",
            "F#4": "Fs4.mp3",
            "A4": "A4.mp3",
            "C5": "C5.mp3",
            "D#5": "Ds5.mp3",
            "F#5": "Fs5.mp3",
            "A5": "A5.mp3",
            "C6": "C6.mp3",
            "D#6": "Ds6.mp3",
            "F#6": "Fs6.mp3",
            "A6": "A6.mp3",
            "C7": "C7.mp3",
            "D#7": "Ds7.mp3",
            "F#7": "Fs7.mp3",
            "A7": "A7.mp3",
            "C8": "C8.mp3",
          },
          baseUrl: "https://tonejs.github.io/audio/salamander/",
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
        try {
          (synth as any)?.releaseAll?.();
        }
        catch {}
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
    if (!audioInitialized.value)
      return;
    if (!synth)
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
    if (!audioInitialized.value)
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
    const wasInitialized = audioInitialized.value;
    if (wasInitialized) {
      const prevVol = volNode;
      synth?.disconnect();
      synth?.dispose?.();
      synth = createSynthById(id);
      const maybeConnect = async () => {
        if (synth && "loaded" in synth && typeof (synth as any).loaded?.then === "function") {
          try {
            await (synth as any).loaded;
          }
          catch {}
        }
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

  function setLowLatency(enabled: boolean) {
    lowLatency.value = enabled;
    const Tone = ToneRef.value;
    if (!Tone)
      return;
    // Adjust scheduling lookAhead instead of trying to mutate context.latencyHint (getter-only)
    const transport = typeof Tone.getTransport === "function" ? Tone.getTransport() : Tone.Transport;
    if (transport) {
      transport.lookAhead = enabled ? 0.005 : 0.05;
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
    testBeep,
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
