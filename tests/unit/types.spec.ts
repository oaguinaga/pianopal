import { describe, expect, it } from "vitest";

import type {
  PracticeMode,
  PracticeSessionState,
  Scale,
  ScalePracticeSession,
  ScaleSettings,
} from "@/types/scale";

import {
  DEFAULT_SCALE_SETTINGS,
  METRONOME_CONFIG,
  PRACTICE_MODES,
  PRACTICE_SESSION_DEFAULTS,
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

    it("should have default scale settings", () => {
      expect(DEFAULT_SCALE_SETTINGS.displayPreferences.showNoteNames).toBe(true);
      expect(DEFAULT_SCALE_SETTINGS.practiceModes.autoAdvance).toBe(false);
      expect(DEFAULT_SCALE_SETTINGS.audioSettings.metronomeVolume).toBe(0.7);
    });

    it("should have practice session defaults", () => {
      expect(PRACTICE_SESSION_DEFAULTS.countInBars).toBe(2);
      expect(PRACTICE_SESSION_DEFAULTS.autoAdvanceDelay).toBe(2000);
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
        startTime: new Date(),
        isActive: true,
        currentNoteIndex: 0,
        completedNotes: 0,
        accuracy: 0,
        config: {
          root: "C",
          scale: "major",
          bpm: 120,
          metronome: {
            visualMode: "note-name",
            sound: true,
          },
          practiceMode: "ascending",
          loop: true,
        },
      };

      expect(session.id).toBe("session-1");
      expect(session.tempo).toBe(120);
      expect(session.direction).toBe("ascending");
    });

    it("should allow creating a valid ScaleSettings object", () => {
      const settings: ScaleSettings = {
        displayPreferences: {
          showNoteNames: true,
          showScaleDegrees: false,
          showKeySignatures: true,
          highlightCurrentNote: true,
          showProgressBar: false,
        },
        practiceModes: {
          autoAdvance: true,
          countIn: false,
          loopPractice: true,
          randomizeOrder: false,
        },
        audioSettings: {
          metronomeVolume: 0.5,
          noteVolume: 0.9,
          enableHarmonics: true,
        },
        tempoSettings: {
          maxTempo: 160,
          minTempo: 80,
        },
      };

      expect(settings.displayPreferences.showNoteNames).toBe(true);
      expect(settings.practiceModes.autoAdvance).toBe(true);
      expect(settings.audioSettings.metronomeVolume).toBe(0.5);
      expect(settings.tempoSettings.maxTempo).toBe(160);
    });
  });
});
