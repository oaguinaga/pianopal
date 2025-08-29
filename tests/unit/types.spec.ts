import { describe, expect, it } from "vitest";

import type {
  PracticeMode,
  PracticeSessionState,
  Scale,
  ScalePracticeSession,
} from "@/types/scale";

import {
  METRONOME_CONFIG,
  PRACTICE_MODES,
} from "@/constants/scale";

describe("scale Types", () => {
  describe("type Definitions", () => {
    it("should have correct practice modes", () => {
      expect(PRACTICE_MODES.ASCENDING).toBe("ascending");
      expect(PRACTICE_MODES.DESCENDING).toBe("descending");
      expect(PRACTICE_MODES.BOTH).toBe("both");
    });

    it("should have tempo settings", () => {
      expect(METRONOME_CONFIG.MAX_BPM).toBe(200);
      expect(METRONOME_CONFIG.MIN_BPM).toBe(60);
      expect(METRONOME_CONFIG.DEFAULT_BPM).toBe(120);
    });
  });

  describe("type Validation", () => {
    it("should allow valid practice modes", () => {
      const validModes: PracticeMode[] = ["ascending", "descending", "both"];
      validModes.forEach((mode) => {
        expect([PRACTICE_MODES.ASCENDING, PRACTICE_MODES.DESCENDING, PRACTICE_MODES.BOTH]).toContain(mode);
      });
    });

    it("should allow valid practice session states", () => {
      const validStates: PracticeSessionState[] = [
        "idle",
        "count-in",
        "playing",
        "paused",
        "grading",
        "completed",
        "error",
      ];

      // This test validates that all the union types are properly defined
      expect(validStates).toHaveLength(7);
    });
  });

  describe("complex Type Structures", () => {
    it("should allow creating a valid Scale object", () => {
      const scale: Scale = {
        root: "C",
        type: "major",
        notes: [],
      };

      expect(scale.root).toBe("C");
      expect(scale.type).toBe("major");
    });

    it("should allow creating a valid ScalePracticeSession object", () => {
      const session: ScalePracticeSession = {
        id: "session-1",
        scale: {
          root: "C",
          type: "major",
          notes: [],
        },
        tempo: 120,
        direction: "ascending",
        repetitions: 2,
      };

      expect(session.id).toBe("session-1");
      expect(session.tempo).toBe(120);
      expect(session.direction).toBe("ascending");
    });
  });
});
