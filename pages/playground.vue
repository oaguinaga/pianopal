<script setup lang="ts">
import type { ColorMode, LabelStyle } from "~/types/piano";

import { blurTargetOrActiveElementOnChange } from "~/utils/dom";
// Test data for piano component
const activeNotes = ref<string[]>([]); // Active notes from keyboard/MIDI input

// Test configuration options
const testOctaveRange = ref(2);
const testStartOctave = ref(3);
const testLabelStyle = ref<LabelStyle>("letter");
const testColorMode = ref<ColorMode>("per-note");
const testShowOctaveLabels = ref(false);
const testShowKeyboardHints = ref(true);
const testShowKeyboardGuide = ref(true);
const testEnableMidi = ref(true);

const selectedOctaveIndexFromChild = ref<number>(Math.floor((testOctaveRange.value - 1) / 2));

// Listen to explicit child event instead of exposed ref
function onSelectedOctaveChange(idx: number) {
  selectedOctaveIndexFromChild.value = idx;
}

const selectedOctaveForHighlights = computed(() => testStartOctave.value + selectedOctaveIndexFromChild.value);

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
        Piano Playground
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
          <!-- Interactive Test Controls -->
          <div class="bg-base-200 p-4 rounded-lg">
            <h3 class="text-lg font-semibold mb-4">
              Configuration
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Octave Range</span>
                </label>
                <select
                  v-model="testOctaveRange"
                  class="select select-bordered"
                  @change="blurTargetOrActiveElementOnChange"
                >
                  <option :value="1">
                    1 Octave
                  </option>
                  <option :value="2">
                    2 Octaves
                  </option>
                  <option :value="3">
                    3 Octaves
                  </option>
                  <option :value="4">
                    4 Octaves
                  </option>
                  <option :value="7">
                    7 Octaves
                  </option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Start Octave</span>
                </label>
                <select
                  v-model="testStartOctave"
                  class="select select-bordered"
                  @change="blurTargetOrActiveElementOnChange"
                >
                  <option :value="1">
                    Octave 1
                  </option>
                  <option :value="2">
                    Octave 2
                  </option>
                  <option :value="3">
                    Octave 3
                  </option>
                  <option :value="4">
                    Octave 4
                  </option>
                  <option :value="5">
                    Octave 5
                  </option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Label Style</span>
                </label>
                <select
                  v-model="testLabelStyle"
                  class="select select-bordered"
                  @change="blurTargetOrActiveElementOnChange"
                >
                  <option value="letter">
                    Letter (C, D, E...)
                  </option>
                  <option value="do-re-mi">
                    Do Re Mi
                  </option>
                  <option value="none">
                    No Labels
                  </option>
                </select>
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Color Mode</span>
                </label>
                <select
                  v-model="testColorMode"
                  class="select select-bordered"
                  @change="blurTargetOrActiveElementOnChange"
                >
                  <option value="per-note">
                    Per-Note Colors
                  </option>
                  <option value="mono">
                    Mono Color
                  </option>
                </select>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Show Keyboard Guide</span>
                  <input
                    v-model="testShowKeyboardGuide"
                    type="checkbox"
                    class="checkbox"
                    @change="blurTargetOrActiveElementOnChange"
                  >
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Show Octave Numbers</span>
                  <input
                    v-model="testShowOctaveLabels"
                    type="checkbox"
                    class="checkbox"
                    @change="blurTargetOrActiveElementOnChange"
                  >
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Show Keyboard Hints</span>
                  <input
                    v-model="testShowKeyboardHints"
                    type="checkbox"
                    class="checkbox"
                    @change="blurTargetOrActiveElementOnChange"
                  >
                </label>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Enable MIDI (if supported)</span>
                  <input
                    v-model="testEnableMidi"
                    type="checkbox"
                    class="checkbox"
                    @change="blurTargetOrActiveElementOnChange"
                  >
                </label>
              </div>
            </div>
          </div>

          <div class="mt-6">
            <ClientOnly>
              <sound-control-panel
                v-if="audio"
                :is-muted="audio.isMuted.value"
                :volume-db="audio.volumeDb.value"
                :reverb-enabled="audio.reverbEnabled.value"
                :room-size="audio.reverbRoomSize.value"
                :low-latency="audio.lowLatency.value"
                :instrument="audio.instrument.value"
                :enabled="audioEnabled"
                @enable-audio="enableAudio"
                @update:is-muted="audio.setMuted ? audio.setMuted($event) : ($event ? (audio.isMuted.value ? undefined : audio.toggleMute()) : (audio.isMuted.value ? audio.toggleMute() : undefined))"
                @update:volume-db="audio.setVolume($event)"
                @update:reverb-enabled="audio.setReverbEnabled($event)"
                @update:room-size="audio.setReverbRoomSize($event)"
                @update:low-latency="audio.setLowLatency($event)"
                @update:instrument="audio.setInstrument($event)"
              />
            </ClientOnly>
          </div>

          <!-- Interactive Piano -->
          <div>
            <h3 class="text-lg font-semibold mb-2">
              Interactive Piano ({{ testOctaveRange }} octave{{ testOctaveRange !== 1 ? 's' : '' }} starting from octave {{ testStartOctave }})
            </h3>
            <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>How to use:</strong> Click on the piano area, then press keyboard keys to play!
                Try pressing 'A' (C4), 'D' (E4), and 'G' (G4) to play a C major chord.
              </p>
            </div>
            <piano-playground
              :octave-range="testOctaveRange"
              :start-octave="testStartOctave"
              :label-style="testLabelStyle"
              :color-mode="testColorMode"
              :show-octave-labels="testShowOctaveLabels"
              :show-keyboard-guide="testShowKeyboardGuide"
              :show-keyboard-hints="testShowKeyboardHints"
              :midi-input="testEnableMidi"
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
