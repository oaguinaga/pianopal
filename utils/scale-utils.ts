import { Note, Scale } from "tonal";

import type {
  PracticeMode,
  ScaleNote,
  ScalePracticeConfig,
  ScaleType,
  ValidationResult,
} from "~/types/scale";

import {
  AVAILABLE_ROOT_NOTES,
  AVAILABLE_SCALE_TYPES,
  METRONOME_CONFIG,
  SCALE_GENERATION,
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
 * Get scale notes with metadata (octave, MIDI, degree)
 * @param root - Root note
 * @param type - Scale type
 * @param startOctave - Starting octave (default: 4)
 * @returns Array of ScaleNote objects
 */
export function getScaleNotes(
  root: string,
  type: ScaleType,
  startOctave: number = SCALE_GENERATION.DEFAULT_OCTAVE,
): ScaleNote[] {
  const notes = generateScale(root, type);
  if (!notes.length)
    return [];

  return notes.map((note, index) => {
    // Calculate the relative position of the note in the scale
    // C is at position 0, D is at position 1, etc.
    const noteIndex = AVAILABLE_ROOT_NOTES.indexOf(note);
    if (noteIndex === -1) {
      // Fallback: use the index in the scale
      const relativeOctave = Math.floor(index / 7);
      return {
        note,
        octave: startOctave + relativeOctave,
        midi: Note.midi(`${note}${startOctave + relativeOctave}`) || 0,
        degree: index + 1,
        isRoot: index === 0,
      };
    }

    // Calculate octave based on the note's position relative to the root
    const rootIndex = AVAILABLE_ROOT_NOTES.indexOf(notes[0]);
    const relativePosition = noteIndex - rootIndex;
    const relativeOctave = Math.floor(relativePosition / 12);

    return {
      note,
      octave: startOctave + relativeOctave,
      midi: Note.midi(`${note}${startOctave + relativeOctave}`) || 0,
      degree: index + 1,
      isRoot: index === 0,
    };
  });
}

/**
 * Transpose a scale by a number of semitones
 * @param notes - Array of note names
 * @param semitones - Number of semitones to transpose
 * @returns Transposed array of note names
 */
export function transposeScale(notes: string[], semitones: number): string[] {
  return notes.map((note) => {
    // For Tonal.js, we need to use interval notation like "2M" for major second
    let interval: string;
    if (semitones === 2) {
      interval = "2M";
    }
    else if (semitones === -2) {
      interval = "-2M";
    }
    else if (semitones === 1) {
      interval = "2m";
    }
    else if (semitones === -1) {
      interval = "-2m";
    }
    else {
      // For other semitones, use the raw number
      interval = semitones > 0 ? `+${semitones}` : `${semitones}`;
    }

    const transposed = Note.transpose(note, interval);
    return transposed || note;
  });
}

/**
 * Get scale notes in different octaves
 * @param root - Root note
 * @param type - Scale type
 * @param octaveRange - Number of octaves to generate
 * @param startOctave - Starting octave
 * @returns Array of ScaleNote objects across multiple octaves
 */
export function getMultiOctaveScale(
  root: string,
  type: ScaleType,
  octaveRange: number = SCALE_GENERATION.DEFAULT_OCTAVE_RANGE,
  startOctave: number = SCALE_GENERATION.DEFAULT_OCTAVE,
): ScaleNote[] {
  const notes: ScaleNote[] = [];

  for (let octave = startOctave; octave < startOctave + octaveRange; octave++) {
    const octaveNotes = getScaleNotes(root, type, octave);
    notes.push(...octaveNotes);
  }

  return notes;
}

// ============================================================================
// PRACTICE MODE FUNCTIONS
// ============================================================================

/**
 * Get scale notes for a specific practice mode
 * @param root - Root note
 * @param type - Scale type
 * @param mode - Practice mode
 * @param startOctave - Starting octave
 * @returns Array of ScaleNote objects in practice order
 */
export function getPracticeScaleNotes(
  root: string,
  type: ScaleType,
  mode: PracticeMode,
  startOctave: number = SCALE_GENERATION.DEFAULT_OCTAVE,
): ScaleNote[] {
  const notes = getScaleNotes(root, type, startOctave);

  switch (mode) {
    case "ascending":
      return notes;
    case "descending":
      return [...notes].reverse();
    case "both": {
      // Ascending then descending (excluding root twice)
      // Pattern: C D E F G A B + A G F E D C (13 total)
      const ascending = notes;
      // For descending, we want: A G F E D C (excluding the root C)
      // So we take notes[1] to notes[5] and reverse them, then add C at the end
      const descending = notes.slice(1, -1).reverse().map(note => ({
        ...note,
        octave: note.octave + 1,
        midi: note.midi + 12, // Add one octave
        degree: note.degree,
      }));

      // Add the root note C at the end of descending (but in the next octave)
      const rootNote = {
        ...notes[0],
        octave: notes[0].octave + 1,
        midi: notes[0].midi + 12,
        degree: notes[0].degree,
      };

      return [...ascending, ...descending, rootNote];
    }
    default:
      return notes;
  }
}

/**
 * Get the next expected note in a practice sequence
 * @param currentNote - Current note being played
 * @param scaleNotes - Array of scale notes in practice order
 * @returns Next expected note or null if at end
 */
export function getNextExpectedNote(
  currentNote: string,
  scaleNotes: ScaleNote[],
): ScaleNote | null {
  const currentIndex = scaleNotes.findIndex(n => n.note === currentNote);

  if (currentIndex === -1 || currentIndex >= scaleNotes.length - 1) {
    return null;
  }

  return scaleNotes[currentIndex + 1];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a note is part of a scale
 * @param note - Note to check
 * @param scaleNotes - Array of scale notes
 * @returns True if note is in scale
 */
export function isNoteInScale(note: string, scaleNotes: ScaleNote[]): boolean {
  return scaleNotes.some(scaleNote => scaleNote.note === note);
}

/**
 * Get scale degree for a note
 * @param note - Note to find degree for
 * @param scaleNotes - Array of scale notes
 * @returns Scale degree (1-7) or 0 if not found
 */
export function getScaleDegree(note: string, scaleNotes: ScaleNote[]): number {
  const scaleNote = scaleNotes.find(sn => sn.note === note);
  return scaleNote ? scaleNote.degree : 0;
}

/**
 * Get enharmonic equivalents for a note
 * @param note - Note to find equivalents for
 * @returns Array of enharmonic equivalents
 */
export function getEnharmonicEquivalents(note: string): string[] {
  const equivalents = Note.enharmonic(note);
  return equivalents ? [equivalents] : [];
}

/**
 * Validate a scale configuration
 * @param config - Scale practice configuration
 * @returns Validation result with errors if any
 */
export function validateScaleConfig(config: ScalePracticeConfig): ValidationResult {
  const errors: string[] = [];

  // Validate root note
  if (!AVAILABLE_ROOT_NOTES.includes(config.root)) {
    errors.push(`Invalid root note: ${config.root}`);
  }

  // Validate scale type
  if (!AVAILABLE_SCALE_TYPES.includes(config.scale as ScaleType)) {
    errors.push(`Invalid scale type: ${config.scale}`);
  }

  // Validate BPM
  if (config.bpm < METRONOME_CONFIG.MIN_BPM || config.bpm > METRONOME_CONFIG.MAX_BPM) {
    errors.push(`BPM must be between ${METRONOME_CONFIG.MIN_BPM} and ${METRONOME_CONFIG.MAX_BPM}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
