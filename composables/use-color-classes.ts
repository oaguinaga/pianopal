import type { ComputedRef, Ref } from "vue";

import type { BlackNote, ColorMode, WhiteNote } from "~/types/piano";

import { BLACK_KEY_COLOR_MAP, NOTE_COLOR_MAP } from "~/constants/piano";

import { useNoteHelpers } from "./use-note-helpers";

/**
 * useColorClasses
 *
 * Color selection composable for piano keys.
 * Decides Tailwind classes based on highlight/active states and color mode.
 */
export function useColorClasses(
  highlightedNotes: Ref<string[]>,
  activeNotes: Ref<string[]>,
  internalActiveNotes: Ref<string[]>,
  hintNotes: Ref<string[]>,
  successNotes: Ref<string[]>,
  colorMode: ComputedRef<ColorMode>,
  showScaleHighlights: ComputedRef<boolean>,
  showNextNoteHint: ComputedRef<boolean>,
  showSuccessAnimation: ComputedRef<boolean>,
) {
  // Get note helpers
  const { isActive, isHighlighted, isHint, isSuccess, getEnharmonicEquivalents } = useNoteHelpers(
    highlightedNotes,
    activeNotes,
    internalActiveNotes,
    hintNotes,
    successNotes,
  );

  // White keys: mono/per-note branches with practice states
  function getWhiteKeyColorClasses(note: WhiteNote, octave: number): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave) && showScaleHighlights.value;
    const isNoteHint = isHint(note, octave) && showNextNoteHint.value;
    const isNoteSuccess = isSuccess(note, octave);

    // Priority order: active > hint > highlighted (success is additive on top of active)
    if (!isNoteActive && !isNoteHint && !isNoteHighlighted)
      return "";

    // Success animation classes (only applies on top of active state)
    const successClass = isNoteSuccess && isNoteActive && showSuccessAnimation.value
      ? "success-ring"
      : "";

    if (colorMode.value === "mono") {
      let baseClass = "";
      let stateClass = "";

      if (isNoteActive) {
        baseClass = "bg-indigo-300";
        stateClass = "active-key";
      }
      else if (isNoteHint || !showNextNoteHint.value) {
        baseClass = "bg-indigo-200"; // Between highlight and active
        stateClass = "hint-key";
      }
      else if (isNoteHighlighted) {
        baseClass = "bg-indigo-100";
        stateClass = "highlighted-key";
      }

      return `${baseClass} ${stateClass} ${successClass}`.trim();
    }

    // Per-note color mode
    const baseNote = note.charAt(0) as keyof typeof NOTE_COLOR_MAP;
    const colorMap = NOTE_COLOR_MAP[baseNote];

    if (!colorMap)
      return "";

    let baseClass = "";
    let stateClass = "";

    if (isNoteActive) {
      baseClass = colorMap.active;
      stateClass = "active-key";
    }
    /* #TODO: Revisit this logic. currently it makes sense because it allows the user to change to the hint color for the visual representation of all possible notes by sacrificing the hint behavior, meaning the user will not be able to see the hint notes in the visual representation in exchange of high contrast color to detect all scale notes. The concept of highlighted notes might not be needed for chords since the user will practice chord progressions and the next note hint will be enough to guide the user.
    */
    else if (isNoteHint || !showNextNoteHint.value) {
      // Create a hint color between highlight and active
      baseClass = (colorMap as any).hint || colorMap.highlight; // Fallback to highlight if hint not defined
      stateClass = "hint-key";
    }
    else if (isNoteHighlighted) {
      baseClass = colorMap.highlight;
      stateClass = "highlighted-key";
    }

    return `${baseClass} ${stateClass} ${successClass}`.trim();
  }

  // Black keys: mono/per-note with enharmonic-aware selection and practice states
  function getBlackKeyColorClasses(note: BlackNote, octave: number): string {
    const isNoteActive = isActive(note, octave);
    const isNoteHighlighted = isHighlighted(note, octave) && showScaleHighlights.value;
    const isNoteHint = isHint(note, octave) && showNextNoteHint.value;
    const isNoteSuccess = isSuccess(note, octave);

    // Priority order: active > hint > highlighted (success is additive on top of active)
    if (!isNoteActive && !isNoteHint && !isNoteHighlighted)
      return "";

    // Success animation classes (only applies on top of active state)
    const successClass = isNoteSuccess && isNoteActive && showSuccessAnimation.value
      ? "success-ring"
      : "";

    if (colorMode.value === "mono") {
      let baseClass = "";
      let stateClass = "";

      if (isNoteActive) {
        baseClass = "bg-indigo-600";
        stateClass = "active-key";
      }
      else if (isNoteHint) {
        baseClass = "bg-indigo-700"; // Between highlight and active
        stateClass = "hint-key";
      }
      else if (isNoteHighlighted) {
        baseClass = "bg-indigo-900";
        stateClass = "highlighted-key";
      }

      return `${baseClass} ${stateClass} ${successClass}`.trim();
    }

    // Per-note color mode - find which specific note from the props is causing this highlight/active state
    let targetNote: keyof typeof BLACK_KEY_COLOR_MAP = note as keyof typeof BLACK_KEY_COLOR_MAP;

    // Check all relevant note arrays to find the exact note that triggered this state
    const allRelevantNotes = [
      ...(isNoteHighlighted ? highlightedNotes.value : []),
      ...(isNoteActive ? [...activeNotes.value, ...internalActiveNotes.value] : []),
      ...(isNoteHint ? hintNotes.value : []),
      ...(isNoteSuccess ? successNotes.value : []),
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

    let baseClass = "";
    let stateClass = "";

    if (isNoteActive) {
      baseClass = colorMap.active;
      stateClass = "active-key";
    }
    else if (isNoteHint) {
      baseClass = (colorMap as any).hint || colorMap.highlight; // Fallback to highlight if hint not defined
      stateClass = "hint-key";
    }
    else if (isNoteHighlighted) {
      baseClass = colorMap.highlight;
      stateClass = "highlighted-key";
    }

    return `${baseClass} ${stateClass} ${successClass}`.trim();
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
    const isNoteHighlighted = isHighlighted(note, octave) && showScaleHighlights.value;
    const isNoteHint = isHint(note, octave) && showNextNoteHint.value;
    const isNoteSuccess = isSuccess(note, octave);

    // Use dark text on highlighted/active/hint/success keys for better contrast
    if (isNoteActive || isNoteSuccess || isNoteHint || isNoteHighlighted) {
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
