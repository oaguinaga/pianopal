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
import { computed, ref, watch } from "vue";

import type { VisualPianoEmits, VisualPianoProps } from "~/types/piano";

import { useColorClasses } from "~/composables/use-color-classes";
import { useKeyboardMeasurement } from "~/composables/use-keyboard-measurement";
import { useNoteHelpers } from "~/composables/use-note-helpers";
import { useResizeObserver } from "~/composables/use-resize-observer";
import { BLACK_KEYS, MAX_OCTAVES, MIN_OCTAVES, WHITE_KEYS } from "~/constants/piano";

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
        <button
          v-for="note in WHITE_KEYS"
          :key="`${note}-${octave}`"
          type="button"
          class="white-key piano-key relative select-none flex items-end justify-center pb-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:z-20"
          :class="[
            getNoteColorClass(note, octave, false),
            {
              'cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
            },
          ]"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          :aria-label="getAriaLabel(note, octave)"
          :aria-pressed="isActive(note, octave)"
          role="button"
          @pointerdown="handleKeyPress(note, octave)"
          @pointerup="handleKeyRelease(note, octave)"
          @pointerleave="handleKeyRelease(note, octave)"
          @keydown.space.exact.prevent="handleKeyPress(note, octave)"
          @keyup.space.exact.prevent="handleKeyRelease(note, octave)"
          @keydown.enter.exact.prevent="handleKeyPress(note, octave)"
          @keyup.enter.exact.prevent="handleKeyRelease(note, octave)"
        >
          <!-- Note label -->
          <span
            v-if="labelStyle !== 'none'"
            class="text-xs font-medium pointer-events-none select-none"
            :class="getLabelColorClass(note, octave, false)"
            aria-hidden="true"
          >
            {{ getNoteLabel(note, octave, labelStyle, showOctaveLabels) }}
          </span>
        </button>

        <!-- Trailing high C (C of the next octave) only on the last visible octave -->
        <button
          v-if="octave === lastVisibleOctave"
          :key="`C-${octave + 1}-trailing`"
          type="button"
          class="white-key piano-key relative select-none flex items-end justify-center pb-4 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:z-20"
          :class="[
            getNoteColorClass('C', octave + 1, false),
            {
              'cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
            },
          ]"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          :aria-label="getAriaLabel('C', octave + 1)"
          :aria-pressed="isActive('C', octave + 1)"
          role="button"
          @pointerdown="handleKeyPress('C', octave + 1)"
          @pointerup="handleKeyRelease('C', octave + 1)"
          @pointerleave="handleKeyRelease('C', octave + 1)"
          @keydown.space.exact.prevent="handleKeyPress('C', octave + 1)"
          @keyup.space.exact.prevent="handleKeyRelease('C', octave + 1)"
          @keydown.enter.exact.prevent="handleKeyPress('C', octave + 1)"
          @keyup.enter.exact.prevent="handleKeyRelease('C', octave + 1)"
        >
          <span
            v-if="labelStyle !== 'none'"
            class="text-xs font-medium pointer-events-none select-none"
            :class="getLabelColorClass('C', octave + 1, false)"
            aria-hidden="true"
          >
            {{ getNoteLabel('C', octave + 1, labelStyle, showOctaveLabels) }}
          </span>
        </button>

        <!-- Black keys with responsive positioning -->
        <button
          v-for="note in BLACK_KEYS"
          :key="`${note}-${octave}`"
          type="button"
          class="black-key piano-key absolute z-10 select-none flex items-end justify-center pb-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-50 focus-visible:z-20"
          :class="[
            getNoteColorClass(note, octave, true),
            {
              'cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
            },
          ]"
          :style="getBlackKeyPosition(note, actualWhiteKeyWidth)"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          :aria-label="getAriaLabel(note, octave)"
          :aria-pressed="isActive(note, octave)"
          role="button"
          @pointerdown="handleKeyPress(note, octave)"
          @pointerup="handleKeyRelease(note, octave)"
          @pointerleave="handleKeyRelease(note, octave)"
          @keydown.space.exact.prevent="handleKeyPress(note, octave)"
          @keyup.space.exact.prevent="handleKeyRelease(note, octave)"
          @keydown.enter.exact.prevent="handleKeyPress(note, octave)"
          @keyup.enter.exact.prevent="handleKeyRelease(note, octave)"
        >
          <!-- Note label -->
          <span
            v-if="labelStyle !== 'none'"
            class="text-xs font-medium pointer-events-none select-none"
            :class="getLabelColorClass(note, octave, true)"
            aria-hidden="true"
          >
            {{ getNoteLabel(note, octave, labelStyle, showOctaveLabels) }}
          </span>
        </button>
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

.piano-key {
  transform-origin: bottom;
  transition: all 0.2s ease;
}

/* White key styling using standard Tailwind classes */
.white-key {
  z-index: 0;
  width: clamp(32px, 4vw, 56px);
  height: 224px;
  border: 1px solid rgb(229, 231, 235, 0.3);
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.01);
}

/* Default white key background when no color classes are applied */
.white-key:not(.highlighted-key):not(.active-key) {
  background-color: white;
}

.white-key:hover:not(:disabled):not(.highlighted-key):not(.active-key) {
  background-color: rgb(249, 250, 251);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.white-key:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* Black key styling using standard Tailwind classes */
.black-key {
  z-index: 10;
  width: clamp(19px, 2.4vw, 34px);
  height: 134px;
  border: 1px solid rgb(17, 24, 39, 0.3);
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Default black key background when no color classes are applied */
.black-key:not(.highlighted-key):not(.active-key) {
  background-color: rgb(55, 65, 81);
}

.black-key:hover:not(:disabled):not(.highlighted-key):not(.active-key) {
  background-color: rgb(75, 85, 99);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.black-key:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

/* Enhanced focus styles for accessibility */
.piano-key:focus-visible {
  outline: 2px solid rgb(139 92 246);
  outline-offset: 2px;
  z-index: 1;
}

/* Ensure Tailwind color classes take precedence over base styles */
.piano-key.highlighted-key,
.piano-key.active-key {
  background-image: none;
}

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

/* Dark theme adjustments */
.dark .white-key {
  background-color: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.dark .white-key:hover:not(:disabled) {
  background-color: rgb(55, 65, 81);
}

.dark .black-key {
  background-color: rgb(31, 41, 55);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
</style>
