<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import type { PianoPlaygroundEmits, PianoPlaygroundProps } from "~/types/piano-playground";

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
});

// Emits
const emit = defineEmits<PianoPlaygroundEmits>();

// Reactive state
const activeNotes = ref<string[]>([]);
const pressedKeys = ref<Set<string>>(new Set());
const isFocused = ref(false);
const pianoRef = ref<HTMLElement>();

// Selected octave index within the configured range
// Defaults to the middle of the range
const selectedOctaveIndex = ref(0);
const selectedOctave = computed(() => props.startOctave + selectedOctaveIndex.value);

// Initialize default selected octave (middle) and keep within bounds on changes
watch(() => props.octaveRange, (newValue) => {
  if (newValue < 1 || newValue > 7) {
    console.warn(
      `PianoPlayground: octaveRange should be between 1 and 7. Received ${newValue}.`,
    );
  }
  // Default to middle of range
  selectedOctaveIndex.value = Math.floor((newValue - 1) / 2);
}, { immediate: true });

watch(() => props.startOctave, (newValue, _oldValue) => {
  if (newValue < 0 || newValue > 8) {
    console.warn(
      `PianoPlayground: startOctave should be between 0 and 8. Received ${newValue}.`,
    );
  }
  // Keep selection within bounds after startOctave changes
  const maxIndex = Math.max(0, props.octaveRange - 1);
  selectedOctaveIndex.value = Math.min(selectedOctaveIndex.value, maxIndex);
}, { immediate: true });

// Fixed keyboard-to-note mapping (relative to an octave)
// White keys
const WHITE_KEY_MAP: Record<string, { note: string; deltaOctave?: number }> = {
  a: { note: "C" },
  s: { note: "D" },
  d: { note: "E" },
  f: { note: "F" },
  g: { note: "G" },
  h: { note: "A" },
  j: { note: "B" },
  // K maps to the next octave's C
  k: { note: "C", deltaOctave: 1 },
};

// Black keys
const BLACK_KEY_MAP: Record<string, { note: string }> = {
  w: { note: "C#" },
  e: { note: "D#" },
  t: { note: "F#" },
  y: { note: "G#" },
  u: { note: "A#" },
};

function getNoteForKey(key: string, baseOctave: number): string | undefined {
  const lower = key.toLowerCase();
  if (WHITE_KEY_MAP[lower]) {
    const { note, deltaOctave = 0 } = WHITE_KEY_MAP[lower];
    const octave = baseOctave + deltaOctave;
    if (octave < 0 || octave > 8)
      return undefined;
    return `${note}${octave}`;
  }
  if (BLACK_KEY_MAP[lower]) {
    const { note } = BLACK_KEY_MAP[lower];
    if (baseOctave < 0 || baseOctave > 8)
      return undefined;
    return `${note}${baseOctave}`;
  }
  return undefined;
}

// Keyboard guide mapping for current selected octave
const visibleKeyboardMapping = computed(() => {
  const mapping: Record<string, string> = {};
  // White keys
  Object.entries(WHITE_KEY_MAP).forEach(([key, { note, deltaOctave = 0 }]) => {
    mapping[key] = `${note}${selectedOctave.value + deltaOctave}`;
  });
  // Black keys
  Object.entries(BLACK_KEY_MAP).forEach(([key, { note }]) => {
    mapping[key] = `${note}${selectedOctave.value}`;
  });
  return mapping;
});

// Validate props
watch(() => props.octaveRange, (newValue) => {
  if (newValue < 1 || newValue > 7) {
    console.warn(
      `PianoPlayground: octaveRange should be between 1 and 7. Received ${newValue}.`,
    );
  }
  // Clamp selectedOctaveIndex when range changes
  if (selectedOctaveIndex.value > newValue - 1) {
    selectedOctaveIndex.value = newValue - 1;
  }
}, { immediate: true });

watch(() => props.startOctave, (newValue, _oldValue) => {
  if (newValue < 0 || newValue > 8) {
    console.warn(
      `PianoPlayground: startOctave should be between 0 and 8. Received ${newValue}.`,
    );
  }
  // Keep selection within bounds after startOctave changes
  const maxIndex = Math.max(0, props.octaveRange - 1);
  selectedOctaveIndex.value = Math.min(selectedOctaveIndex.value, maxIndex);
}, { immediate: true });

// Event handlers
function handleKeyDown(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  // Octave selection via number keys (1..octaveRange)
  if (/^[1-9]$/.test(key)) {
    const requestedIndex = Number.parseInt(key, 10) - 1;
    if (requestedIndex >= 0 && requestedIndex < props.octaveRange) {
      selectedOctaveIndex.value = requestedIndex;
      event.preventDefault();
      return;
    }
  }

  const note = getNoteForKey(key, selectedOctave.value);

  // Prevent default behavior for mapped keys to avoid browser actions
  if (note) {
    event.preventDefault();
  }

  // Skip if key is already pressed (prevents key repeat events)
  if (pressedKeys.value.has(key)) {
    return;
  }

  if (note) {
    pressedKeys.value.add(key);
    if (!activeNotes.value.includes(note)) {
      activeNotes.value = [...activeNotes.value, note];
      emit("noteOn", note);
    }
  }
}

function handleKeyUp(event: KeyboardEvent) {
  const key = event.key.toLowerCase();

  // Ignore keyup for octave selection keys
  if (/^[1-9]$/.test(key))
    return;

  const note = getNoteForKey(key, selectedOctave.value);

  if (note) {
    pressedKeys.value.delete(key);
    activeNotes.value = activeNotes.value.filter(n => n !== note);
    emit("noteOff", note);
  }
}

function handleBlur() {
  // Clear all active notes when component loses focus
  const notesToRelease = [...activeNotes.value];
  activeNotes.value = [];
  pressedKeys.value.clear();
  isFocused.value = false;

  // Emit noteOff for each previously active note
  notesToRelease.forEach((note) => {
    emit("noteOff", note);
  });
}

function handleFocus() {
  isFocused.value = true;
}

// Auto-focus the piano when component is mounted
onMounted(() => {
  if (pianoRef.value) {
    pianoRef.value.focus();
  }
});

// Method to programmatically focus the piano
function focusPiano() {
  if (pianoRef.value) {
    pianoRef.value.focus();
  }
}

// Expose method to parent components
defineExpose({ focusPiano });
</script>

<template>
  <div
    ref="pianoRef"
    class="piano-playground w-full"
    @keydown="handleKeyDown"
    @keyup="handleKeyUp"
    @blur="handleBlur"
    @focus="handleFocus"
  >
    <!-- Visual Piano Component -->
    <VisualPiano
      :active-notes="activeNotes"
      :octaves="octaveRange"
      :start-octave="startOctave"
      :highlighted-notes="highlightedNotes"
      :label-style="labelStyle"
      :theme="theme"
      :color-mode="colorMode"
      :input-enabled="true"
      :show-octave-labels="showOctaveLabels"
    />

    <!-- Keyboard Guide -->
    <div
      v-if="showKeyboardGuide"
      class="keyboard-guide mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Keyboard Mapping
      </h3>

      <!-- Octave selector -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-300 mr-2">Octave:</span>
        <button
          v-for="i in octaveRange"
          :key="i"
          type="button"
          class="btn  btn-ghost btn-square"
          @click="selectedOctaveIndex = i - 1"
        >
          <kbd
            class="kbd"
            :class="i - 1 === selectedOctaveIndex ? 'border-primary' : 'btn-ghost'"
          >
            {{ i }}
          </kbd>
        </button>
        <span class="ml-auto text-xs text-gray-500">Press <kbd class="kbd kbd-xs">1</kbd>..<kbd class="kbd kbd-xs">{{ octaveRange }}</kbd> to switch</span>
      </div>

      <!-- Key hints -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <kbd class="kbd">A</kbd><span class="text-sm">{{ visibleKeyboardMapping.a }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">S</kbd><span class="text-sm">{{ visibleKeyboardMapping.s }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">D</kbd><span class="text-sm">{{ visibleKeyboardMapping.d }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">F</kbd><span class="text-sm">{{ visibleKeyboardMapping.f }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <kbd class="kbd">G</kbd><span class="text-sm">{{ visibleKeyboardMapping.g }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">H</kbd><span class="text-sm">{{ visibleKeyboardMapping.h }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">J</kbd><span class="text-sm">{{ visibleKeyboardMapping.j }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">K</kbd><span class="text-sm">{{ visibleKeyboardMapping.k }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <kbd class="kbd">W</kbd><span class="text-sm">{{ visibleKeyboardMapping.w }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">E</kbd><span class="text-sm">{{ visibleKeyboardMapping.e }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">T</kbd><span class="text-sm">{{ visibleKeyboardMapping.t }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">Y</kbd><span class="text-sm">{{ visibleKeyboardMapping.y }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">U</kbd><span class="text-sm">{{ visibleKeyboardMapping.u }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Focus Instructions -->
    <div
      v-if="!isFocused"
      class="focus-instructions mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
    >
      <p class="text-sm text-blue-700 dark:text-blue-300">
        💡 Click here and press keyboard keys to play the piano!
      </p>
    </div>
  </div>
</template>

<style scoped>
.piano-playground {
  outline: none;
}

.piano-playground:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.key-map-item {
  transition: all 0.2s ease;
}

.key-map-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
