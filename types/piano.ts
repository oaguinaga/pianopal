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
export type KeyHandler = (note: string, octave: number) => void;

export type VisualPianoProps = {
  octaves?: number;
  startOctave?: number;
  theme?: "light" | "dark";
  labelStyle?: LabelStyle;
  highlightedNotes?: string[];
  activeNotes?: string[];
  disabled?: boolean;
  colorMode?: ColorMode;
  inputEnabled?: boolean;
  showOctaveLabels?: boolean;
  showKeyboardHints?: boolean;
  keyboardHints?: Record<string, string>; // noteId (e.g., C4) -> key (e.g., 'A')
};

export type VisualPianoEmits = {
  "note-on": [note: string];
  "note-off": [note: string];
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

// Keyboard composable config
export type UseKeyboardPianoConfig = {
  octaveRange: { value: number };
  startOctave: { value: number };
  emitNoteOn: (noteId: string) => void;
  emitNoteOff: (noteId: string) => void;
  /**
   * Return the root element of the interactive piano area.
   * Used to avoid marking the keyboard as blocked when focus
   * is within the piano (e.g., focused key buttons).
   */
  getRootEl?: () => HTMLElement | null | undefined;
};

// Label style used across components and stories
export type LabelStyle = "letter" | "do-re-mi" | "none";
export type ColorMode = "per-note" | "mono";

// Computer keyboard types used by the keyboard composable (public for reuse)
export type KeyboardKeyWhite = "a" | "s" | "d" | "f" | "g" | "h" | "j" | "k";
export type KeyboardKeyBlack = "w" | "e" | "t" | "y" | "u";
export type KeyboardKeyNumber = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
export type PianoKeyboardKey = KeyboardKeyWhite | KeyboardKeyBlack | KeyboardKeyNumber;

export type KeyboardToPianoWhiteMap = Record<KeyboardKeyWhite, { note: WhiteNote; deltaOctave?: 0 | 1 }>;
export type KeyboardToPianoBlackMap = Record<KeyboardKeyBlack, { note: BlackNote }>;
