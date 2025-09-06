import type { ScaleType } from "~/types/scale";

export const AVAILABLE_SCALE_TYPES: ScaleType[] = [
  "major",
  "natural minor",
  "pentatonic major",
  "pentatonic minor",
  "blues",
];

export const AVAILABLE_ROOT_NOTES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

// Practice mode constants
export const PRACTICE_MODES = {
  ASCENDING: "ascending" as const,
  DESCENDING: "descending" as const,
  BOTH: "both" as const,
} as const;

export const DEFAULT_DIRECTION = "ascending" as const;

// Metronome constants
export const METRONOME_CONFIG = {
  MIN_BPM: 60,
  MAX_BPM: 200,
  DEFAULT_BPM: 30,
} as const;

export const DEFAULT_SCALE_SETTINGS = {
  // Basic scale selection defaults
  root: "C",
  scale: "major",
  bpm: METRONOME_CONFIG.DEFAULT_BPM,
} as const;

export const COUNT_IN_MS = 3200; // 3.2 seconds: "3" (800ms) → "2" (800ms) → "1" (800ms) → "GO!" (800ms)
