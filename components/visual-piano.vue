<!--
  Visual Piano Component (Improved)

  A responsive, interactive piano keyboard component with enhanced architecture:
  - Composable-based logic for better maintainability and reusability
  - Strict TypeScript typing for better DX and error prevention
  - Pointer events for improved device support
  - SSR-compatible with client-side guards
  - Semantic Tailwind tokens and improved accessibility
  - Modular structure with extracted sub-components

  Key Technical Features:
  - Composables: useNoteHelpers, useColorClasses, useKeyboardMeasurement, useResizeObserver
  - Pointer events with Vue modifiers for clean syntax
  - CSS custom properties for semantic theming
  - Enhanced accessibility with ARIA labels and proper focus management
  - SSR-compatible ResizeObserver usage

  Events:
  - noteOn(noteId: string) - Emitted when a key is pressed
  - noteOff(noteId: string) - Emitted when a key is released
-->

<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";

import type { VisualPianoEmits, VisualPianoProps } from "~/types/piano";

import { useColorClasses } from "~/composables/use-color-classes";
import { useKeyboardMeasurement } from "~/composables/use-keyboard-measurement";
import { useNoteHelpers } from "~/composables/use-note-helpers";
import { useResizeObserver } from "~/composables/use-resize-observer";
import { BLACK_KEYS, MAX_OCTAVES, MIN_OCTAVES, WHITE_KEYS } from "~/constants/piano";

import BlackKey from "./piano/black-key.vue";
import WhiteKey from "./piano/white-key.vue";

// Props with validation and defaults
const props = withDefaults(defineProps<VisualPianoProps>(), {
  octaves: 2,
  startOctave: 1,
  theme: "light",
  labelStyle: "none",
  highlightedNotes: () => [],
  activeNotes: () => [],
  disabled: false,
  colorMode: "per-note",
  inputEnabled: true,
  showOctaveLabels: false,
});

// Emits
const emit = defineEmits<VisualPianoEmits>();
const component_key = useId();

// Reactive state
const internalActiveNotes = ref<string[]>([]);
const containerRef = ref<HTMLElement>();

// Validate octave range (1-7 octaves supported)
const validatedOctaves = computed(() => {
  const octaves = Math.max(MIN_OCTAVES, Math.min(MAX_OCTAVES, props.octaves));
  if (octaves !== props.octaves && import.meta.client) {
    console.warn(`VisualPiano: octaves prop must be between ${MIN_OCTAVES}-${MAX_OCTAVES}. Received ${props.octaves}, using ${octaves}.`);
  }
  return octaves;
});

// Generate octave numbers based on validated octaves and startOctave
const octaveNumbers = computed(() => {
  return Array.from({ length: validatedOctaves.value }, (_, i) => props.startOctave + i);
});

// The last visible octave number in the rendered range
const lastVisibleOctave = computed(() => props.startOctave + validatedOctaves.value - 1);

// Convert props to refs for composables
const highlightedNotesRef = ref<string[]>([]);
const activeNotesRef = ref<string[]>([]);

// Initialize composables
const {
  getNoteId,
  isHighlighted,
  isActive,
  getNoteLabel,
} = useNoteHelpers(highlightedNotesRef, activeNotesRef, internalActiveNotes);

const {
  getNoteColorClass,
  getLabelColorClass,
} = useColorClasses(
  highlightedNotesRef,
  activeNotesRef,
  internalActiveNotes,
  computed(() => props.colorMode),
);

const {
  actualWhiteKeyWidth,
  getBlackKeyPosition,
  measureKeyWidth,
} = useKeyboardMeasurement(containerRef);

// SSR-compatible ResizeObserver setup
useResizeObserver(containerRef, measureKeyWidth);

// Synchronize internalActiveNotes with external activeNotes prop
watch(() => props.activeNotes, (newActiveNotes) => {
  // Update internalActiveNotes to match external activeNotes
  internalActiveNotes.value = [...newActiveNotes];
  // Also update the activeNotesRef for composables
  activeNotesRef.value = [...newActiveNotes];
}, { deep: true, immediate: true });

// Also watch for changes in highlightedNotes to ensure proper reactivity
watch(() => props.highlightedNotes, (newHighlightedNotes) => {
  highlightedNotesRef.value = [...newHighlightedNotes];
}, { deep: true, immediate: true });

// Event handling functions

function handleKeyPress(note: string, octave: number) {
  if (props.disabled || !props.inputEnabled)
    return;

  const noteId = getNoteId(note, octave);

  // Add to internal active notes for visual feedback
  if (!internalActiveNotes.value.includes(noteId)) {
    internalActiveNotes.value.push(noteId);
  }

  emit("noteOn", noteId);
}

function handleKeyRelease(note: string, octave: number) {
  if (props.disabled || !props.inputEnabled)
    return;

  const noteId = getNoteId(note, octave);

  // Remove from internal active notes
  internalActiveNotes.value = internalActiveNotes.value.filter(id => id !== noteId);

  emit("noteOff", noteId);
}

// Enhanced accessibility - generate ARIA labels
function getAriaLabel(note: string, octave: number): string {
  const label = getNoteLabel(note, octave, props.labelStyle, props.showOctaveLabels);
  const state = isActive(note, octave) ? "pressed" : isHighlighted(note, octave) ? "highlighted" : "normal";
  return `${label || note + octave} piano key, ${state}`;
}
</script>

<template>
  <div
    :key="component_key"
    class="visual-piano w-full bg-transparent touch-manipulation scroll-smooth"
    :data-theme="theme"
    :class="{
      'pointer-events-none': disabled,
    }"
  >
    <div
      ref="containerRef"
      class="piano-container relative flex gap-px px-8 justify-center bg-transparent"
      style="min-height: 224px; contain: layout style;"
    >
      <!-- Generate keys for each octave -->
      <div
        v-for="octave in octaveNumbers"
        :key="`octave-${octave}`"
        class="octave-container relative flex gap-px bg-transparent"
      >
        <!-- White keys -->
        <WhiteKey
          v-for="note in WHITE_KEYS"
          :key="`${note}-${octave}`"
          :note="note"
          :octave="octave"
          :disabled="disabled"
          :color-class="getNoteColorClass(note, octave, false)"
          :label-text="labelStyle !== 'none' ? getNoteLabel(note, octave, labelStyle, showOctaveLabels) : ''"
          :label-color-class="getLabelColorClass(note, octave, false)"
          :aria-label="getAriaLabel(note, octave)"
          :on-press="handleKeyPress"
          :on-release="handleKeyRelease"
        />

        <!-- Trailing high C (C of the next octave) only on the last visible octave -->
        <WhiteKey
          v-if="octave === lastVisibleOctave"
          :key="`C-${octave + 1}-trailing`"
          note="C"
          :octave="octave + 1"
          :disabled="disabled"
          :color-class="getNoteColorClass('C', octave + 1, false)"
          :label-text="labelStyle !== 'none' ? getNoteLabel('C', octave + 1, labelStyle, showOctaveLabels) : ''"
          :label-color-class="getLabelColorClass('C', octave + 1, false)"
          :aria-label="getAriaLabel('C', octave + 1)"
          :on-press="handleKeyPress"
          :on-release="handleKeyRelease"
        />

        <!-- Black keys with responsive positioning -->
        <BlackKey
          v-for="note in BLACK_KEYS"
          :key="`${note}-${octave}`"
          :note="note"
          :octave="octave"
          :disabled="disabled"
          :white-key-width="actualWhiteKeyWidth"
          :color-class="getNoteColorClass(note, octave, true)"
          :label-text="labelStyle !== 'none' ? getNoteLabel(note, octave, labelStyle, showOctaveLabels) : ''"
          :label-color-class="getLabelColorClass(note, octave, true)"
          :aria-label="getAriaLabel(note, octave)"
          :get-black-key-position="getBlackKeyPosition"
          :on-press="handleKeyPress"
          :on-release="handleKeyRelease"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-piano {
  isolation: isolate;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.visual-piano::-webkit-scrollbar {
  display: none;
}

/* Key-level styles are now encapsulated in WhiteKey/BlackKey components */

/* Mobile responsiveness */
@media (max-width: 640px) {
  .visual-piano {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }

  .white-key {
    height: 180px;
  }

  .black-key {
    height: 108px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .white-key {
    border: 2px solid black;
  }

  .black-key {
    border: 2px solid white;
  }
}

/* Dark theme adjustments for container only */
</style>
