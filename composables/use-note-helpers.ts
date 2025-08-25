import type { Ref } from "vue";

import type { LabelStyle } from "~/types/piano";

import { ACCIDENTAL_FLAT, ACCIDENTAL_SHARP, DO_RE_MI_MAP, ENHARMONIC_FLAT_TO_SHARP, NOTE_NAME_REGEX } from "~/constants/piano";

/**
 * useNoteHelpers
 *
 * Utilities for note identity, enharmonic equivalents, and label formatting.
 */
export function useNoteHelpers(
  highlightedNotes: Ref<string[]>,
  activeNotes: Ref<string[]>,
  internalActiveNotes: Ref<string[]>,
  hintNotes?: Ref<string[]>,
  successNotes?: Ref<string[]>,
) {
  // Generate note identifier for events
  function getNoteId(note: string, octave: number): string {
    return `${note}${octave}`;
  }

  // Get all possible note names for enharmonic equivalents
  function getEnharmonicEquivalents(note: string, octave: number): string[] {
    const noteId = getNoteId(note, octave);
    const equivalents = [noteId];

    // Check if this note has an enharmonic equivalent
    for (const [flat, sharp] of Object.entries(ENHARMONIC_FLAT_TO_SHARP)) {
      if (note === flat) {
        equivalents.push(getNoteId(sharp, octave));
      }
      else if (note === sharp) {
        equivalents.push(getNoteId(flat, octave));
      }
    }

    return equivalents;
  }

  // Check if a note is highlighted (including enharmonic equivalents)
  function isHighlighted(note: string, octave: number): boolean {
    const equivalents = getEnharmonicEquivalents(note, octave);
    return equivalents.some(equiv => highlightedNotes.value.includes(equiv));
  }

  // Check if a note is active (including enharmonic equivalents)
  function isActive(note: string, octave: number): boolean {
    const equivalents = getEnharmonicEquivalents(note, octave);
    const result = equivalents.some(equiv =>
      activeNotes.value.includes(equiv) || internalActiveNotes.value.includes(equiv),
    );

    return result;
  }

  // Check if a note is a hint (next expected note in practice)
  function isHint(note: string, octave: number): boolean {
    if (!hintNotes?.value)
      return false;
    const equivalents = getEnharmonicEquivalents(note, octave);
    return equivalents.some(equiv => hintNotes.value.includes(equiv));
  }

  // Check if a note should show success animation
  function isSuccess(note: string, octave: number): boolean {
    if (!successNotes?.value)
      return false;
    const equivalents = getEnharmonicEquivalents(note, octave);
    return equivalents.some(equiv => successNotes.value.includes(equiv));
  }

  // Pick a display note symbol (prefers flats when present in input sets)
  function getDisplayNote(note: string, octave: number): string {
    if (!note.includes("#"))
      return note;

    // Find the flat equivalent if it's in highlighted or active notes
    const equivalents = getEnharmonicEquivalents(note, octave);
    const allRelevantNotes = [
      ...highlightedNotes.value,
      ...activeNotes.value,
      ...internalActiveNotes.value,
      ...(hintNotes?.value || []),
      ...(successNotes?.value || []),
    ];

    for (const equiv of equivalents) {
      if (allRelevantNotes.includes(equiv)) {
        const [equivNote] = equiv.match(NOTE_NAME_REGEX) || [];
        if (equivNote && equivNote.includes("b")) {
          return equivNote; // Use the flat version
        }
      }
    }

    return note;
  }

  // Map letter names to do-re-mi
  function formatDoReMiLabel(note: string): string {
    return DO_RE_MI_MAP[note as keyof typeof DO_RE_MI_MAP] || note;
  }

  // Map letter labels to use Unicode accidentals (C# → C♯, Db → D♭)
  function formatLetterLabelWithAccidental(note: string): string {
    if (note.includes("#"))
      return note.replace("#", ACCIDENTAL_SHARP);
    if (note.endsWith("b"))
      return note.replace("b", ACCIDENTAL_FLAT);
    return note;
  }

  // Helper function to add octave if needed
  function addOctaveIfNeeded(label: string, octave: number, showOctave: boolean): string {
    return showOctave ? `${label}${octave}` : label;
  }

  // Get note label based on labelStyle prop (refactored into smaller functions)
  function getNoteLabel(
    note: string,
    octave: number,
    labelStyle: LabelStyle,
    showOctaveLabels: boolean,
  ): string {
    if (labelStyle === "none")
      return "";

    const displayNote = getDisplayNote(note, octave);

    if (labelStyle === "do-re-mi") {
      const label = formatDoReMiLabel(displayNote);
      return addOctaveIfNeeded(label, octave, showOctaveLabels);
    }

    // Default to letter notation (with Unicode accidentals)
    const letter = formatLetterLabelWithAccidental(displayNote);
    return addOctaveIfNeeded(letter, octave, showOctaveLabels);
  }

  return {
    getNoteId,
    getEnharmonicEquivalents,
    isHighlighted,
    isActive,
    isHint,
    isSuccess,
    getNoteLabel,
    getDisplayNote,
    formatDoReMiLabel,
  };
}
