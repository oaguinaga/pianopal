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

export type MetronomeVisualMode = "note-name" | "pulse";

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

export type Scale = {
  root: string;
  type: ScaleType;
  notes: ScaleNote[];
};

export type ScalePracticeSession = {
  id: string;
  scale: Scale;
  tempo: number;
  direction: PracticeMode;
  repetitions: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  currentNoteIndex: number;
  completedNotes: number;
  accuracy: number;
  config: ScalePracticeConfig;
};

export type ScaleSettings = {
  displayPreferences: {
    showNoteNames: boolean;
    showScaleDegrees: boolean;
    showKeySignatures: boolean;
    highlightCurrentNote: boolean;
    showProgressBar: boolean;
  };
  practiceModes: {
    autoAdvance: boolean;
    countIn: boolean;
    loopPractice: boolean;
    randomizeOrder: boolean;
  };
  audioSettings: {
    metronomeVolume: number;
    noteVolume: number;
    enableHarmonics: boolean;
  };
  tempoSettings: {
    maxTempo: number;
    minTempo: number;
  };
};

export type PracticeSessionState
  = | "idle"
    | "count-in"
    | "playing"
    | "paused"
    | "grading"
    | "completed"
    | "error";

export type NotePlayedEvent = {
  note: string;
  octave: number;
  midi: number;
  timestamp: Date;
  isCorrect: boolean;
  expectedNote?: string;
  accuracy?: number;
};
