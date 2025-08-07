import type { ComputedRef, Ref } from "vue";

import type { BlackNote, WhiteNote } from "~/types/piano";

import { BLACK_KEY_COLOR_MAP, NOTE_COLOR_MAP } from "~/constants/piano";

import { useNoteHelpers } from "./use-note-helpers";

export function useColorClasses(
  highlightedNotes: Ref<string[]>,
  activeNotes: Ref<string[]>,
  internalActiveNotes: Ref<string[]>,
  colorMode: ComputedRef<"per-note" | "mono">,
) {
  // Get note helpers
  const { isActive, isHighlighted, getEnharmonicEquivalents } = useNoteHelpers(
    highlightedNotes,
    activeNotes,
    internalActiveNotes,
  );

  // Helper function to get white key color classes
  function getWhiteKeyColorClasses(note: WhiteNote, octave: number): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave);

    if (!isNoteActive && !isNoteHighlighted)
      return "";

    if (colorMode.value === "mono") {
      const result = isNoteActive
        ? "bg-indigo-300 active-key"
        : "bg-indigo-200 highlighted-key";
      return result;
    }

    // Per-note color mode
    const baseNote = note.charAt(0) as keyof typeof NOTE_COLOR_MAP;
    const colorMap = NOTE_COLOR_MAP[baseNote];

    if (!colorMap)
      return "";

    const result = isNoteActive
      ? `${colorMap.active} active-key`
      : `${colorMap.highlight} highlighted-key`;

    return result;
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
    let targetNote: keyof typeof BLACK_KEY_COLOR_MAP = note as keyof typeof BLACK_KEY_COLOR_MAP;

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
        if (equivNote && equivNote in BLACK_KEY_COLOR_MAP) {
          // Prioritize flat notation over sharp
          if (equivNote.includes("b")) {
            targetNote = equivNote as keyof typeof BLACK_KEY_COLOR_MAP;
            foundFlatNote = true;
            break;
          }
          else if (!foundFlatNote) {
            targetNote = equivNote as keyof typeof BLACK_KEY_COLOR_MAP;
          }
        }
      }
    }

    const colorMap = BLACK_KEY_COLOR_MAP[targetNote as keyof typeof BLACK_KEY_COLOR_MAP];
    if (!colorMap)
      return "";

    return isNoteActive
      ? `${colorMap.active} active-key`
      : `${colorMap.highlight} highlighted-key`;
  }

  // Get color classes for a note (direct reactive approach)
  function getNoteColorClass(note: string, octave: number, isBlackKey: boolean): string {
    const result = isBlackKey
      ? getBlackKeyColorClasses(note as BlackNote, octave)
      : getWhiteKeyColorClasses(note as WhiteNote, octave);

    return result;
  }

  // Get label color based on key state
  function getLabelColorClass(note: string, octave: number, isBlackKey: boolean): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave);

    // Use dark text on highlighted/active keys for better contrast
    if (isNoteActive || isNoteHighlighted) {
      return isBlackKey ? "text-white" : "text-gray-950";
    }

    // Default label colors
    return isBlackKey ? "text-white" : "text-gray-600";
  }

  return {
    getNoteColorClass,
    getLabelColorClass,
  };
}
