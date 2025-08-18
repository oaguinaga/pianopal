<script setup lang="ts">
import type { ColorMode, LabelStyle } from "~/types/piano";

import { useMidi } from "~/composables/use-midi";

// Test data for piano component
const activeNotes = ref<string[]>([]); // Active notes from keyboard/MIDI input

// Piano configuration object
const pianoConfig = reactive({
  octaveRange: 2,
  startOctave: 3,
  labelStyle: "letter" as LabelStyle,
  colorMode: "per-note" as ColorMode,
  showOctaveLabels: false,
  showKeyboardHints: true,
  showKeyboardGuide: true,
  enableMidi: true,
});

const selectedOctaveIndexFromChild = ref<number>(Math.floor((pianoConfig.octaveRange - 1) / 2));

// Listen to explicit child event instead of exposed ref
function onSelectedOctaveChange(idx: number) {
  selectedOctaveIndexFromChild.value = idx;
}

const selectedOctaveForHighlights = computed(() => pianoConfig.startOctave + selectedOctaveIndexFromChild.value);

const highlightedNotes = computed(() => {
  const octave = selectedOctaveForHighlights.value;
  return [
    `C${octave}`,
    `E${octave}`,
    `G${octave}`,
    `B${octave}`,
    `Eb${octave}`,
    `F#${octave}`,
    `Bb${octave}`,
    `C#${octave}`,
  ];
});

const isClient = typeof window !== "undefined";
const audio = isClient ? (await import("~/composables/use-audio-synth")).useAudioSynth() : null;
const audioEnabled = computed(() => Boolean(audio?.audioInitialized.value));

// Use the useMidi composable instead of duplicate MIDI state
const {
  isMidiSupported,
  midiInputs,
  selectedMidiInputId,
  midiError,
  updateMidiInput,
} = useMidi({
  enabled: computed(() => pianoConfig.enableMidi),
  onNoteOn: noteId => handleNoteOn(noteId, "midi"),
  onNoteOff: handleNoteOff,
});

async function handleNoteOn(noteId: string, _source?: "keyboard" | "midi" | "ui") {
  if (!activeNotes.value.includes(noteId))
    activeNotes.value.push(noteId);
  if (audio) {
    // Auto-enable for any source (keyboard, UI, or MIDI). If the browser blocks this for MIDI,
    // the call will simply have no effect and the user can click Enable Audio.
    if (!audio.audioInitialized.value)
      await enableAudio();
    await audio.noteOn(noteId);
  }
}

async function handleNoteOff(noteId: string) {
  activeNotes.value = activeNotes.value.filter(n => n !== noteId);
  if (audio)
    await audio.noteOff(noteId);
}

async function enableAudio() {
  if (!audio)
    return;
  await audio.startAudioContextIfNeeded();
  if (!audio.audioInitialized.value)
    await audio.initAudioChain();
}

// Note playback is triggered directly in handleNoteOn/Off to ensure
// we can gate Tone.start() behind a user gesture via enableAudio().
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2">
        Piano Test Playground
      </h1>
      <p class="text-base-content/70">
        Interactive piano with keyboard input support
      </p>
    </div>

    <!-- Piano Component Test -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title">
          PianoPlayground Component
        </h2>
        <div class="space-y-6">
          <!-- Configuration Panels -->
          <div class="flex justify-end items-start gap-4">
            <!-- Piano Configuration Panel -->
            <piano-config-panel
              :config="pianoConfig"
              :show-octave-options="true"
              :show-display-options="true"
              :show-keyboard-options="true"
              :show-advanced-options="true"
              @update:config="(newConfig) => Object.assign(pianoConfig, newConfig)"
            />

            <!-- Sound Control Panel -->
            <sound-control-panel
              v-if="audio"
              :is-muted="audio.isMuted.value"
              :volume-db="audio.volumeDb.value"
              :reverb-enabled="audio.reverbEnabled.value"
              :room-size="audio.reverbRoomSize.value"
              :low-latency="audio.lowLatency.value"
              :instrument="audio.instrument.value"
              :enabled="audioEnabled"
              :is-midi-supported="isMidiSupported"
              :midi-inputs="midiInputs"
              :selected-midi-input-id="selectedMidiInputId"
              :midi-error="midiError"
              @enable-audio="enableAudio"
              @update:is-muted="audio.setMuted ? audio.setMuted($event) : ($event ? (audio.isMuted.value ? undefined : audio.toggleMute()) : (audio.isMuted.value ? audio.toggleMute() : undefined))"
              @update:volume-db="audio.setVolume($event)"
              @update:reverb-enabled="audio.setReverbEnabled($event)"
              @update:room-size="audio.setReverbRoomSize($event)"
              @update:low-latency="audio.setLowLatency($event)"
              @update:instrument="audio.setInstrument($event)"
              @update:midi-input="updateMidiInput"
            />
          </div>

          <!-- Interactive Piano -->
          <div>
            <h3 class="text-lg font-semibold mb-2">
              Interactive Piano ({{ pianoConfig.octaveRange }} octave{{ pianoConfig.octaveRange !== 1 ? 's' : '' }} starting from octave {{ pianoConfig.startOctave }})
            </h3>
            <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>How to use:</strong> Click on the piano area, then press keyboard keys to play!
                Try pressing 'A' (C4), 'D' (E4), and 'G' (G4) to play a C major chord.
              </p>
            </div>
            <piano-playground
              :octave-range="pianoConfig.octaveRange"
              :start-octave="pianoConfig.startOctave"
              :label-style="pianoConfig.labelStyle"
              :color-mode="pianoConfig.colorMode"
              :show-octave-labels="pianoConfig.showOctaveLabels"
              :show-keyboard-guide="pianoConfig.showKeyboardGuide"
              :show-keyboard-hints="pianoConfig.showKeyboardHints"
              :midi-input="pianoConfig.enableMidi"
              :audio-enabled="audioEnabled"
              :highlighted-notes="highlightedNotes"

              @note-on="handleNoteOn"
              @note-off="handleNoteOff"
              @enable-audio="enableAudio"
              @selected-octave-change="onSelectedOctaveChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
