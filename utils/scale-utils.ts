import { Note, Scale } from "tonal";

import type {
  ScaleNote,
  ScaleType,
} from "~/types/scale";

import { DEFAULT_OCTAVE } from "~/constants/piano";
import {
  AVAILABLE_ROOT_NOTES,
  AVAILABLE_SCALE_TYPES,
} from "~/constants/scale";

// ============================================================================
// CORE SCALE FUNCTIONS
// ============================================================================

/**
 * Generate a scale based on root note and scale type
 * @param root - Root note (e.g., 'C', 'F#', 'Bb')
 * @param type - Scale type from ScaleType
 * @returns Array of note names
 */
export function generateScale(root: string, type: ScaleType): string[] {
  try {
    // Validate root note
    if (!Note.get(root)) {
      throw new Error(`Invalid root note: ${root}`);
    }

    // Validate scale type
    if (!AVAILABLE_SCALE_TYPES.includes(type)) {
      throw new Error(`Unknown scale type: ${type}`);
    }

    // Generate scale using Tonal.js
    let scaleName: string;

    // Map our scale types to Tonal.js scale names
    switch (type) {
      case "natural minor":
        scaleName = "minor";
        break;
      case "pentatonic major":
        scaleName = "major pentatonic";
        break;
      case "pentatonic minor":
        scaleName = "minor pentatonic";
        break;
      case "blues":
        scaleName = "blues";
        break;
      case "major":
      default:
        scaleName = "major";
        break;
    }

    const scale = Scale.get(`${root} ${scaleName}`);
    if (!scale || !scale.notes) {
      throw new Error(`Failed to generate ${scaleName} scale for root ${root}`);
    }

    return scale.notes;
  }
  catch (error) {
    console.error("Error generating scale:", error);
    return [];
  }
}

/**
 * Get scale notes with metadata (octave, MIDI, degree).
 * Handles correct octave assignment starting from a given octave.
 *
 * @param root - Root note (e.g. "F")
 * @param type - Scale type (e.g. "major")
 * @param startOctave - Starting octave (default: 4)
 * @returns Array of ScaleNote objects
 */
export function getScaleNotes(
  root: string,
  type: ScaleType,
  startOctave: number = DEFAULT_OCTAVE,
): ScaleNote[] {
  const scaleNotes = generateScale(root, type);
  if (scaleNotes.length === 0)
    return [];

  const rootNote = scaleNotes[0];

  /**
   * Determine the correct octave for a given note relative to the root.
   */
  function resolveOctave(note: string, index: number): number {
    if (index === 0)
      return startOctave;

    const rootMidi = Note.midi(`${rootNote}${startOctave}`);
    const currentMidi = Note.midi(`${note}${startOctave}`);

    if (rootMidi && currentMidi) {
      // If the note would be lower than the root in the same octave, bump it up
      return currentMidi < rootMidi ? startOctave + 1 : startOctave;
    }

    // Fallback: compare positions in chromatic scale
    const rootIndex = AVAILABLE_ROOT_NOTES.indexOf(rootNote);
    const noteIndex = AVAILABLE_ROOT_NOTES.indexOf(note);

    if (rootIndex !== -1 && noteIndex !== -1 && noteIndex < rootIndex) {
      return startOctave + 1;
    }

    return startOctave;
  }

  return scaleNotes.map((note, index) => {
    const octave = resolveOctave(note, index);
    return {
      note,
      octave,
      midi: Note.midi(`${note}${octave}`) || 0,
      degree: index + 1,
      isRoot: index === 0,
    };
  });
}
