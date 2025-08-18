// ============================================================================
// SCALE PRACTICE TYPES & INTERFACES
// ============================================================================

export type ScaleType
  = | "major"
    | "natural minor"
    | "pentatonic major"
    | "pentatonic minor"
    | "blues";

export type PracticeMode = "ascending" | "descending" | "both";

export type MetronomeVisualMode = "noteName" | "pulse";

export type ScaleDefinition = {
  type: ScaleType;
  name: string;
  description: string;
  intervals: string[];
  tonic: string;
};

export type ScaleNote = {
  note: string;
  octave: number;
  midi: number;
  degree: number;
  isRoot: boolean;
};

export type MetronomeConfig = {
  visualMode: MetronomeVisualMode;
  sound: boolean;
};

export type ScalePracticeConfig = {
  root: string;
  scale: string;
  bpm: number;
  metronome: MetronomeConfig;
  practiceMode: PracticeMode;
  loop: boolean;
};

export type ScalePracticeResult = {
  config: ScalePracticeConfig;
  totalNotes: number;
  correctNotes: number;
  accuracy: number; // % correct
  timestamp: Date;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};
