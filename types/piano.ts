/**
 * Piano Types
 *
 * Contains all TypeScript types related to piano functionality.
 * Many types are inferred from constants for better maintainability.
 */

// Import types and constants from constants
import type {
  BLACK_KEY_COLOR_MAP,
  BLACK_KEY_MAPPING,
  BLACK_KEY_POSITION_MAP,
  BlackNote,
  NOTE_COLOR_MAP,
  WhiteNote,
} from "~/constants/piano";

// Piano note types - using imported basic types
export type { BlackNote, WhiteNote };
export type FlatNote = "Db" | "Eb" | "Gb" | "Ab" | "Bb";
export type Note = WhiteNote | BlackNote | FlatNote;

// Piano component prop types
export type VisualPianoProps = {
  octaves?: number;
  startOctave?: number;
  theme?: "light" | "dark";
  labelStyle?: "letter" | "do-re-mi" | "none";
  highlightedNotes?: string[];
  activeNotes?: string[];
  disabled?: boolean;
  colorMode?: "per-note" | "mono";
  inputEnabled?: boolean;
  showOctaveLabels?: boolean;
};

export type VisualPianoEmits = {
  noteOn: [note: string];
  noteOff: [note: string];
};

// Piano measurement types
export type BlackKeyPosition = {
  left: string;
  width: string;
  transform: string;
};

// Piano color mapping types - inferred from constants
export type ColorMap = {
  highlight: string;
  active: string;
};

export type NoteColorMap = typeof NOTE_COLOR_MAP;
export type BlackKeyColorMap = typeof BLACK_KEY_COLOR_MAP;

// Black key mapping types - inferred from constants
export type BlackKeyMapping = typeof BLACK_KEY_MAPPING;
export type BlackKeyPositionMap = typeof BLACK_KEY_POSITION_MAP;

// Utility types for working with the constants
export type BlackKeyMappingKey = keyof BlackKeyMapping;
export type BlackKeyColorMapKey = keyof BlackKeyColorMap;
export type NoteColorMapKey = keyof NoteColorMap;
