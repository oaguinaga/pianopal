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
  // Practice mode visual options
  showScaleHighlights: true,
  showNextNoteHint: true,
  showSuccessAnimation: true,
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
  // If we have a scale selected (regardless of session state), highlight those notes
  if (scalePracticeStore.currentScale) {
    // Map scale notes to the format expected by the piano component
    const notes = scalePracticeStore.currentScale.notes.map((note) => {
      return `${note.note}${note.octave}`;
    });

    return notes;
  }

  // Fallback to C major scale notes
  const C_SCALE_NOTES = getScaleNotes("C", "major");
  return C_SCALE_NOTES.map((note) => {
    return `${note.note}${note.octave}`;
  });
});

// Visual feedback for guided practice
const hintNotes = computed(() => {
  // Show current expected note as a hint during practice
  if (scalePracticeStore.expectedNote && scalePracticeStore.sessionState === "playing") {
    const note = scalePracticeStore.expectedNote;
    const noteId = `${note.note}${note.octave}`;
    return [noteId];
  }
  return [];
});

const successNotes = computed(() => {
  // Use the store's shouldShowSuccess function to determine which notes to animate
  const notes = [];

  // Check all possible notes (we'll check the most recently played ones)
  if (scalePracticeStore.practiceHistory.length > 0) {
    const recentEvents = scalePracticeStore.practiceHistory.slice(-3); // Check last 3 events
    for (const event of recentEvents) {
      const noteId = `${event.note}${event.octave}`;
      if (scalePracticeStore.shouldShowSuccess(noteId)) {
        notes.push(noteId);
      }
    }
  }

  return notes;
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
  // Play note through the audio store (handles all audio logic)
  await playgroundAudioStore.playNote(noteId);

  // Record note for practice validation if in practice mode
  if (scalePracticeStore.sessionState === "playing") {
    // Parse note ID (e.g., "C4" -> note: "C", octave: 4)
    const match = noteId.match(/^([A-G][#b]?)(\d+)$/);
    if (match) {
      const [, note, octaveStr] = match;
      const octave = Number.parseInt(octaveStr, 10);
      const midi = 0; // We don't have MIDI number from noteId, but it's not used in validation

      scalePracticeStore.recordNotePlayed(note, octave, midi);
    }
  }
}

async function handleNoteOff(noteId: string) {
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
  // Auto-create initial C Major scale session
  scalePracticeStore.handleStartPractice();
});
</script>

<template>
  <div class="container mx-auto p-6 space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-bold mb-2">
        🎹 Piano Practice
      </h1>
      <p class="text-base-content/70">
        Practice scales with visual and audio feedback
      </p>
    </div>

    <!-- Piano Component Test -->
    <div class="card bg-base-100 shadow-xl" data-theme="dark">
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
                :show-practice-options="true"
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

          <!-- Practice Controls -->
          <div class="card bg-base-200 shadow-lg mb-6">
            <div class="card-body p-4">
              <div class="flex items-center justify-between">
                <!-- Scale Info -->
                <div class="flex items-center gap-4">
                  <scale-selection
                    :selected-root="scalePracticeStore.practiceSettings.root"
                    :selected-scale-type="scalePracticeStore.practiceSettings.scale"
                    @root-change="(root) => { scalePracticeStore.handleRootChange(root); scalePracticeStore.handleStartPractice(); }"
                    @scale-type-change="(scale) => { scalePracticeStore.handleScaleTypeChange(scale); scalePracticeStore.handleStartPractice(); }"
                  />
                </div>

                <!-- Practice Settings -->
                <div class="flex items-center gap-4 ">
                  <!-- Direction -->
                  <div class="grid grid-cols-2 gap-2">
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text text-xs">Direction</span>
                      </label>
                      <select
                        class="select select-bordered select-sm"
                        :value="scalePracticeStore.currentSession?.direction || 'ascending'"
                        @change="(e) => scalePracticeStore.setPracticeDirection((e.target as HTMLSelectElement).value as any)"
                      >
                        <option value="ascending">
                          ↑ Up
                        </option>
                        <option value="descending">
                          ↓ Down
                        </option>
                        <option value="both">
                          ↕ Both
                        </option>
                      </select>
                    </div>

                    <!-- Loops -->
                    <div class="form-control">
                      <label class="label">
                        <span class="label-text text-xs">Loops</span>
                      </label>
                      <select
                        class="select select-bordered select-sm"
                        :value="scalePracticeStore.totalLoops"
                        @change="(e) => scalePracticeStore.setLoops(parseInt((e.target as HTMLSelectElement).value))"
                      >
                        <option value="1">
                          1
                        </option>
                        <option value="5">
                          5
                        </option>
                        <option value="10">
                          10
                        </option>
                      </select>
                    </div>

                    <!-- Tempo -->
                    <div class="col-span-2">
                      <div class="form-control ">
                        <label class="label">
                          <span class="label-text text-xs">{{ scalePracticeStore.practiceSettings.bpm }} BPM</span>
                        </label>
                        <input
                          type="range"
                          class="range range-primary range-xs w-full"
                          min="10"
                          max="200"
                          :step="5"
                          :value="scalePracticeStore.practiceSettings.bpm"
                          @input="(e) => scalePracticeStore.handleTempoChange(parseInt((e.target as HTMLInputElement).value))"
                        >
                      </div>
                    </div>
                  </div>

                  <!-- Practice Controls -->
                  <div class="flex gap-2">
                    <button
                      v-if="scalePracticeStore.isSessionReady"
                      class="btn btn-success btn-sm"
                      :disabled="!playgroundAudioStore.audioReady"
                      @click="scalePracticeStore.startPractice"
                    >
                      <Icon name="hugeicons:play" size="16" />
                      Start
                    </button>

                    <button
                      v-if="scalePracticeStore.sessionState === 'playing' || scalePracticeStore.sessionState === 'count-in'"
                      class="btn btn-error btn-sm"
                      @click="scalePracticeStore.stopPractice"
                    >
                      <Icon name="hugeicons:stop" size="16" />
                      Stop
                    </button>
                  </div>
                </div>
              </div>

              <!-- Progress Display -->
              <div class="mt-3 text-center">
                <div class="text-sm text-base-content/70">
                  Loop {{ scalePracticeStore.currentLoop }} / {{ scalePracticeStore.totalLoops }} •
                  Note {{ scalePracticeStore.currentNoteIndex + 1 }}
                  <span v-if="scalePracticeStore.expectedNote">
                    • Next: {{ scalePracticeStore.expectedNote.note }}{{ scalePracticeStore.expectedNote.octave }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Piano -->
          <div>
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
              :hint-notes="hintNotes"
              :success-notes="successNotes"

              :show-scale-highlights="pianoConfig.showScaleHighlights"
              :show-next-note-hint="pianoConfig.showNextNoteHint"
              :show-success-animation="pianoConfig.showSuccessAnimation"

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
