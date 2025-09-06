<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

import type { ColorMode, LabelStyle } from "~/types/piano";

import { useMidi } from "~/composables/use-midi";
import { DEFAULT_OCTAVE } from "~/constants/piano";
import { usePlaygroundAudioStore } from "~/stores/playground-audio";
import { blurTargetOrActiveElementOnChange } from "~/utils/dom";

// Piano configuration object
const pianoConfig = reactive({
  octaveRange: 1,
  startOctave: DEFAULT_OCTAVE,
  labelStyle: "letter" as LabelStyle,
  colorMode: "per-note" as ColorMode,
  showOctaveLabels: false,
  showKeyboardHints: true,
  showKeyboardGuide: false,
  enableMidi: true,
  // Practice mode visual options
  showScaleHighlights: false,
  showNextNoteHint: false,
  showSuccessAnimation: false,
});

const selectedOctaveIndexFromChild = ref<number>(Math.floor((pianoConfig.octaveRange - 1) / 2));

// Listen to explicit child event instead of exposed ref
function onSelectedOctaveChange(idx: number) {
  selectedOctaveIndexFromChild.value = idx;
}

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
});
</script>

<template>
  <div class="mx-auto px-12 space-y-6 relative">
    <!-- Interactive Piano -->
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

      :show-scale-highlights="pianoConfig.showScaleHighlights"
      :show-next-note-hint="pianoConfig.showNextNoteHint"
      :show-success-animation="pianoConfig.showSuccessAnimation"

      @note-on="handleNoteOn"
      @note-off="handleNoteOff"
      @enable-audio="enableAudio"
      @selected-octave-change="onSelectedOctaveChange"
    />

    <!-- Configuration Panel -->
    <div class="flex flex-col justify-end absolute right-0 top-0">
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

          :show-basic-options="false"
          :show-advanced-options="false"
          :show-volume-and-effects="false"
          :show-instrument-options="false"
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
  </div>
</template>
