import { describe, expect, it } from "vitest";

import type { PracticeMode, ScaleType } from "@/types/scale";

import { AVAILABLE_ROOT_NOTES, AVAILABLE_SCALE_TYPES } from "@/constants/scale";
import {
  generateScale,
  getPracticeScaleNotes,
  getScaleDegree,
  getScaleNotes,
  isNoteInScale,
  transposeScale,
  validateScaleConfig,
} from "@/utils/scale-utils";

describe("scale Utilities", () => {
  describe("generateScale", () => {
    it("should generate a C major scale", () => {
      const scale = generateScale("C", "major");
      expect(scale).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    });

    it("should generate an A natural minor scale", () => {
      const scale = generateScale("A", "natural minor");
      expect(scale).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    });

    it("should generate a C pentatonic major scale", () => {
      const scale = generateScale("C", "pentatonic major");
      expect(scale).toEqual(["C", "D", "E", "G", "A"]);
    });

    it("should handle sharp notes", () => {
      const scale = generateScale("F#", "major");
      // Tonal.js might return E# instead of F for enharmonic equivalence
      // Both are valid: F# major scale can be written as F# G# A# B C# D# E# or F# G# A# B C# D# F
      expect(scale).toHaveLength(7);
      expect(scale[0]).toBe("F#"); // Root
      expect(scale[1]).toBe("G#"); // Second
      expect(scale[2]).toBe("A#"); // Third
      expect(scale[3]).toBe("B"); // Fourth
      expect(scale[4]).toBe("C#"); // Fifth
      expect(scale[5]).toBe("D#"); // Sixth
      // Last note can be either E# or F (enharmonic equivalents)
      expect(["E#", "F"]).toContain(scale[6]);
    });

    it("should return empty array for invalid root note", () => {
      const scale = generateScale("X", "major");
      expect(scale).toEqual([]);
    });

    it("should return empty array for invalid scale type", () => {
      const scale = generateScale("C", "invalid" as ScaleType);
      expect(scale).toEqual([]);
    });
  });

  describe("getScaleNotes", () => {
    it("should return scale notes with metadata", () => {
      const notes = getScaleNotes("C", "major", 4);
      expect(notes).toHaveLength(7);
      expect(notes[0]).toEqual({
        note: "C",
        octave: 4,
        midi: 60,
        degree: 1,
        isRoot: true,
      });
    });

    it("should handle different octaves", () => {
      const notes = getScaleNotes("C", "major", 5);
      expect(notes[0].octave).toBe(5);
      expect(notes[0].midi).toBe(72); // C5 = MIDI 72
    });
  });

  describe("transposeScale", () => {
    it("should transpose up by 2 semitones", () => {
      const original = ["C", "D", "E"];
      const transposed = transposeScale(original, 2);
      expect(transposed).toEqual(["D", "E", "F#"]);
    });

    it("should transpose down by 2 semitones", () => {
      const original = ["C", "D", "E"];
      const transposed = transposeScale(original, -2);
      expect(transposed).toEqual(["Bb", "C", "D"]);
    });
  });

  describe("getPracticeScaleNotes", () => {
    it("should return ascending notes", () => {
      const notes = getPracticeScaleNotes("C", "major", "ascending", 4);
      expect(notes[0].note).toBe("C");
      expect(notes[6].note).toBe("B");
    });

    it("should return descending notes", () => {
      const notes = getPracticeScaleNotes("C", "major", "descending", 4);
      expect(notes[0].note).toBe("B");
      expect(notes[6].note).toBe("C");
    });

    it("should return both ascending and descending", () => {
      const notes = getPracticeScaleNotes("C", "major", "both", 4);
      // Should be: C D E F G A B + A G F E D C (13 total)
      expect(notes).toHaveLength(13);
      expect(notes[0].note).toBe("C"); // Start
      expect(notes[6].note).toBe("B"); // End of ascending
      expect(notes[7].note).toBe("A"); // Start of descending
      expect(notes[12].note).toBe("C"); // End
    });
  });

  describe("isNoteInScale", () => {
    it("should return true for notes in scale", () => {
      const scaleNotes = getScaleNotes("C", "major", 4);
      expect(isNoteInScale("C", scaleNotes)).toBe(true);
      expect(isNoteInScale("E", scaleNotes)).toBe(true);
      expect(isNoteInScale("G", scaleNotes)).toBe(true);
    });

    it("should return false for notes not in scale", () => {
      const scaleNotes = getScaleNotes("C", "major", 4);
      expect(isNoteInScale("C#", scaleNotes)).toBe(false);
      expect(isNoteInScale("F#", scaleNotes)).toBe(false);
    });
  });

  describe("getScaleDegree", () => {
    it("should return correct scale degrees", () => {
      const scaleNotes = getScaleNotes("C", "major", 4);
      expect(getScaleDegree("C", scaleNotes)).toBe(1);
      expect(getScaleDegree("D", scaleNotes)).toBe(2);
      expect(getScaleDegree("E", scaleNotes)).toBe(3);
      expect(getScaleDegree("F", scaleNotes)).toBe(4);
      expect(getScaleDegree("G", scaleNotes)).toBe(5);
      expect(getScaleDegree("A", scaleNotes)).toBe(6);
      expect(getScaleDegree("B", scaleNotes)).toBe(7);
    });

    it("should return 0 for notes not in scale", () => {
      const scaleNotes = getScaleNotes("C", "major", 4);
      expect(getScaleDegree("C#", scaleNotes)).toBe(0);
    });
  });

  describe("validateScaleConfig", () => {
    it("should validate correct configuration", () => {
      const config = {
        root: "C",
        scale: "major",
        bpm: 120,
        metronome: {
          visualMode: "note-name" as const,
          sound: true,
        },
        practiceMode: "ascending" as PracticeMode,
        loop: true,
      };

      const result = validateScaleConfig(config);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should catch invalid root note", () => {
      const config = {
        root: "X",
        scale: "major",
        bpm: 120,
        metronome: {
          visualMode: "note-name" as const,
          sound: true,
        },
        practiceMode: "ascending" as PracticeMode,
        loop: true,
      };

      const result = validateScaleConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid root note: X");
    });

    it("should catch invalid scale type", () => {
      const config = {
        root: "C",
        scale: "invalid",
        bpm: 120,
        metronome: {
          visualMode: "note-name" as const,
          sound: true,
        },
        practiceMode: "ascending" as PracticeMode,
        loop: true,
      };

      const result = validateScaleConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Invalid scale type: invalid");
    });

    it("should catch invalid BPM", () => {
      const config = {
        root: "C",
        scale: "major",
        bpm: 30, // Too slow
        metronome: {
          visualMode: "note-name" as const,
          sound: true,
        },
        practiceMode: "ascending" as PracticeMode,
        loop: true,
      };

      const result = validateScaleConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("BPM must be between 60 and 200");
    });
  });

  describe("constants", () => {
    it("should have correct scale types", () => {
      expect(AVAILABLE_SCALE_TYPES).toEqual([
        "major",
        "natural minor",
        "pentatonic major",
        "pentatonic minor",
        "blues",
      ]);
    });

    it("should have correct root notes", () => {
      expect(AVAILABLE_ROOT_NOTES).toEqual([
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
      ]);
    });
  });
});
