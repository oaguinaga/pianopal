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
  VISUAL_MODES: {
    NOTE_NAME: "note_name" as const,
    PULSE: "pulse" as const,
  },
} as const;

export const DEFAULT_SCALE_SETTINGS = {
  // Basic scale selection defaults
  root: "D",
  scale: "blues",
  bpm: METRONOME_CONFIG.DEFAULT_BPM,

  displayPreferences: {
    showNoteNames: true,
    showScaleDegrees: true,
    showKeySignatures: true,
    highlightCurrentNote: true,
    showProgressBar: true,
  },
  practiceModes: {
    autoAdvance: false,
    countIn: true,
    loopPractice: true,
    randomizeOrder: false,
  },
  audioSettings: {
    metronomeVolume: 0.7,
    noteVolume: 0.8,
    enableHarmonics: false,
  },
  tempoSettings: {
    maxTempo: METRONOME_CONFIG.MAX_BPM,
    minTempo: METRONOME_CONFIG.MIN_BPM,
  },
} as const;

export const PRACTICE_SESSION_DEFAULTS = {
  countInBars: 2,
  countInTempo: 60,
  autoAdvanceDelay: 2000, // ms
  successGlowDuration: 500, // ms
  errorFeedbackDuration: 1000, // ms
} as const;

export const COUNT_IN_MS = 2000;
