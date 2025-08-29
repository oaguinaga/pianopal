import type { LabelStyle } from "~/types/piano";

import { ACCIDENTAL_FLAT, ACCIDENTAL_SHARP, BLACK_KEY_COLOR_MAP, DO_RE_MI_MAP, NOTE_COLOR_MAP } from "~/constants/piano";

// Map letter labels to use Unicode accidentals (C# → C♯, Db → D♭)
export function formatLetterLabelWithAccidental(note: string): string {
  if (note.includes("#"))
    return note.replace("#", ACCIDENTAL_SHARP);
  if (note.endsWith("b"))
    return note.replace("b", ACCIDENTAL_FLAT);
  return note;
}

export function getNoteLabelColorClass(note: string): string {
  const ALL_NOTES_COLOR_MAP = { ...NOTE_COLOR_MAP, ...BLACK_KEY_COLOR_MAP };

  const noteKey = Object.keys(ALL_NOTES_COLOR_MAP).find(n => n === note);
  if (!noteKey)
    return "";
  return ALL_NOTES_COLOR_MAP[noteKey as keyof typeof ALL_NOTES_COLOR_MAP]?.label || "";
}

export function formatDoReMiLabel(note: string): string {
  return DO_RE_MI_MAP[note as keyof typeof DO_RE_MI_MAP] || note;
}

export function formatNoteLabel(note: string, labelStyle: LabelStyle): string {
  if (labelStyle === "do-re-mi") {
    return formatDoReMiLabel(note);
  }
  return formatLetterLabelWithAccidental(note);
}
