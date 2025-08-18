import type { ScaleDefinition, ScaleType } from "~/types/scale";

// ============================================================================
// SCALE PRACTICE CONSTANTS
// ============================================================================

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

export const SCALE_DEFINITIONS: Record<ScaleType, ScaleDefinition> = {
  "major": {
    type: "major",
    name: "Major Scale",
    description: "The most common scale in Western music",
    intervals: ["1P", "2M", "3M", "4P", "5P", "6M", "7M"],
    tonic: "C",
  },
  "natural minor": {
    type: "natural minor",
    name: "Natural Minor Scale",
    description: "Also known as Aeolian mode",
    intervals: ["1P", "2M", "3m", "4P", "5P", "6m", "7m"],
    tonic: "A",
  },
  "pentatonic major": {
    type: "pentatonic major",
    name: "Major Pentatonic Scale",
    description: "Five-note scale common in folk and pop music",
    intervals: ["1P", "2M", "3M", "5P", "6M"],
    tonic: "C",
  },
  "pentatonic minor": {
    type: "pentatonic minor",
    name: "Minor Pentatonic Scale",
    description: "Five-note scale common in blues and rock",
    intervals: ["1P", "3m", "4P", "5P", "7m"],
    tonic: "A",
  },
  "blues": {
    type: "blues",
    name: "Blues Scale",
    description: "Minor pentatonic with added blue note",
    intervals: ["1P", "3m", "4P", "5P", "7m", "5A"],
    tonic: "A",
  },
};

// Practice mode constants
export const PRACTICE_MODES = {
  ASCENDING: "ascending" as const,
  DESCENDING: "descending" as const,
  BOTH: "both" as const,
} as const;

// Metronome constants
export const METRONOME_CONFIG = {
  MIN_BPM: 60,
  MAX_BPM: 200,
  DEFAULT_BPM: 120,
  VISUAL_MODES: {
    NOTE_NAME: "note_name" as const,
    PULSE: "pulse" as const,
  },
} as const;

// Scale generation constants
export const SCALE_GENERATION = {
  DEFAULT_OCTAVE: 4,
  DEFAULT_OCTAVE_RANGE: 2,
  MIDI_C4: 60, // Middle C
} as const;
