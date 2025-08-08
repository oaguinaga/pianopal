import type { Ref } from "vue";

import type { LabelStyle } from "~/types/piano";

// Enharmonic equivalents mapping (flat to sharp)
const enharmonicMap: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
} as const;

export function useNoteHelpers(
  highlightedNotes: Ref<string[]>,
  activeNotes: Ref<string[]>,
  internalActiveNotes: Ref<string[]>,
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
    for (const [flat, sharp] of Object.entries(enharmonicMap)) {
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

  // Helper function to determine display note (flat vs sharp preference)
  function getDisplayNote(note: string, octave: number): string {
    if (!note.includes("#"))
      return note;

    // Find the flat equivalent if it's in highlighted or active notes
    const equivalents = getEnharmonicEquivalents(note, octave);
    const allRelevantNotes = [
      ...highlightedNotes.value,
      ...activeNotes.value,
      ...internalActiveNotes.value,
    ];

    for (const equiv of equivalents) {
      if (allRelevantNotes.includes(equiv)) {
        const [equivNote] = equiv.match(/[A-G][#b]?/) || [];
        if (equivNote && equivNote.includes("b")) {
          return equivNote; // Use the flat version
        }
      }
    }

    return note;
  }

  // Helper function to format do-re-mi labels
  function formatDoReMiLabel(note: string): string {
    const doReMiMap: Record<string, string> = {
      "C": "Do",
      "C#": "Do#",
      "Db": "Re♭",
      "D": "Re",
      "D#": "Re#",
      "Eb": "Mi♭",
      "E": "Mi",
      "F": "Fa",
      "F#": "Fa#",
      "Gb": "Sol♭",
      "G": "Sol",
      "G#": "Sol#",
      "Ab": "La♭",
      "A": "La",
      "A#": "La#",
      "Bb": "Si♭",
      "B": "Si",
    } as const;

    return doReMiMap[note] || note;
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

    // Default to letter notation
    return addOctaveIfNeeded(displayNote, octave, showOctaveLabels);
  }

  return {
    getNoteId,
    getEnharmonicEquivalents,
    isHighlighted,
    isActive,
    getNoteLabel,
    getDisplayNote,
    formatDoReMiLabel,
  };
}
