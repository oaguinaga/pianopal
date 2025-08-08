<script setup lang="ts">
import type { ColorMode, LabelStyle } from "~/types/piano";

import { blurTargetOrActiveElementOnChange } from "~/utils/dom";
// Test data for piano component
const activeNotes = ref<string[]>([]); // Active notes from keyboard input

// Test configuration options
const testOctaveRange = ref(3);
const testStartOctave = ref(3);
const testLabelStyle = ref<LabelStyle>("letter");
const testColorMode = ref<ColorMode>("per-note");
const testShowOctaveLabels = ref(false);
const testShowKeyboardGuide = ref(true);

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
}); // Highlight notes using the currently selected octave
// removed local handleConfigChange in favor of reusable util

function handleNoteOn(noteId: string) {
  if (!activeNotes.value.includes(noteId)) {
    activeNotes.value.push(noteId);
  }
  console.warn("Note on:", noteId);
}

function handleNoteOff(noteId: string) {
  activeNotes.value = activeNotes.value.filter(n => n !== noteId);
  console.warn("Note off:", noteId);
}
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
            </div>
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
              :highlighted-notes="highlightedNotes"
              @note-on="handleNoteOn"
              @note-off="handleNoteOff"
              @selected-octave-change="onSelectedOctaveChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
