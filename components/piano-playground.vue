<script setup lang="ts">
import { computed, ref, watch } from "vue";

import type { PianoPlaygroundEmits, PianoPlaygroundProps } from "~/types/piano-playground";

import KeyboardGuide from "~/components/keyboard-guide.vue";
import { useKeyboardPiano } from "~/composables/use-keyboard-piano";
import { useMidi } from "~/composables/use-midi";

// Props with validation and defaults
const props = withDefaults(defineProps<PianoPlaygroundProps>(), {
  octaveRange: 3,
  startOctave: 3,
  showKeyboardGuide: true,
  labelStyle: "letter",
  theme: "light",
  colorMode: "per-note",
  showOctaveLabels: false,
  highlightedNotes: () => [],
  showKeyboardHints: false,
  midiInput: false,
  isKeyboardBlocked: false,
});

// Emits
const emit = defineEmits<PianoPlaygroundEmits>();

// Audio enabled state and MIDI-banner flag
const audioEnabled = computed(() => Boolean(props.audioEnabled));
const showAudioBlockedHint = ref(false);

// State managed by keyboard composable
const pianoRef = ref<HTMLElement>();
const {
  activeNotes,
  selectedOctaveIndex,
  visibleKeyboardMapping,
  isKeyboardBlocked,
} = useKeyboardPiano({
  octaveRange: computed(() => props.octaveRange),
  startOctave: computed(() => props.startOctave),
  emitNoteOn: note => emit("note-on", note, "keyboard"),
  emitNoteOff: note => emit("note-off", note),
  getRootEl: () => pianoRef.value ?? null,
});

watch(selectedOctaveIndex, (idx) => {
  emit("selected-octave-change", idx);
});

// Expose selected octave if parent needs to read it
defineExpose({ selectedOctaveIndex });

// Build noteId -> key label map for keyboard hints
const noteIdToKeyMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  const current = visibleKeyboardMapping.value;
  for (const [key, noteId] of Object.entries(current)) {
    map[noteId] = key.toUpperCase();
  }
  return map;
});

// MIDI: manage inputs and merge active notes
const midiActiveNotes = ref<string[]>([]);
const {
  isMidiSupported: _isMidiSupported,
  midiInputs: _midiInputs,
  selectedMidiInputId: _selectedMidiInputId,
  midiError: _midiError,
} = useMidi({
  enabled: computed(() => props.midiInput),
  onNoteOn: (noteId) => {
    if (!midiActiveNotes.value.includes(noteId))
      midiActiveNotes.value.push(noteId);
    emit("note-on", noteId, "midi");
    if (!audioEnabled.value)
      showAudioBlockedHint.value = true;
  },
  onNoteOff: (noteId) => {
    midiActiveNotes.value = midiActiveNotes.value.filter(n => n !== noteId);
    emit("note-off", noteId);
  },
});

const mergedActiveNotes = computed(() => Array.from(new Set([...activeNotes.value, ...midiActiveNotes.value])));

// Hide the MIDI banner as soon as audio is enabled
watch(audioEnabled, (enabled) => {
  if (enabled)
    showAudioBlockedHint.value = false;
});
</script>

<template>
  <div
    ref="pianoRef"
    class="piano-playground w-full focus:outline-none relative"
    tabindex="0"
  >
    <!-- Floating banner when keyboard is blocked by focus on other controls -->
    <div
      v-if="isKeyboardBlocked"
      class="alert alert-warning shadow-lg absolute left-1/2 top-8 -translate-x-1/2 z-50 w-[min(90vw,400px)] flex items-center gap-2"
      role="status"
    >
      <Icon name="hugeicons:alert-square" size="32" />
      <span class="text-xs ">
        Keyboard input paused while focused on other controls. Click the piano to resume playing.
      </span>
    </div>
    <!-- Floating banner when MIDI is used but audio is not enabled -->
    <div
      v-if="showAudioBlockedHint && !audioEnabled"
      class="alert alert-warning shadow-lg absolute left-1/2 top-24 -translate-x-1/2 z-50 w-[min(90vw,420px)] flex items-center gap-3"
      role="status"
    >
      <Icon name="hugeicons:music-note-02" size="28" />
      <span class="text-xs">
        Audio is blocked by the browser until enabled. Press any key, click, or use the button to start audio.
      </span>
      <button class="btn btn-xs btn-primary ml-auto" @click="$emit('enable-audio')">
        Enable Audio
      </button>
    </div>
    <!-- Visual Piano Component -->
    <VisualPiano
      :active-notes="mergedActiveNotes"
      :octaves="octaveRange"
      :start-octave="startOctave"
      :highlighted-notes="highlightedNotes"
      :label-style="labelStyle"
      :theme="theme"
      :color-mode="colorMode"
      :input-enabled="true"
      :show-octave-labels="showOctaveLabels"
      :show-keyboard-hints="showKeyboardHints"
      :keyboard-hints="noteIdToKeyMap"
      @note-on="emit('note-on', $event, 'ui')"
      @note-off="emit('note-off', $event)"
    />

    <!-- Keyboard Guide -->
    <KeyboardGuide
      v-if="showKeyboardGuide"
      :octave-range="octaveRange"
      :visible-keyboard-mapping="visibleKeyboardMapping"
      :selected-octave-index="selectedOctaveIndex"
      :start-octave="startOctave"
      @octave-change="selectedOctaveIndex = $event"
    />
  </div>
</template>

<style scoped>
.key-map-item {
  transition: all 0.2s ease;
}

.key-map-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
