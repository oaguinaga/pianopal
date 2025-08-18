import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type {
  NotePlayedEvent,
  PracticeSessionState,
  Scale,
  ScalePracticeSession,
  ScaleSettings,
} from "~/types/scale";

import {
  AVAILABLE_ROOT_NOTES,
  AVAILABLE_SCALE_TYPES,
  DEFAULT_SCALE_SETTINGS,
  METRONOME_CONFIG,
} from "~/constants/scale";
import { generateScale, getScaleNotes } from "~/utils/scale-utils";

export const useScalePracticeStore = defineStore("scalePractice", () => {
  const currentSession = ref<ScalePracticeSession | null>(null);
  const availableScales = ref<Scale[]>([]);
  const practiceSettings = ref<ScaleSettings>({ ...DEFAULT_SCALE_SETTINGS });
  const sessionState = ref<PracticeSessionState>("idle");
  const currentNoteIndex = ref(0);
  const practiceHistory = ref<NotePlayedEvent[]>([]);

  // ============================================================================
  // GETTERS
  // ============================================================================

  const currentScale = computed((): Scale | null => {
    return currentSession.value?.scale || null;
  });

  const scalesByType = computed(() => (type: string) => {
    return availableScales.value.filter(scale => scale.type === type);
  });

  const currentSessionStats = computed(() => {
    if (!currentSession.value || sessionState.value === "idle")
      return null;

    const totalNotes = currentSession.value.scale.notes.length;
    const correctNotes = practiceHistory.value.filter(event => event.isCorrect).length;
    const accuracy = totalNotes > 0 ? Math.round((correctNotes / totalNotes) * 100) : 0;

    return {
      totalNotes,
      correctNotes,
      accuracy,
      currentNote: currentNoteIndex.value + 1,
      progress: Math.round((currentNoteIndex.value / totalNotes) * 100),
    };
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const completePracticeSession = () => {
    if (!currentSession.value)
      return;

    sessionState.value = "grading";

    const totalNotes = currentSession.value.scale.notes.length;
    const correctNotes = practiceHistory.value.filter(event => event.isCorrect).length;
    const accuracy = Math.round((correctNotes / totalNotes) * 100);

    // Update session
    currentSession.value.endTime = new Date();
    currentSession.value.isActive = false;
    currentSession.value.completedNotes = correctNotes;
    currentSession.value.accuracy = accuracy;

    // For MVP, just show results without storing progress
    sessionState.value = "completed";
  };

  const initializeScales = () => {
    const scales: Scale[] = [];

    AVAILABLE_ROOT_NOTES.forEach((root) => {
      AVAILABLE_SCALE_TYPES.forEach((type) => {
        const scaleNotes = generateScale(root, type);
        if (scaleNotes.length > 0) {
          const notes = getScaleNotes(root, type, 4); // Start at octave 4

          scales.push({
            root,
            type,
            notes,
          });
        }
      });
    });

    availableScales.value = scales;
  };

  // Select a scale for practice
  const selectScale = (scale: Scale, config: Partial<ScalePracticeSession> = {}) => {
    const session: ScalePracticeSession = {
      id: `session-${Date.now()}`,
      scale,
      tempo: config.tempo || METRONOME_CONFIG.DEFAULT_BPM,
      direction: config.direction || "ascending",
      repetitions: config.repetitions || 1,
      startTime: new Date(),
      isActive: true,
      currentNoteIndex: 0,
      completedNotes: 0,
      accuracy: 0,
      config: {
        root: scale.root,
        scale: scale.type,
        bpm: config.tempo || METRONOME_CONFIG.DEFAULT_BPM,
        metronome: {
          visualMode: "note-name",
          sound: true,
        },
        practiceMode: config.direction || "ascending",
        loop: true,
      },
    };

    currentSession.value = session;
    sessionState.value = "idle";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];
  };

  // Start practice session
  const startPractice = () => {
    if (!currentSession.value)
      return;

    sessionState.value = "count-in";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];

    // Simulate count-in delay
    setTimeout(() => {
      sessionState.value = "playing";
    }, 2000); // 2 second count-in
  };

  // Pause practice session
  const pausePractice = () => {
    if (sessionState.value === "playing") {
      sessionState.value = "paused";
    }
  };

  // Resume practice session
  const resumePractice = () => {
    if (sessionState.value === "paused") {
      sessionState.value = "playing";
    }
  };

  // Record a note played by the user
  const recordNotePlayed = (note: string, octave: number, midi: number) => {
    if (!currentSession.value || sessionState.value !== "playing")
      return;

    const expectedNote = currentSession.value.scale.notes[currentNoteIndex.value];
    const isCorrect = expectedNote
      && expectedNote.note === note
      && expectedNote.octave === octave;

    const event: NotePlayedEvent = {
      note,
      octave,
      midi,
      timestamp: new Date(),
      isCorrect,
      expectedNote: expectedNote?.note,
      accuracy: isCorrect ? 100 : 0,
    };

    practiceHistory.value.push(event);

    if (isCorrect) {
      currentNoteIndex.value++;

      // Check if practice is complete
      if (currentNoteIndex.value >= currentSession.value.scale.notes.length) {
        completePracticeSession();
      }
    }
  };

  // Update practice settings
  const updatePracticeSettings = (newSettings: Partial<ScaleSettings>) => {
    practiceSettings.value = { ...practiceSettings.value, ...newSettings };
  };

  // Reset practice session
  const resetPractice = () => {
    currentSession.value = null;
    sessionState.value = "idle";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];
  };

  // Navigate to a specific note in the scale
  const goToNote = (index: number) => {
    if (!currentSession.value || index < 0 || index >= currentSession.value.scale.notes.length)
      return;

    currentNoteIndex.value = index;
  };

  return {
    // State
    currentSession,
    availableScales,
    practiceSettings,
    sessionState,
    currentNoteIndex,
    practiceHistory,

    // Getters
    currentScale,
    scalesByType,
    currentSessionStats,

    // Actions
    initializeScales,
    selectScale,
    startPractice,
    pausePractice,
    resumePractice,
    recordNotePlayed,
    completePracticeSession,
    updatePracticeSettings,
    resetPractice,
    goToNote,
  };
});
