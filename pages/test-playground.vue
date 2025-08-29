<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

import type { ColorMode, LabelStyle } from "~/types/piano";

import { useMidi } from "~/composables/use-midi";
import { DEFAULT_OCTAVE, DEFAULT_OCTAVE_RANGE } from "~/constants/piano";
import { DEFAULT_DIRECTION, DEFAULT_SCALE_SETTINGS } from "~/constants/scale";
import { usePlaygroundAudioStore } from "~/stores/playground-audio";
import { useScalePracticeStore } from "~/stores/scale-practice";
import { blurTargetOrActiveElementOnChange } from "~/utils/dom";
import { formatNoteLabel } from "~/utils/notes";
import { getScaleNotes } from "~/utils/scale-utils";

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
  const C_SCALE_NOTES = getScaleNotes(DEFAULT_SCALE_SETTINGS.root, DEFAULT_SCALE_SETTINGS.scale);
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
    <div class="card bg-base-100 shadow-xl ">
      <div class="card-body">
        <div class="space-y-2">
          <!-- Audio Status Display -->
          <client-only>
            <div v-if="playgroundAudioStore.error" class="alert alert-error alert-soft mb-4 mx-auto flex items-center gap-2">
              <Icon name="hugeicons:alert-01" size="24" />
              <span>{{ playgroundAudioStore.error }}</span>
              <button
                class="btn btn-sm btn-error"
                @click="playgroundAudioStore.resetToDefaults"
              >
                Reset Audio
              </button>
            </div>
          </client-only>

          <!-- Practice Controls -->
          <div class="card bg-base-200 shadow-lg mb-6 relative overflow-hidden max-w-2xl mx-auto min-h-32">
            <div v-if="!playgroundAudioStore.audioReady || scalePracticeStore.sessionState === 'playing' || scalePracticeStore.sessionState === 'count-in'" class="absolute top-0 right-0 left-0 bottom-0 bg-base-100/50 backdrop-blur-sm z-10">
              <!-- enable audio -->
              <div v-if="!playgroundAudioStore.audioReady" class="flex flex-col my-auto items-center justify-center h-full gap-y-2">
                <button
                  class="btn btn-sm"
                  @click="enableAudio"
                >
                  {{ playgroundAudioStore.audioReady ? 'Audio Enabled' : 'Enable Audio' }}
                  <div
                    class="inline-grid *:[grid-area:1/1]"
                  >
                    <div class="status animate-ping" :class="playgroundAudioStore.audioReady ? 'status-primary' : 'status-error'" />
                    <div class="status" :class="playgroundAudioStore.audioReady ? 'status-primary' : 'status-error'" />
                  </div>
                </button>
                <p class="text-sm text-base-content/70 grow-0 max-w-sm text-center">
                  Please click the "Enable Audio" button or interact with the piano to start practicing.
                </p>
              </div>
            </div>

            <!-- count in -->
            <div
              v-if="scalePracticeStore.sessionState === 'count-in'"
              class="countdown-container absolute top-0 right-0 left-0 bottom-0 bg-base-100/50 backdrop-blur-sm z-10"
            >
              <div class="flex flex-col my-auto items-center justify-center h-full gap-y-2">
                <p
                  class="text-7xl text-base-content/70 grow-0 transition-all duration-200 animate-pulse "
                  :data-countdown-value="scalePracticeStore.countdownValue"
                >
                  {{ scalePracticeStore.countdownValue || "3" }}
                </p>
              </div>
            </div>

            <!-- Next note -->
            <div v-if="scalePracticeStore.sessionState === 'playing'" class="absolute top-0 right-0 left-0 bottom-0 bg-base-100/50 backdrop-blur-sm z-10">
              <div class="flex flex-col my-auto items-center justify-center h-full gap-y-2 relative">
                <p class="text-7xl text-base-content/70 grow-0 transition-all duration-200 animate-pulse" :class="getNoteLabelColorClass(scalePracticeStore.expectedNote?.note || '')">
                  {{ formatNoteLabel(scalePracticeStore.expectedNote?.note || "", pianoConfig.labelStyle) }}
                </p>
                <p class="text-sm text-base-content/70 grow-0 bottom-4 left-4 absolute">
                  Loop {{ scalePracticeStore.currentLoop }} / {{ scalePracticeStore.currentSession?.repetitions || 1 }}
                </p>
                <button
                  class="btn btn-error btn-sm absolute bottom-4 right-4"
                  @click="scalePracticeStore.stopPractice"
                >
                  <Icon name="hugeicons:stop" :size="16" />
                  Stop
                </button>
              </div>
            </div>

            <div class="card-body p-4">
              <div class="flex justify-between flex-col gap-y-2">
                <!-- Scale Selection -->
                <div class="flex justify-between gap-x-4">
                  <!-- Scale Info -->
                  <scale-selection
                    :selected-root="scalePracticeStore.currentSession?.scale.root || 'C'"
                    :selected-scale-type="scalePracticeStore.currentSession?.scale.type || 'major'"
                    @root-change="(root) => scalePracticeStore.handleRootChange(root)"
                    @scale-type-change="(scale) => scalePracticeStore.handleScaleTypeChange(scale)"
                  />

                  <!-- Practice Settings -->
                  <div class="form-control">
                    <label class="label">
                      <span class="label-text text-xs">Direction</span>
                    </label>
                    <select
                      class="select select-bordered select-sm"
                      :value="scalePracticeStore.currentSession?.direction || DEFAULT_DIRECTION"
                      @change="(e) => scalePracticeStore.setPracticeDirection((e.target as HTMLSelectElement).value as any)"
                    >
                      <option value="ascending">
                        ↑ Up
                      </option>
                      <option value="descending">
                        ↓ Down
                      </option>
                      <option value="both">
                        ⇅ Both
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
                      :value="scalePracticeStore.currentSession?.repetitions || 1"
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
                </div>

                <div class="flex items-center gap-4 w-full">
                  <!-- Tempo -->
                  <div class="form-control flex-1 flex gap-4">
                    <label class="label">
                      <span class="label-text text-xs">{{ scalePracticeStore.currentSession?.tempo || 60 }} BPM</span>
                    </label>
                    <input
                      type="range"
                      class="range range-primary range-xs w-full"
                      min="10"
                      max="200"
                      :step="5"
                      :value="scalePracticeStore.currentSession?.tempo || 60"
                      @input="(e) => scalePracticeStore.handleTempoChange(parseInt((e.target as HTMLInputElement).value))"
                    >
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
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Configuration Panel -->
          <div class="flex justify-end">
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

<style>
.countdown-container [data-countdown-value="1"] {
  color: var(--color-note-e-text);
}
.countdown-container [data-countdown-value="2"] {
  color: var(--color-note-d-text);
}
.countdown-container [data-countdown-value="3"] {
  color: var(--color-note-c-text);
}
.countdown-container [data-countdown-value="GO!"] {
  color: var(--color-note-f-text);
}
</style>
