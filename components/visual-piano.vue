<!--
  Visual Piano Component

  A responsive, interactive piano keyboard component with the following features:
  - Configurable octaves (1-7)
  - Light/dark theme support
  - Multiple label styles (letter, do-re-mi, none)
  - PRD-specified color mapping for note highlighting
  - DOM-based black key positioning for pixel-perfect alignment
  - Touch and mouse interaction support
  - Accessibility features (keyboard navigation, focus management)
  - Real-time responsive behavior

  Key Technical Features:
  - ResizeObserver for responsive black key positioning
  - Internal active state for immediate visual feedback
  - Computed container sizing for optimal layout
  - CSS custom properties for theme integration

  Events:
  - noteOn(noteId: string) - Emitted when a key is pressed
  - noteOff(noteId: string) - Emitted when a key is released
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";

type VisualPianoProps = {
  octaves?: number;
  theme?: "light" | "dark";
  labelStyle?: "letter" | "do-re-mi" | "none";
  highlightedNotes?: string[];
  activeNotes?: string[];
  disabled?: boolean;
  colorMode?: "per-note" | "mono";
  inputEnabled?: boolean;
  showOctaveLabels?: boolean;
};

type VisualPianoEmits = {
  noteOn: [note: string];
  noteOff: [note: string];
};

// Define props with defaults and validation
const props = withDefaults(defineProps<VisualPianoProps>(), {
  octaves: 2,
  theme: "light",
  labelStyle: "none",
  highlightedNotes: () => [],
  activeNotes: () => [],
  disabled: false,
  colorMode: "per-note",
  inputEnabled: true,
  showOctaveLabels: false,
});

// Define emits
const emit = defineEmits<VisualPianoEmits>();

// Reactive state for active notes (for click interactions)
const internalActiveNotes = ref<string[]>([]);

// Validate octave range (1-7 octaves supported)
const validatedOctaves = computed(() => {
  const octaves = Math.max(1, Math.min(7, props.octaves));
  if (octaves !== props.octaves) {
    console.warn(`VisualPiano: octaves prop must be between 1-7. Received ${props.octaves}, using ${octaves}.`);
  }
  return octaves;
});

// Piano note configuration
const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"] as const;
const blackKeys = ["C#", "D#", "F#", "G#", "A#"] as const;

// Generate octave numbers based on validated octaves
const octaveNumbers = computed(() => {
  return Array.from({ length: validatedOctaves.value }, (_, i) => i + 1);
});

// ============================================================================
// REACTIVE STATE & REFS
// ============================================================================

// Container ref for measuring actual dimensions
const containerRef = ref<HTMLElement>();

// Actual white key width (measured from DOM)
const actualWhiteKeyWidth = ref(48); // Default fallback

// Store measured black key positions for DOM-based calculations
const blackKeyPositions = ref<Record<string, { left: string; width: string; transform: string }>>({});

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

// Piano key constants (use the computed whiteKeys from template)
// const whiteKeys and blackKeys are already defined in template section

// Color mapping for PRD specifications
const noteColorMap = {
  C: {
    highlight: "bg-blue-200 dark:bg-blue-800",
    active: "bg-blue-300 dark:bg-blue-700",
  },
  D: {
    highlight: "bg-purple-200 dark:bg-purple-800",
    active: "bg-purple-300 dark:bg-purple-700",
  },
  E: {
    highlight: "bg-pink-200 dark:bg-pink-800",
    active: "bg-pink-300 dark:bg-pink-700",
  },
  F: {
    highlight: "bg-emerald-200 dark:bg-emerald-800",
    active: "bg-emerald-300 dark:bg-emerald-700",
  },
  G: {
    highlight: "bg-red-300 dark:bg-red-800",
    active: "bg-red-400 dark:bg-red-700",
  },
  A: {
    highlight: "bg-orange-200 dark:bg-orange-800",
    active: "bg-orange-300 dark:bg-orange-700",
  },
  B: {
    highlight: "bg-yellow-200 dark:bg-yellow-800",
    active: "bg-yellow-300 dark:bg-yellow-700",
  },
} as const;

// Black key color mapping (darker variants)
const blackKeyColorMap = {
  "C#": {
    highlight: "bg-blue-400 dark:bg-blue-600",
    active: "bg-blue-500 dark:bg-blue-500",
  },
  "D#": {
    highlight: "bg-purple-400 dark:bg-purple-600",
    active: "bg-purple-500 dark:bg-purple-500",
  },
  "F#": {
    highlight: "bg-emerald-400 dark:bg-emerald-600",
    active: "bg-emerald-500 dark:bg-emerald-500",
  },
  "G#": {
    highlight: "bg-red-500 dark:bg-red-600",
    active: "bg-red-600 dark:bg-red-500",
  },
  "A#": {
    highlight: "bg-orange-400 dark:bg-orange-600",
    active: "bg-orange-500 dark:bg-orange-500",
  },
} as const;

// Black key positioning mapping within each octave
const blackKeyMapping = {
  "C#": [0, 1], // Between C and D within the octave
  "D#": [1, 2], // Between D and E within the octave
  "F#": [3, 4], // Between F and G within the octave
  "G#": [4, 5], // Between G and A within the octave
  "A#": [5, 6], // Between A and B within the octave
} as const;

// ============================================================================
// POSITIONING & MEASUREMENT FUNCTIONS
// ============================================================================

// Get black key position from stored measurements or fallback calculation
function getBlackKeyPosition(note: string, actualWidth: number) {
  // Use stored position if available
  const storedPosition = blackKeyPositions.value[note];
  if (storedPosition) {
    return storedPosition;
  }

  // Fallback to calculated positioning using constants
  const positionMap: Record<string, number> = {
    "C#": 0.5,
    "D#": 1.5,
    "F#": 3.5,
    "G#": 4.5,
    "A#": 5.5,
  };

  const position = positionMap[note];
  if (position === undefined)
    return { left: "0px" };

  const gap = 1;
  const blackKeyWidth = actualWidth * 0.6;
  const centerPoint = position * (actualWidth + gap);

  return {
    left: `${centerPoint}px`,
    width: `${blackKeyWidth}px`,
    transform: `translateX(-50%)`,
  };
}

// Measure actual white key width and trigger black key position calculation
function measureKeyWidth() {
  if (containerRef.value) {
    const whiteKeyElement = containerRef.value.querySelector(".white-key");
    if (whiteKeyElement) {
      const width = whiteKeyElement.getBoundingClientRect().width;
      actualWhiteKeyWidth.value = width;

      // Calculate black key positions based on actual white key positions
      calculateBlackKeyPositions();
    }
  }
}

// Calculate precise black key positions using DOM measurements
function calculateBlackKeyPositions() {
  if (!containerRef.value)
    return;

  // Get all octave containers to calculate positions within each octave
  const octaveContainers = containerRef.value.querySelectorAll(".octave-container");
  if (octaveContainers.length === 0)
    return;

  const blackKeyWidth = actualWhiteKeyWidth.value * 0.6;
  const newPositions: Record<string, { left: string; width: string; transform: string }> = {};

  // Calculate positions relative to the first octave container
  const firstOctave = octaveContainers[0];
  const octaveRect = firstOctave.getBoundingClientRect();
  const whiteKeysInOctave = firstOctave.querySelectorAll(".white-key");

  if (whiteKeysInOctave.length >= 7) {
    Object.entries(blackKeyMapping).forEach(([note, [leftIndex, rightIndex]]) => {
      if (whiteKeysInOctave[leftIndex] && whiteKeysInOctave[rightIndex]) {
        const leftKey = whiteKeysInOctave[leftIndex].getBoundingClientRect();
        const rightKey = whiteKeysInOctave[rightIndex].getBoundingClientRect();

        // Calculate the exact center point between the two white keys
        const center = (leftKey.right + rightKey.left) / 2;
        // Position relative to the octave container, not the main container
        const centerPoint = center - octaveRect.left;

        newPositions[note] = {
          left: `${centerPoint}px`,
          width: `${blackKeyWidth}px`,
          transform: `translateX(-50%)`,
        };
      }
    });
  }

  blackKeyPositions.value = newPositions;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Generate note identifier for events
function getNoteId(note: string, octave: number) {
  return `${note}${octave}`;
}

// Check if a note is highlighted
function isHighlighted(note: string, octave: number) {
  const noteId = getNoteId(note, octave);
  return props.highlightedNotes.includes(noteId);
}

// Check if a note is active (from props or internal state)
function isActive(note: string, octave: number) {
  const noteId = getNoteId(note, octave);
  return props.activeNotes.includes(noteId) || internalActiveNotes.value.includes(noteId);
}

// Get note label based on labelStyle prop
function getNoteLabel(note: string, octave: number) {
  if (props.labelStyle === "none")
    return "";

  if (props.labelStyle === "do-re-mi") {
    const doReMiMap: Record<string, string> = {
      "C": "Do",
      "C#": "Do#",
      "D": "Re",
      "D#": "Re#",
      "E": "Mi",
      "F": "Fa",
      "F#": "Fa#",
      "G": "Sol",
      "G#": "Sol#",
      "A": "La",
      "A#": "La#",
      "B": "Ti",
    };
    const label = doReMiMap[note] || note;
    return props.showOctaveLabels ? `${label}${octave}` : label;
  }

  // Default to letter notation
  return props.showOctaveLabels ? `${note}${octave}` : note;
}

// Get color classes for a note
function getNoteColorClass(note: string, octave: number, isBlackKey: boolean) {
  const isNoteActive = isActive(note, octave);
  const isNoteHighlighted = isHighlighted(note, octave);

  // Return empty string if no special coloring needed
  if (!isNoteActive && !isNoteHighlighted) {
    return "";
  }

  // Handle mono color mode
  if (props.colorMode === "mono") {
    if (isNoteActive)
      return "bg-indigo-400 dark:bg-indigo-600 active-key";
    if (isNoteHighlighted)
      return "bg-indigo-200 dark:bg-indigo-800 highlighted-key";
    return "";
  }

  // Handle per-note color mode
  const baseNote = note.charAt(0) as keyof typeof noteColorMap;
  const colorMap = isBlackKey ? blackKeyColorMap[note as keyof typeof blackKeyColorMap] : noteColorMap[baseNote];

  if (!colorMap)
    return "";

  if (isNoteActive) {
    return `${colorMap.active} active-key`;
  }

  if (isNoteHighlighted) {
    return `${colorMap.highlight} highlighted-key`;
  }

  return "";
}

// ============================================================================
// EVENT HANDLING FUNCTIONS
// ============================================================================

// Handle key interactions
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

// ============================================================================
// LIFECYCLE & SETUP
// ============================================================================

// Set up resize observer to update measurements
onMounted(() => {
  // Initial measurement with a delay to ensure DOM is fully rendered
  nextTick(() => {
    measureKeyWidth();
  });

  // Watch for window resize
  const resizeObserver = new ResizeObserver(() => {
    nextTick(() => {
      measureKeyWidth();
    });
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }

  // Cleanup
  onUnmounted(() => {
    resizeObserver.disconnect();
  });
});
</script>

<template>
  <div class="visual-piano w-full" :data-theme="theme">
    <div
      ref="containerRef"
      class="piano-container relative flex gap-px px-8 justify-center"
    >
      <!-- Generate keys for each octave -->
      <div
        v-for="octave in octaveNumbers"
        :key="`octave-${octave}`"
        class="octave-container relative flex gap-px"
      >
        <!-- White keys -->
        <button
          v-for="note in whiteKeys"
          :key="`${note}-${octave}`"
          class="white-key piano-key relative select-none flex items-end justify-center pb-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :class="[
            getNoteColorClass(note, octave, false),
            {
              'cursor-not-allowed opacity-50': disabled,
            },
          ]"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          @mousedown="handleKeyPress(note, octave)"
          @mouseup="handleKeyRelease(note, octave)"
          @mouseleave="handleKeyRelease(note, octave)"
          @keydown.space.prevent="handleKeyPress(note, octave)"
          @keyup.space.prevent="handleKeyRelease(note, octave)"
          @keydown.enter.prevent="handleKeyPress(note, octave)"
          @keyup.enter.prevent="handleKeyRelease(note, octave)"
        >
          <!-- Note label -->
          <span
            v-if="labelStyle !== 'none'"
            class="text-xs font-medium pointer-events-none select-none text-gray-600 dark:text-gray-300"
          >
            {{ getNoteLabel(note, octave) }}
          </span>
        </button>

        <!-- Black keys with responsive positioning -->
        <button
          v-for="note in blackKeys"
          :key="`${note}-${octave}`"
          class="black-key piano-key absolute z-10 select-none flex items-end justify-center pb-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          :class="[
            getNoteColorClass(note, octave, true),
            {
              'cursor-not-allowed opacity-50': disabled,
            },
          ]"
          :style="{
            ...getBlackKeyPosition(note, actualWhiteKeyWidth),
            height: 'calc(0.6 * var(--key-height, 224px))',
          }"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          @mousedown="handleKeyPress(note, octave)"
          @mouseup="handleKeyRelease(note, octave)"
          @mouseleave="handleKeyRelease(note, octave)"
          @keydown.space.prevent="handleKeyPress(note, octave)"
          @keyup.space.prevent="handleKeyRelease(note, octave)"
          @keydown.enter.prevent="handleKeyPress(note, octave)"
          @keyup.enter.prevent="handleKeyRelease(note, octave)"
        >
          <!-- Note label -->
          <span
            v-if="labelStyle !== 'none'"
            class="text-xs font-medium pointer-events-none select-none text-white dark:text-gray-200"
          >
            {{ getNoteLabel(note, octave) }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visual-piano {
  --key-height: 224px;
  background: transparent;
  touch-action: manipulation;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.visual-piano::-webkit-scrollbar {
  display: none;
}

.piano-container {
  contain: layout style;
  background: transparent;
  min-height: var(--key-height);
}

.octave-container {
  background: transparent;
}

.piano-key {
  transform-origin: bottom;
  transition: all 0.2s ease;
}

/* White key base styling */
.white-key {
  width: clamp(32px, 4vw, 56px);
  height: var(--key-height);
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.white-key:hover:not(:disabled) {
  background: linear-gradient(to bottom, #f9fafb 0%, #f3f4f6 100%);
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

/* Black key base styling */
.black-key {
  background: linear-gradient(to bottom, #374151 0%, #1f2937 100%);
  border: 1px solid #111827;
  border-radius: 0 0 6px 6px;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.black-key:hover:not(:disabled) {
  background: linear-gradient(to bottom, #4b5563 0%, #374151 100%);
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

/* Critical: Override base key backgrounds when color classes are applied */
/* Use more specific selectors to beat .white-key and .black-key base styles */
.white-key.highlighted-key,
.white-key.active-key,
.black-key.highlighted-key,
.black-key.active-key,
.white-key[class*="bg-"],
.black-key[class*="bg-"] {
  background: revert !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

/* Ensure all Tailwind color classes override the base key backgrounds */
button.piano-key.white-key[class*="bg-"],
button.piano-key.black-key[class*="bg-"] {
  background: revert !important;
}

/* Dark theme adjustments */
.dark .white-key {
  background: linear-gradient(to bottom, #1f2937 0%, #111827 100%);
  border-color: #374151;
}

.dark .white-key:hover:not(:disabled) {
  background: linear-gradient(to bottom, #374151 0%, #1f2937 100%);
  border-color: #6b7280;
}

.dark .black-key {
  background: linear-gradient(to bottom, #1f2937 0%, #111827 100%);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Focus accessibility improvements */
.white-key:focus-visible,
.black-key:focus-visible {
  z-index: 20;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .visual-piano {
    --key-height: 180px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .white-key {
    border-width: 2px;
    border-color: #000000;
  }

  .black-key {
    border-width: 2px;
    border-color: #ffffff;
  }
}
</style>
