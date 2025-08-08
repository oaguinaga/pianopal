/**
 * Piano Constants
 *
 * Contains all constant values used across the piano components.
 * Uses UPPERCASE_SNAKE_CASE convention for immutable constants.
 */

import type { KeyboardToPianoBlackMap, KeyboardToPianoWhiteMap, LabelStyle } from "~/types/piano";

// Basic note type definitions (to avoid circular imports)
export type WhiteNote = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type BlackNote = "C#" | "D#" | "F#" | "G#" | "A#";

// Piano key configurations
export const WHITE_KEYS: readonly WhiteNote[] = ["C", "D", "E", "F", "G", "A", "B"] as const;
export const BLACK_KEYS: readonly BlackNote[] = ["C#", "D#", "F#", "G#", "A#"] as const;

// Piano configuration limits
export const MIN_OCTAVES = 1;
export const MAX_OCTAVES = 7;
export const WHITE_KEYS_PER_OCTAVE = 7;
export const BLACK_KEYS_PER_OCTAVE = 5;
export const SEMITONES_PER_OCTAVE = 12;

// Black key positioning mapping within each octave
export const BLACK_KEY_MAPPING = {
  "C#": [0, 1], // Between C and D within the octave
  "D#": [1, 2], // Between D and E within the octave
  "F#": [3, 4], // Between F and G within the octave
  "G#": [4, 5], // Between G and A within the octave
  "A#": [5, 6], // Between A and B within the octave
} as const;

// Default styling dimensions
export const DEFAULT_WHITE_KEY_WIDTH = 48;
export const BLACK_KEY_WIDTH_RATIO = 0.6;
export const KEY_GAP = 1;

// Black key position mapping for fallback calculations
export const BLACK_KEY_POSITION_MAP = {
  "C#": 0.5,
  "D#": 1.5,
  "F#": 3.5,
  "G#": 4.5,
  "A#": 5.5,
} as const;

// Color mapping for PRD specifications using semantic tokens
export const NOTE_COLOR_MAP = {
  C: {
    highlight: "bg-blue-200",
    active: "bg-blue-400",
  },
  D: {
    highlight: "bg-purple-200",
    active: "bg-purple-400",
  },
  E: {
    highlight: "bg-pink-200",
    active: "bg-pink-400",
  },
  F: {
    highlight: "bg-emerald-200",
    active: "bg-emerald-400",
  },
  G: {
    highlight: "bg-red-300",
    active: "bg-red-400",
  },
  A: {
    highlight: "bg-orange-200",
    active: "bg-orange-400",
  },
  B: {
    highlight: "bg-yellow-200",
    active: "bg-yellow-400",
  },
} as const;

// Black key color mapping (darker variants) - includes enharmonic equivalents
export const BLACK_KEY_COLOR_MAP = {
  // C# / Db
  "C#": {
    highlight: "bg-blue-900",
    active: "bg-blue-500",
  },
  "Db": {
    highlight: "bg-purple-900",
    active: "bg-purple-500",
  },
  // D# / Eb
  "D#": {
    highlight: "bg-purple-900",
    active: "bg-purple-500",
  },
  "Eb": {
    highlight: "bg-pink-900",
    active: "bg-pink-500",
  },
  // F# / Gb
  "F#": {
    highlight: "bg-emerald-900",
    active: "bg-emerald-600",
  },
  "Gb": {
    highlight: "bg-red-900",
    active: "bg-red-600",
  },
  // G# / Ab
  "G#": {
    highlight: "bg-red-900",
    active: "bg-red-600",
  },
  "Ab": {
    highlight: "bg-orange-900",
    active: "bg-orange-500",
  },
  // A# / Bb
  "A#": {
    highlight: "bg-orange-900",
    active: "bg-orange-500",
  },
  "Bb": {
    highlight: "bg-yellow-900",
    active: "bg-yellow-500",
  },
} as const;

export const LABEL_STYLE_OPTIONS = ["letter", "do-re-mi", "none"] as const;
export const DEFAULT_LABEL_STYLE: LabelStyle = "none";

// Ordered pitch class names for MIDI mapping and note utilities
export const NOTE_NAMES = [
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
] as const;

export const NOTE_NAME_REGEX = /[A-G][#b]?/;

export const ENHARMONIC_FLAT_TO_SHARP = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
} as const;

// QWERTY → Piano mappings used by keyboard input
export const KEYBOARD_TO_PIANO_WHITE_MAP: KeyboardToPianoWhiteMap = {
  a: { note: "C" },
  s: { note: "D" },
  d: { note: "E" },
  f: { note: "F" },
  g: { note: "G" },
  h: { note: "A" },
  j: { note: "B" },
  k: { note: "C", deltaOctave: 1 },
};

export const KEYBOARD_TO_PIANO_BLACK_MAP: KeyboardToPianoBlackMap = {
  w: { note: "C#" },
  e: { note: "D#" },
  t: { note: "F#" },
  y: { note: "G#" },
  u: { note: "A#" },
};

// Unicode accidental characters
export const ACCIDENTAL_SHARP = "♯";
export const ACCIDENTAL_FLAT = "♭";

// Do-Re-Mi mapping (with proper Unicode accidentals)
export const DO_RE_MI_MAP = {
  "C": "Do",
  "C#": `Do${ACCIDENTAL_SHARP}`,
  "Db": `Re${ACCIDENTAL_FLAT}`,
  "D": "Re",
  "D#": `Re${ACCIDENTAL_SHARP}`,
  "Eb": `Mi${ACCIDENTAL_FLAT}`,
  "E": "Mi",
  "F": "Fa",
  "F#": `Fa${ACCIDENTAL_SHARP}`,
  "Gb": `Sol${ACCIDENTAL_FLAT}`,
  "G": "Sol",
  "G#": `Sol${ACCIDENTAL_SHARP}`,
  "Ab": `La${ACCIDENTAL_FLAT}`,
  "A": "La",
  "A#": `La${ACCIDENTAL_SHARP}`,
  "Bb": `Si${ACCIDENTAL_FLAT}`,
  "B": "Si",
} as const;
