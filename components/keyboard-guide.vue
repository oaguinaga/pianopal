<script setup lang="ts">
import { computed } from "vue";

import { BLACK_KEY_COLOR_MAP, KEYBOARD_TO_PIANO_BLACK_MAP, KEYBOARD_TO_PIANO_WHITE_MAP, NOTE_COLOR_MAP } from "~/constants/piano";

// Type definitions for better type safety
type KeyboardKeyWhite = keyof typeof KEYBOARD_TO_PIANO_WHITE_MAP;
type KeyboardKeyBlack = keyof typeof KEYBOARD_TO_PIANO_BLACK_MAP;
type MusicalKey = KeyboardKeyWhite | KeyboardKeyBlack;
type OctaveKey = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0";

// Emits
type Emits = {
  "octave-change": [index: number];
};
// Props with sensible defaults
type Props = {
  octaveRange?: number;
  visibleKeyboardMapping: Record<string, string>;
  selectedOctaveIndex: number;
  startOctave?: number;
};

const props = withDefaults(defineProps<Props>(), {
  octaveRange: 2,
  startOctave: 2,
});

const emit = defineEmits<Emits>();

// Static layout constants (outside setup to avoid recomputation)
const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  // ["z", "x", "c", "v", "b", "n", "m"],
] as const;

const OCTAVE_ROW: OctaveKey[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

// Tailwind/DaisyUI class constants for consistency
const TAILWIND_CLASSES = {
  // Base key styles
  kbd: "kbd text-xs w-10 h-10 flex flex-col items-center justify-center font-mono font-bold transition-all duration-200 relative",

  // Octave key states
  octaveActive: "bg-primary text-primary-content border-primary cursor-pointer",
  octaveInactive: "bg-base-200 dark:bg-base-300 text-base-content dark:text-base-content cursor-not-allowed",

  // Musical key states
  musicalMapped: "cursor-help",
  musicalUnmapped: "cursor-not-allowed",

  // Default unmapped key
  unmapped: "bg-base-200 dark:bg-base-300",
} as const;

/**
 * Type-safe lookup for white key mapping
 * @param key - The keyboard key to look up
 * @returns The white key mapping or undefined if not found
 */
function getWhiteKeyMapping(key: string): typeof KEYBOARD_TO_PIANO_WHITE_MAP[KeyboardKeyWhite] | undefined {
  return KEYBOARD_TO_PIANO_WHITE_MAP[key as KeyboardKeyWhite];
}

/**
 * Type-safe lookup for black key mapping
 * @param key - The keyboard key to look up
 * @returns The black key mapping or undefined if not found
 */
function getBlackKeyMapping(key: string): typeof KEYBOARD_TO_PIANO_BLACK_MAP[KeyboardKeyBlack] | undefined {
  return KEYBOARD_TO_PIANO_BLACK_MAP[key as KeyboardKeyBlack];
}

/**
 * Gets the color class for a musical key based on its note mapping
 * @param key - The keyboard key to get color for
 * @returns The appropriate Tailwind/DaisyUI color class
 */
function getMusicalKeyColor(key: string): string {
  const whiteKey = getWhiteKeyMapping(key);
  if (whiteKey) {
    return NOTE_COLOR_MAP[whiteKey.note].active;
  }

  const blackKey = getBlackKeyMapping(key);
  if (blackKey) {
    return BLACK_KEY_COLOR_MAP[blackKey.note].highlight;
  }

  return TAILWIND_CLASSES.unmapped;
}

/**
 * Gets the note name for a musical key
 * @param key - The keyboard key to get note name for
 * @returns The note name or empty string if unmapped
 */
function getMusicalKeyNote(key: string): string {
  const whiteKey = getWhiteKeyMapping(key);
  if (whiteKey) {
    return whiteKey.note;
  }

  const blackKey = getBlackKeyMapping(key);
  if (blackKey) {
    return blackKey.note;
  }

  return "";
}

function isMusicalKey(key: string): key is MusicalKey {
  return getMusicalKeyNote(key) !== "";
}

function getOctaveIndex(key: OctaveKey): number {
  return key === "0" ? 9 : Number.parseInt(key, 10) - 1;
}

function isOctaveActive(key: OctaveKey): boolean {
  const octaveIndex = getOctaveIndex(key);
  return octaveIndex < props.octaveRange;
}

function getOctaveLabel(key: OctaveKey): string {
  const octaveIndex = getOctaveIndex(key);
  return `Octave ${props.startOctave + octaveIndex}`;
}

function getOctaveKeyClasses(key: OctaveKey): string[] {
  if (isOctaveActive(key)) {
    return [TAILWIND_CLASSES.octaveActive];
  }
  return [TAILWIND_CLASSES.octaveInactive];
}

function getMusicalKeyClasses(key: string): string[] {
  const colorClass = getMusicalKeyColor(key);
  const cursorClass = isMusicalKey(key) ? TAILWIND_CLASSES.musicalMapped : TAILWIND_CLASSES.musicalUnmapped;

  return [colorClass, cursorClass];
}

function getOctaveTooltip(key: OctaveKey): string {
  return isOctaveActive(key) ? getOctaveLabel(key) : "";
}

function getMusicalKeyTooltip(key: string): string {
  const noteName = getMusicalKeyNote(key);
  return noteName ? `Note: ${noteName}` : "";
}

// Computed properties for reactive class bindings
const octaveKeyClassMap = computed(() => {
  const classMap: Record<OctaveKey, string[]> = {} as Record<OctaveKey, string[]>;

  OCTAVE_ROW.forEach((key) => {
    classMap[key] = getOctaveKeyClasses(key);
  });

  return classMap;
});

const musicalKeyClassMap = computed(() => {
  const classMap: Record<string, string[]> = {};

  KEYBOARD_ROWS.flat().forEach((key) => {
    classMap[key] = getMusicalKeyClasses(key);
  });

  return classMap;
});
</script>

<template>
  <div class="keyboard-guide mt-6 p-4 rounded-lg">
    <!-- Visual keyboard layout -->
    <div class="space-y-1">
      <!-- Octave row -->
      <div class="flex w-full justify-center gap-1">
        <div
          v-for="key in OCTAVE_ROW"
          :key="`octave-${key}`"
          class="relative flex flex-col items-center"
        >
          <div class="tooltip" :data-tip="getOctaveTooltip(key)">
            <kbd
              :class="[TAILWIND_CLASSES.kbd, octaveKeyClassMap[key]]"
              @click="isOctaveActive(key) ? emit('octave-change', getOctaveIndex(key)) : undefined"
            >
              <!-- Octave number -->
              <span class="text-xs leading-none">
                {{ key }}
              </span>
            </kbd>
          </div>
        </div>
      </div>

      <!-- Musical keyboard rows -->
      <div
        v-for="(row, rowIndex) in KEYBOARD_ROWS"
        :key="rowIndex"
        class="flex w-full justify-center gap-1"
      >
        <div
          v-for="key in row"
          :key="key"
          class="relative flex flex-col items-center"
        >
          <div class="tooltip" :data-tip="getMusicalKeyTooltip(key)">
            <kbd :class="[TAILWIND_CLASSES.kbd, musicalKeyClassMap[key]]">
              <!-- Key letter -->
              <span class="text-xs leading-none">{{ key.toUpperCase() }}</span>
            </kbd>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.keyboard-guide {
  transition: all 0.2s ease;
}

.kbd {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.kbd:hover:not(.cursor-not-allowed) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  scale: 1.05;
}
</style>
