import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScalePracticeStore } from "~/stores/scale-practice";

// Mock the scale utilities
vi.mock("~/utils/scale-utils", () => ({
  generateScale: vi.fn((root: string, type: string) => {
    if (root === "X" || type === "invalid")
      return [];
    return ["C", "D", "E", "F", "G", "A", "B"];
  }),
  getScaleNotes: vi.fn((root: string, type: string, octave: number) => {
    if (root === "X" || type === "invalid")
      return [];
    return [
      { note: "C", octave, midi: 60 + (octave - 4) * 12, degree: 1, isRoot: true },
      { note: "D", octave, midi: 62 + (octave - 4) * 12, degree: 2, isRoot: false },
      { note: "E", octave, midi: 64 + (octave - 4) * 12, degree: 3, isRoot: false },
      { note: "F", octave, midi: 65 + (octave - 4) * 12, degree: 4, isRoot: false },
      { note: "G", octave, midi: 67 + (octave - 4) * 12, degree: 5, isRoot: false },
      { note: "A", octave, midi: 69 + (octave - 4) * 12, degree: 6, isRoot: false },
      { note: "B", octave, midi: 71 + (octave - 4) * 12, degree: 7, isRoot: false },
    ];
  }),
}));

describe("scale Practice Store", () => {
  let store: ReturnType<typeof useScalePracticeStore>;

  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia());
    store = useScalePracticeStore();

    // Mock Date.now for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial State", () => {
    it("should have correct initial state", () => {
      expect(store.currentSession).toBeNull();
      expect(store.availableScales).toEqual([]);
      expect(store.sessionState).toBe("idle");
      expect(store.currentNoteIndex).toBe(0);
      expect(store.practiceHistory).toEqual([]);
    });

    it("should have default practice settings", () => {
      expect(store.practiceSettings.displayPreferences.showNoteNames).toBe(true);
      expect(store.practiceSettings.practiceModes.autoAdvance).toBe(false);
      expect(store.practiceSettings.audioSettings.metronomeVolume).toBe(0.7);
    });
  });

  describe("scale Initialization", () => {
    it("should initialize available scales", () => {
      store.initializeScales();

      expect(store.availableScales.length).toBeGreaterThan(0);

      // Check that scales are properly structured
      const firstScale = store.availableScales[0];
      expect(firstScale).toHaveProperty("root");
      expect(firstScale).toHaveProperty("type");
      expect(firstScale).toHaveProperty("notes");
    });
  });

  describe("scale Selection", () => {
    beforeEach(() => {
      store.initializeScales();
    });

    it("should select a scale for practice", () => {
      const scale = store.availableScales[0];
      store.selectScale(scale, { tempo: 140, direction: "both" });

      expect(store.currentSession).not.toBeNull();
      expect(store.currentSession?.scale).toBe(scale);
      expect(store.currentSession?.tempo).toBe(140);
      expect(store.currentSession?.direction).toBe("both");
      expect(store.sessionState).toBe("idle");
    });

    it("should use default values when config is not provided", () => {
      const scale = store.availableScales[0];
      store.selectScale(scale);

      expect(store.currentSession?.tempo).toBe(120);
      expect(store.currentSession?.direction).toBe("ascending");
      expect(store.currentSession?.repetitions).toBe(1);
    });
  });

  describe("practice Session Management", () => {
    beforeEach(() => {
      store.initializeScales();
      const scale = store.availableScales[0];
      store.selectScale(scale);
    });

    it("should start practice session", () => {
      store.startPractice();

      expect(store.sessionState).toBe("count-in");
      expect(store.currentNoteIndex).toBe(0);
      expect(store.practiceHistory).toEqual([]);
    });

    it("should transition from count-in to playing", async () => {
      store.startPractice();
      expect(store.sessionState).toBe("count-in");

      // Fast-forward time to simulate count-in completion
      vi.advanceTimersByTime(2000);

      expect(store.sessionState).toBe("playing");
    });

    it("should pause and resume practice", () => {
      store.startPractice();
      vi.advanceTimersByTime(2000); // Complete count-in

      store.pausePractice();
      expect(store.sessionState).toBe("paused");

      store.resumePractice();
      expect(store.sessionState).toBe("playing");
    });

    it("should reset practice session", () => {
      store.startPractice();
      vi.advanceTimersByTime(2000);

      store.resetPractice();

      expect(store.currentSession).toBeNull();
      expect(store.sessionState).toBe("idle");
      expect(store.currentNoteIndex).toBe(0);
      expect(store.practiceHistory).toEqual([]);
    });
  });

  describe("note Recording and Progress", () => {
    beforeEach(() => {
      store.initializeScales();
      const scale = store.availableScales[0];
      store.selectScale(scale);
      store.startPractice();
      vi.advanceTimersByTime(2000); // Complete count-in
    });

    it("should record correct notes and advance", () => {
      const expectedNote = store.currentSession?.scale.notes[0];
      expect(expectedNote).toBeDefined();

      store.recordNotePlayed(expectedNote!.note, expectedNote!.octave, expectedNote!.midi);

      expect(store.practiceHistory).toHaveLength(1);
      expect(store.practiceHistory[0].isCorrect).toBe(true);
      expect(store.currentNoteIndex).toBe(1);
    });

    it("should record incorrect notes without advancing", () => {
      const expectedNote = store.currentSession?.scale.notes[0];
      expect(expectedNote).toBeDefined();

      store.recordNotePlayed("C#", expectedNote!.octave, expectedNote!.midi + 1);

      expect(store.practiceHistory).toHaveLength(1);
      expect(store.practiceHistory[0].isCorrect).toBe(false);
      expect(store.currentNoteIndex).toBe(0); // Should not advance
    });

    it("should complete session when all notes are played correctly", () => {
      const scale = store.currentSession?.scale;
      expect(scale).toBeDefined();

      // Play all notes correctly
      for (let i = 0; i < scale!.notes.length; i++) {
        const note = scale!.notes[i];
        store.recordNotePlayed(note.note, note.octave, note.midi);
      }

      expect(store.sessionState).toBe("completed");
    });
  });

  describe("getters and Computed Values", () => {
    beforeEach(() => {
      store.initializeScales();
    });

    it("should filter scales by type", () => {
      const majorScales = store.scalesByType("major");
      const minorScales = store.scalesByType("natural minor");

      expect(majorScales.length).toBeGreaterThan(0);
      expect(minorScales.length).toBeGreaterThan(0);

      majorScales.forEach((scale) => {
        expect(scale.type).toBe("major");
      });

      minorScales.forEach((scale) => {
        expect(scale.type).toBe("natural minor");
      });
    });

    it("should calculate current session statistics", () => {
      const scale = store.availableScales[0];
      store.selectScale(scale);

      const stats = store.currentSessionStats;
      expect(stats).toBeNull(); // No session started yet

      store.startPractice();
      vi.advanceTimersByTime(2000);

      const activeStats = store.currentSessionStats;
      expect(activeStats).not.toBeNull();
      expect(activeStats?.totalNotes).toBe(scale.notes.length);
      expect(activeStats?.currentNote).toBe(1);
      expect(activeStats?.progress).toBe(0);
    });
  });

  describe("settings Management", () => {
    it("should update practice settings", () => {
      const newSettings = {
        displayPreferences: {
          showNoteNames: false,
          showScaleDegrees: true,
          showKeySignatures: false,
          highlightCurrentNote: true,
          showProgressBar: false,
        },
        audioSettings: {
          metronomeVolume: 0.5,
          noteVolume: 0.9,
          enableHarmonics: true,
        },
      };

      store.updatePracticeSettings(newSettings);

      expect(store.practiceSettings.displayPreferences.showNoteNames).toBe(false);
      expect(store.practiceSettings.displayPreferences.showScaleDegrees).toBe(true);
      expect(store.practiceSettings.audioSettings.metronomeVolume).toBe(0.5);
      expect(store.practiceSettings.audioSettings.enableHarmonics).toBe(true);
    });
  });

  describe("navigation", () => {
    beforeEach(() => {
      store.initializeScales();
      const scale = store.availableScales[0];
      store.selectScale(scale);
    });

    it("should navigate to specific notes", () => {
      const scale = store.currentSession?.scale;
      expect(scale).toBeDefined();

      store.goToNote(3);
      expect(store.currentNoteIndex).toBe(3);

      store.goToNote(0);
      expect(store.currentNoteIndex).toBe(0);
    });

    it("should not navigate to invalid note indices", () => {
      const scale = store.currentSession?.scale;
      expect(scale).toBeDefined();

      // Try to go to invalid indices
      store.goToNote(-1);
      expect(store.currentNoteIndex).toBe(0); // Should remain unchanged

      store.goToNote(scale!.notes.length + 1);
      expect(store.currentNoteIndex).toBe(0); // Should remain unchanged
    });
  });
});
