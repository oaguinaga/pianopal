import type { KeyboardKeyBlack, KeyboardKeyWhite } from "~/types/piano";

import { KEYBOARD_TO_PIANO_BLACK_MAP, KEYBOARD_TO_PIANO_WHITE_MAP } from "~/constants/piano";

// Local boundaries for octave math when mapping keys → notes
const MIN_OCTAVE_INDEX = 0;
const MAX_OCTAVE_INDEX = 8;

// Utility functions for key mapping
export function getNoteForKey(key: string, baseOctave: number): string | undefined {
  const lower = key.toLowerCase() as KeyboardKeyWhite | KeyboardKeyBlack | string;
  if (lower in KEYBOARD_TO_PIANO_WHITE_MAP) {
    const { note, deltaOctave = 0 } = KEYBOARD_TO_PIANO_WHITE_MAP[lower as KeyboardKeyWhite];
    const octave = baseOctave + deltaOctave;
    if (!withinOctaveBounds(octave))
      return undefined;
    return `${note}${octave}`;
  }
  if (lower in KEYBOARD_TO_PIANO_BLACK_MAP) {
    const { note } = KEYBOARD_TO_PIANO_BLACK_MAP[lower as KeyboardKeyBlack];
    if (!withinOctaveBounds(baseOctave))
      return undefined;
    return `${note}${baseOctave}`;
  }
  return undefined;
}

export function withinOctaveBounds(octave: number): boolean {
  return octave >= MIN_OCTAVE_INDEX && octave <= MAX_OCTAVE_INDEX;
}
