import type { ComputedRef, Ref } from "vue";

import { computed } from "vue";

import type { BlackNote, WhiteNote } from "./use-note-helpers";

// Color mapping for PRD specifications using semantic tokens
const noteColorMap = {
  C: {
    highlight: "bg-blue-200",
    active: "bg-blue-400",
  },
  D: {
    highlight: "bg-purple-200",
    active: "bg-purple-400",
  },
  E: {
    highlight: "bg-pink-200",
    active: "bg-pink-400",
  },
  F: {
    highlight: "bg-emerald-200",
    active: "bg-emerald-400",
  },
  G: {
    highlight: "bg-red-400",
    active: "bg-red-400",
  },
  A: {
    highlight: "bg-orange-200",
    active: "bg-orange-400",
  },
  B: {
    highlight: "bg-yellow-200",
    active: "bg-yellow-400",
  },
} as const;

// Black key color mapping (darker variants) - includes enharmonic equivalents
const blackKeyColorMap = {
  // C# / Db
  "C#": {
    highlight: "bg-blue-900",
    active: "bg-blue-500",
  },
  "Db": {
    highlight: "bg-purple-900",
    active: "bg-purple-500",
  },
  // D# / Eb
  "D#": {
    highlight: "bg-purple-900",
    active: "bg-purple-500",
  },
  "Eb": {
    highlight: "bg-pink-900",
    active: "bg-pink-500",
  },
  // F# / Gb
  "F#": {
    highlight: "bg-emerald-900",
    active: "bg-emerald-500",
  },
  "Gb": {
    highlight: "bg-red-900",
    active: "bg-red-600",
  },
  // G# / Ab
  "G#": {
    highlight: "bg-red-900",
    active: "bg-red-600",
  },
  "Ab": {
    highlight: "bg-orange-900",
    active: "bg-orange-500",
  },
  // A# / Bb
  "A#": {
    highlight: "bg-orange-900",
    active: "bg-orange-500",
  },
  "Bb": {
    highlight: "bg-yellow-900",
    active: "bg-yellow-500",
  },
} as const;

type NoteHelpers = {
  getNoteId: (note: string, octave: number) => string;
  isActive: (note: string, octave: number) => boolean;
  isHighlighted: (note: string, octave: number) => boolean;
  getEnharmonicEquivalents: (note: string, octave: number) => string[];
};

export function useColorClasses(
  highlightedNotes: Ref<string[]>,
  activeNotes: Ref<string[]>,
  internalActiveNotes: Ref<string[]>,
  colorMode: ComputedRef<"per-note" | "mono">,
  octaveNumbers: ComputedRef<number[]>,
  whiteKeys: readonly WhiteNote[],
  blackKeys: readonly BlackNote[],
  noteHelpers: NoteHelpers,
) {
  const { getNoteId, isActive, isHighlighted, getEnharmonicEquivalents } = noteHelpers;

  // Helper function to get white key color classes
  function getWhiteKeyColorClasses(note: WhiteNote, octave: number): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave);

    if (!isNoteActive && !isNoteHighlighted)
      return "";

    if (colorMode.value === "mono") {
      return isNoteActive
        ? "bg-indigo-300 active-key"
        : "bg-indigo-200 highlighted-key";
    }

    // Per-note color mode
    const baseNote = note.charAt(0) as keyof typeof noteColorMap;
    const colorMap = noteColorMap[baseNote];

    if (!colorMap)
      return "";

    return isNoteActive
      ? `${colorMap.active} active-key`
      : `${colorMap.highlight} highlighted-key`;
  }

  // Helper function to get black key color classes
  function getBlackKeyColorClasses(note: BlackNote, octave: number): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave);

    if (!isNoteActive && !isNoteHighlighted)
      return "";

    if (colorMode.value === "mono") {
      return isNoteActive
        ? "bg-indigo-600 active-key"
        : "bg-indigo-900 highlighted-key";
    }

    // Per-note color mode - find which specific note from the props is causing this highlight/active state
    let targetNote: keyof typeof blackKeyColorMap = note as keyof typeof blackKeyColorMap;

    // Check both highlighted and active notes to find the exact note that triggered this
    const allRelevantNotes = [
      ...(isNoteHighlighted ? highlightedNotes.value : []),
      ...(isNoteActive ? [...activeNotes.value, ...internalActiveNotes.value] : []),
    ];

    // Get all enharmonic equivalents for this physical key
    const equivalents = getEnharmonicEquivalents(note, octave);

    // Find which specific note name from the props triggered this highlight/active state
    // Prioritize flat notes if they exist in the props
    let foundFlatNote = false;
    for (const equiv of equivalents) {
      if (allRelevantNotes.includes(equiv)) {
        const [equivNote] = equiv.match(/[A-G][#b]?/) || [];
        if (equivNote && equivNote in blackKeyColorMap) {
          // Prioritize flat notation over sharp
          if (equivNote.includes("b")) {
            targetNote = equivNote as keyof typeof blackKeyColorMap;
            foundFlatNote = true;
            break;
          }
          else if (!foundFlatNote) {
            targetNote = equivNote as keyof typeof blackKeyColorMap;
          }
        }
      }
    }

    const colorMap = blackKeyColorMap[targetNote as keyof typeof blackKeyColorMap];
    if (!colorMap)
      return "";

    return isNoteActive
      ? `${colorMap.active} active-key`
      : `${colorMap.highlight} highlighted-key`;
  }

  // Create a computed property for all key color classes
  const keyColorClasses = computed(() => {
    const classes: Record<string, string> = {};

    // Generate classes for all possible notes
    octaveNumbers.value.forEach((octave) => {
      // White keys
      whiteKeys.forEach((note) => {
        const noteId = getNoteId(note, octave);
        const colorClass = getWhiteKeyColorClasses(note, octave);
        if (colorClass) {
          classes[noteId] = colorClass;
        }
      });

      // Black keys
      blackKeys.forEach((note) => {
        const noteId = getNoteId(note, octave);
        const colorClass = getBlackKeyColorClasses(note, octave);
        if (colorClass) {
          classes[noteId] = colorClass;
        }
      });
    });

    return classes;
  });

  // Get color classes for a note (now uses computed property)
  function getNoteColorClass(note: string, octave: number, _isBlackKey: boolean): string {
    const noteId = getNoteId(note, octave);
    return keyColorClasses.value[noteId] || "";
  }

  // Get label color based on key state
  function getLabelColorClass(note: string, octave: number, isBlackKey: boolean): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave);

    // Use dark text on highlighted/active keys for better contrast
    if (isNoteActive || isNoteHighlighted) {
      return isBlackKey ? "text-gray-950" : "text-gray-950";
    }

    // Default label colors
    return isBlackKey ? "text-white" : "text-gray-600";
  }

  return {
    keyColorClasses,
    getNoteColorClass,
    getLabelColorClass,
  };
}
