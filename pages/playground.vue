<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

import type { ColorMode, LabelStyle } from "~/types/piano";

import { useMidi } from "~/composables/use-midi";
import { DEFAULT_OCTAVE, DEFAULT_OCTAVE_RANGE } from "~/constants/piano";
import { usePlaygroundAudioStore } from "~/stores/playground-audio";
import { useScalePracticeStore } from "~/stores/scale-practice";
import { blurTargetOrActiveElementOnChange } from "~/utils/dom";
import { getScaleNotes } from "~/utils/scale-utils";

// Test data for piano component
const activeNotes = ref<string[]>([]); // Active notes from keyboard/MIDI input

// Piano configuration object
const pianoConfig = reactive({
  octaveRange: DEFAULT_OCTAVE_RANGE,
  startOctave: DEFAULT_OCTAVE,
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

// Use the scale practice store
const scalePracticeStore = useScalePracticeStore();

// Update highlightedNotes to use scale practice notes from store
const highlightedNotes = computed(() => {
  // If we have an active scale practice session, highlight those notes
  if (scalePracticeStore.sessionState !== "idle" && scalePracticeStore.currentScale) {
    // Map scale notes to the format expected by the piano component
    const notes = scalePracticeStore.currentScale.notes.map((note) => {
      return `${note.note}${note.octave}`;
    });

    return notes;
  }

  // I want the fallback to be the c scale notes
  const C_SCALE_NOTES = getScaleNotes("C", "major");
  return C_SCALE_NOTES.map((note) => {
    return `${note.note}${note.octave}`;
  });
});

// Use the global audio store for synchronized audio settings
const playgroundAudioStore = usePlaygroundAudioStore();

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

// No more wrapper functions needed - store actions are called directly in template

// Simplified audio handlers using the store
async function handleNoteOn(noteId: string, _source?: "keyboard" | "midi" | "ui") {
  // Track active notes for visual feedback
  if (!activeNotes.value.includes(noteId)) {
    activeNotes.value.push(noteId);
  }

  // Play note through the audio store (handles all audio logic)
  await playgroundAudioStore.playNote(noteId);
}

async function handleNoteOff(noteId: string) {
  // Remove from active notes
  activeNotes.value = activeNotes.value.filter(n => n !== noteId);

  // Stop note through the audio store
  await playgroundAudioStore.stopNote(noteId);
}

// Audio control functions using the store
async function enableAudio() {
  await playgroundAudioStore.enableAudio();
}

function toggleMute(event: Event) {
  playgroundAudioStore.updateMute(!playgroundAudioStore.settings.isMuted);
  blurTargetOrActiveElementOnChange(event);
}

// Note playback is triggered directly in handleNoteOn/Off to ensure
// we can gate Tone.start() behind a user gesture via enableAudio().

// Preload the audio instance on mount so the Enable Audio button
// can start the context immediately within the user gesture.
onMounted(() => {
  playgroundAudioStore.preload();
});
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
        <div class="space-y-6">
          <!-- Audio Status Display -->
          <client-only>
            <div v-if="playgroundAudioStore.error" class="alert alert-error mb-4">
              <Icon name="hugeicons:alert-triangle" size="20" />
              <span>{{ playgroundAudioStore.error }}</span>
              <button
                class="btn btn-sm btn-ghost"
                @click="playgroundAudioStore.resetToDefaults"
              >
                Reset Audio
              </button>
            </div>
          </client-only>

          <!-- Configuration Panel -->
          <div class="flex justify-end">
            <!-- add a music off/on toggle here -->
            <!-- <client-only> -->
            <client-only>
              <div class="form-control">
                <label class="label cursor-pointer justify-start gap-3 text-base-content p-2">
                  <input
                    type="checkbox"
                    class="checkbox checkbox-sm hidden"
                    :checked="playgroundAudioStore.settings.isMuted"
                    @change="toggleMute"
                  >
                  <Icon
                    v-if="playgroundAudioStore.settings.isMuted"
                    name="hugeicons:volume-off"
                    size="24"
                  />
                  <Icon
                    v-else
                    name="hugeicons:volume-high"
                    size="24"
                  />
                </label>
              </div>
            </client-only>
            <client-only>
              <piano-config-panel
                :config="pianoConfig"
                :show-octave-options="true"
                :show-display-options="true"
                :show-keyboard-options="true"
                :show-advanced-options="false"
                @update:config="(newConfig) => Object.assign(pianoConfig, newConfig)"
              />
            </client-only>
            <client-only>
              <sound-control-panel
                :is-muted="playgroundAudioStore.settings.isMuted"
                :volume-db="playgroundAudioStore.settings.volumeDb"
                :reverb-enabled="playgroundAudioStore.settings.reverbEnabled"
                :reverb-room-size="playgroundAudioStore.settings.reverbRoomSize"
                :low-latency="playgroundAudioStore.settings.lowLatency"
                :instrument="playgroundAudioStore.settings.instrument"
                :enabled="playgroundAudioStore.audioReady"
                :is-midi-supported="isMidiSupported"
                :midi-inputs="midiInputs"
                :selected-midi-input-id="selectedMidiInputId"
                :midi-error="midiError"
                @enable-audio="enableAudio"
                @update:is-muted="playgroundAudioStore.updateMute"
                @update:volume-db="playgroundAudioStore.updateVolume"
                @update:reverb-enabled="playgroundAudioStore.updateReverbEnabled"
                @update:reverb-room-size="playgroundAudioStore.updateReverbRoomSize"
                @update:low-latency="playgroundAudioStore.updateLowLatency"
                @update:instrument="playgroundAudioStore.updateInstrument"
                @update:midi-input="updateMidiInput"
              />
            </client-only>
          </div>

          <!-- Interactive Piano -->
          <div>
            <!-- <h3 class="text-lg font-semibold mb-2">
              Interactive Piano ({{ pianoConfig.octaveRange }} octave{{ pianoConfig.octaveRange !== 1 ? 's' : '' }} starting from octave {{ pianoConfig.startOctave }})
            </h3>
            <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>How to use:</strong> Click on the piano area, then press keyboard keys to play!
                Try pressing 'A' (C4), 'D' (E4), and 'G' (G4) to play a C major chord.
              </p>
            </div> -->
            <piano-playground
              :octave-range="pianoConfig.octaveRange"
              :start-octave="pianoConfig.startOctave"
              :label-style="pianoConfig.labelStyle"
              :color-mode="pianoConfig.colorMode"
              :show-octave-labels="pianoConfig.showOctaveLabels"
              :show-keyboard-guide="pianoConfig.showKeyboardGuide"
              :show-keyboard-hints="pianoConfig.showKeyboardHints"
              :midi-input="pianoConfig.enableMidi"
              :audio-enabled="playgroundAudioStore.audioReady"
              :highlighted-notes="highlightedNotes"

              @note-on="handleNoteOn"
              @note-off="handleNoteOff"
              @enable-audio="enableAudio"
              @selected-octave-change="onSelectedOctaveChange"
            />
          </div>

          <!-- Scale Practice Components -->
          <div class="mt-8 space-y-6">
            <h3 class="text-lg font-semibold text-base-content">
              🎼 Scale Practice Mode
            </h3>

            <!-- Scale Selection Component -->
            <div class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <scale-selection
                  :selected-root="scalePracticeStore.practiceSettings.root"
                  :selected-scale-type="scalePracticeStore.practiceSettings.scale"
                  :selected-tempo="scalePracticeStore.practiceSettings.bpm"
                  @root-change="scalePracticeStore.handleRootChange"
                  @scale-type-change="scalePracticeStore.handleScaleTypeChange"
                  @tempo-change="scalePracticeStore.handleTempoChange"
                  @start-practice="scalePracticeStore.handleStartPractice"
                />
              </div>
            </div>

            <!-- Scale Practice Session (when active) -->
            <div v-if="scalePracticeStore.sessionState !== 'idle'" class="card bg-base-200 shadow-lg">
              <div class="card-body">
                <h4 class="card-title text-center">
                  🎵 Practice Session: {{ scalePracticeStore.practiceSettings.root }} {{ scalePracticeStore.practiceSettings.scale }} Scale
                </h4>

                <div class="text-center space-y-4">
                  <p class="text-lg">
                    <strong>Current Scale:</strong> {{ scalePracticeStore.practiceSettings.root }} {{ scalePracticeStore.practiceSettings.scale }}
                  </p>
                  <p class="text-lg">
                    <strong>Tempo:</strong> {{ scalePracticeStore.practiceSettings.bpm }} BPM
                  </p>

                  <!-- Scale Notes Display -->
                  <div v-if="scalePracticeStore.currentScale && scalePracticeStore.currentScale.notes.length > 0" class="p-4 bg-base-100 rounded-box">
                    <h5 class="font-medium text-base-content mb-3">
                      Scale Notes (Highlighted on Piano):
                    </h5>
                    <div class="flex flex-wrap justify-center gap-2">
                      <span
                        v-for="(note, index) in scalePracticeStore.currentScale!.notes"
                        :key="`${note.note}${note.octave}`"
                        class="badge badge-primary badge-lg"
                      >
                        {{ note.note }}{{ note.octave }}
                        <span class="ml-2 text-xs opacity-70">({{ index + 1 }})</span>
                      </span>
                    </div>
                  </div>

                  <p class="text-sm text-base-content/70">
                    💡 Use the piano above to practice! The scale notes will be highlighted on the piano keys.
                  </p>
                </div>

                <!-- Practice Controls -->
                <div class="flex justify-center gap-4 mt-6">
                  <button
                    class="btn btn-error"
                    @click="scalePracticeStore.resetPracticeToDefaults"
                  >
                    Stop Practice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
