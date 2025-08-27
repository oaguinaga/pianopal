import { describe, expect, it } from "vitest";

import type { ScaleType } from "@/types/scale";

import {
  generateScale,
  getScaleNotes,
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

    it("should generate a C major pentatonic scale", () => {
      const scale = generateScale("C", "pentatonic major");
      expect(scale).toEqual(["C", "D", "E", "G", "A"]);
    });

    it("should generate an F# major scale", () => {
      const scale = generateScale("F#", "major");
      expect(scale).toEqual(["F#", "G#", "A#", "B", "C#", "D#", "E#"]);
    });

    it("should handle edge cases", () => {
      // Test with flat notes
      const scale = generateScale("Bb", "major");
      expect(scale).toHaveLength(7);
      expect(scale[0]).toBe("Bb");
    });

    it("should handle invalid input gracefully", () => {
      // Invalid root note
      const scale = generateScale("X", "major");
      expect(scale).toEqual([]);
    });

    it("should handle invalid scale type gracefully", () => {
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
      expect(notes[1]).toEqual({
        note: "D",
        octave: 4,
        midi: 62,
        degree: 2,
        isRoot: false,
      });
    });

    it("should handle different octaves", () => {
      const notes = getScaleNotes("C", "major", 5);
      expect(notes[0].octave).toBe(5);
      expect(notes[0].midi).toBe(72); // C5
    });

    it("should handle octave wrapping correctly", () => {
      // F major scale should handle octave correctly
      const notes = getScaleNotes("F", "major", 4);
      expect(notes[0].note).toBe("F");
      expect(notes[0].octave).toBe(4);
      // C should be in the next octave since it's higher than F
      const cNote = notes.find(n => n.note === "C");
      expect(cNote?.octave).toBe(5);
    });
  });
});
