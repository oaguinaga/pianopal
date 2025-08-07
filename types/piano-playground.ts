/**
 * PianoPlayground Types
 *
 * Contains all TypeScript types related to the PianoPlayground component.
 * Centralized type definitions for better maintainability.
 */

// PianoPlayground component prop types
export type PianoPlaygroundProps = {
  octaveRange?: number;
  startOctave?: number;
  showKeyboardGuide?: boolean;
  labelStyle?: "letter" | "do-re-mi" | "none";
  theme?: "light" | "dark";
  colorMode?: "per-note" | "mono";
  showOctaveLabels?: boolean;
  highlightedNotes?: string[];
};

// PianoPlayground component emit types
export type PianoPlaygroundEmits = {
  noteOn: [note: string];
  noteOff: [note: string];
};

// Keyboard mapping types
export type KeyboardMapping = Record<string, string>;

// Base keyboard mapping type (for type safety)
export type BaseKeyboardMapping = {
  // Primary octave (octave 4)
  "a": "C4";
  "w": "C#4";
  "s": "D4";
  "e": "D#4";
  "d": "E4";
  "f": "F4";
  "t": "F#4";
  "g": "G4";
  "y": "G#4";
  "h": "A4";
  "u": "A#4";
  "j": "B4";
  "k": "C5";
  "o": "C#5";
  "l": "D5";
  "p": "D#5";
  ";": "E5";
  "'": "F5";
  // Lower octave (octave 3)
  "z": "C3";
  "x": "D3";
  "c": "E3";
  "v": "F3";
  "b": "G3";
  "n": "A3";
  "m": "B3";
};

// Component exposed methods
export type PianoPlaygroundExposed = {
  focusPiano: () => void;
};
