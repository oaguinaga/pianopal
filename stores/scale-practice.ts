import { defineStore } from "pinia";
import { computed, ref } from "vue";

import type {
  NotePlayedEvent,
  PracticeSessionState,
  Scale,
  ScalePracticeSession,
  ScaleSettings,
  ScaleType,
} from "~/types/scale";

import { DEFAULT_OCTAVE } from "~/constants/piano";
import {
  DEFAULT_SCALE_SETTINGS,
  METRONOME_CONFIG,
} from "~/constants/scale";
import { getScaleNotes } from "~/utils/scale-utils";

export const useScalePracticeStore = defineStore("scale-practice", () => {
  const currentSession = ref<ScalePracticeSession | null>(null);
  const availableScales = ref<Scale[]>([]);
  const practiceSettings = ref<ScaleSettings>({ ...DEFAULT_SCALE_SETTINGS });
  const sessionState = ref<PracticeSessionState>("idle");
  const currentNoteIndex = ref(0);
  const practiceHistory = ref<NotePlayedEvent[]>([]);
  const lastExpectedNoteTime = ref<number | null>(null);
  const currentLoop = ref(0);
  const totalLoops = ref(5);
  const lastCorrectNote = ref<string | null>(null);
  const lastCorrectNoteTime = ref<number>(0);

  // Tempo-driven progression timer
  const progressionTimer = ref<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Get notes array based on practice direction
  const getNotesForDirection = (scaleNotes: any[], direction: string) => {
    switch (direction) {
      case "ascending":
        return scaleNotes;
      case "descending":
        return [...scaleNotes].reverse();
      case "both":
        return [...scaleNotes, ...scaleNotes.slice(1).reverse()]; // Avoid duplicate root note
      default:
        return scaleNotes;
    }
  };

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

  // Get the expected note for the current position
  const expectedNote = computed(() => {
    if (!currentSession.value)
      return null;

    const notes = getNotesForDirection(currentSession.value.scale.notes, currentSession.value.direction);
    return notes[currentNoteIndex.value] || null;
  });

  // Get the next note for hint display
  const nextNote = computed(() => {
    if (!currentSession.value || sessionState.value !== "playing") {
      return null;
    }

    const notes = getNotesForDirection(currentSession.value.scale.notes, currentSession.value.direction);
    const nextIndex = currentNoteIndex.value + 1;
    return notes[nextIndex] || null;
  });

  // Check if we should show success animation for a note
  const shouldShowSuccess = computed(() => (noteId: string) => {
    if (!lastCorrectNote.value || lastCorrectNote.value !== noteId)
      return false;

    const timeSinceCorrect = Date.now() - lastCorrectNoteTime.value;
    return timeSinceCorrect < 600; // Show for 600ms
  });

  // Check if session is ready to start (configured but not started, or completed and ready to restart)
  const isSessionReady = computed(() => {
    const hasSession = currentSession.value !== null;
    const canStart = sessionState.value === "idle" || sessionState.value === "completed";
    return hasSession && canStart;
  });

  // ============================================================================
  // TEMPO-DRIVEN PROGRESSION
  // ============================================================================

  // Stop the tempo-driven progression
  const stopProgressionTimer = () => {
    if (progressionTimer.value) {
      clearInterval(progressionTimer.value);
      progressionTimer.value = null;
    }
  };

  // Complete the current practice session
  const completePracticeSession = () => {
    if (!currentSession.value)
      return;

    stopProgressionTimer();
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

  // Start the tempo-driven hint progression
  const startProgressionTimer = () => {
    if (!currentSession.value)
      return;

    const noteInterval = 60000 / currentSession.value.tempo; // BPM to milliseconds

    progressionTimer.value = setInterval(() => {
      if (sessionState.value !== "playing" || !currentSession.value) {
        stopProgressionTimer();
        return;
      }

      const notes = getNotesForDirection(currentSession.value.scale.notes, currentSession.value.direction);

      // Advance to next note
      currentNoteIndex.value++;

      // Check if current scale iteration is complete
      if (currentNoteIndex.value >= notes.length) {
        // Check if we need to loop
        if (currentLoop.value < totalLoops.value) {
          currentLoop.value++;
          currentNoteIndex.value = 0; // Reset to beginning of scale
        }
        else {
          completePracticeSession();
          return;
        }
      }

      // Update expected time for the next note
      lastExpectedNoteTime.value = Date.now();
    }, noteInterval);
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

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
    };

    currentSession.value = session;
    sessionState.value = "idle";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];
  };

  // Start practice session
  const startPractice = () => {
    if (!currentSession.value) {
      console.warn("No current session, cannot start practice");
      return;
    }

    sessionState.value = "count-in";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];
    currentLoop.value = 1;

    // Simulate count-in delay
    setTimeout(() => {
      sessionState.value = "playing";
      // Set the expected time for the first note
      lastExpectedNoteTime.value = Date.now();
      // Start the tempo-driven progression
      startProgressionTimer();
    }, 2000); // 2 second count-in
  };

  // Record a note played by the user with timing validation
  const recordNotePlayed = (note: string, octave: number, midi: number) => {
    if (!currentSession.value || sessionState.value !== "playing") {
      return;
    }

    const currentTime = Date.now();
    const notes = getNotesForDirection(currentSession.value.scale.notes, currentSession.value.direction);
    const expectedNoteData = notes[currentNoteIndex.value];

    const isCorrect = expectedNoteData
      && expectedNoteData.note === note
      && expectedNoteData.octave === octave;

    const event: NotePlayedEvent = {
      note,
      octave,
      midi,
      timestamp: new Date(),
      isCorrect,
      expectedNote: expectedNoteData?.note,
      accuracy: isCorrect ? 100 : 0,
    };

    practiceHistory.value.push(event);

    if (isCorrect) {
      // Track the correct note for visual feedback
      lastCorrectNote.value = `${note}${octave}`;
      lastCorrectNoteTime.value = currentTime;

      currentNoteIndex.value++;

      // Calculate next expected note time based on tempo
      const noteInterval = 60000 / currentSession.value.tempo; // BPM to milliseconds
      lastExpectedNoteTime.value = currentTime + noteInterval;

      // Check if current scale iteration is complete
      if (currentNoteIndex.value >= notes.length) {
        // Check if we need to loop
        if (currentLoop.value < totalLoops.value) {
          currentLoop.value++;
          currentNoteIndex.value = 0; // Reset to beginning of scale
          lastExpectedNoteTime.value = currentTime + noteInterval;
        }
        else {
          completePracticeSession();
        }
      }
    }
  };

  // Update practice settings
  const updatePracticeSettings = (newSettings: Partial<ScaleSettings>) => {
    practiceSettings.value = { ...practiceSettings.value, ...newSettings };
  };

  // Reset practice session
  const resetPractice = () => {
    stopProgressionTimer();
    currentSession.value = null;
    sessionState.value = "idle";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];
  };

  // Stop current practice but keep session configuration
  const stopPractice = () => {
    stopProgressionTimer();
    sessionState.value = "idle";
    currentNoteIndex.value = 0;
    practiceHistory.value = [];
    // Keep currentSession.value so controls remain visible
  };

  // Navigate to a specific note in the scale
  const goToNote = (index: number) => {
    if (!currentSession.value || index < 0 || index >= currentSession.value.scale.notes.length)
      return;

    currentNoteIndex.value = index;
  };

  // ============================================================================
  // SCALE PRACTICE EVENT HANDLERS (extracted from piano-test.vue)
  // ============================================================================

  // Handle root note change
  const handleRootChange = (root: string) => {
    practiceSettings.value.root = root;

    // If we have an active session, regenerate scale notes
    if (currentSession.value && practiceSettings.value.scale) {
      const scaleNotes = getScaleNotes(root, practiceSettings.value.scale, DEFAULT_OCTAVE);
      currentSession.value.scale.notes = scaleNotes;
    }
  };

  // Handle scale type change
  const handleScaleTypeChange = (scaleType: ScaleType) => {
    practiceSettings.value.scale = scaleType;

    // If we have an active session, regenerate scale notes
    if (currentSession.value && practiceSettings.value.root) {
      const scaleNotes = getScaleNotes(practiceSettings.value.root, scaleType, DEFAULT_OCTAVE);
      currentSession.value.scale.notes = scaleNotes;
    }
  };

  // Handle tempo change
  const handleTempoChange = (tempo: number) => {
    practiceSettings.value.bpm = tempo;

    // Update current session tempo if active
    if (currentSession.value) {
      currentSession.value.tempo = tempo;
    }
  };

  // Handle start practice with current settings - only creates session
  const handleStartPractice = () => {
    const { root, scale, bpm } = practiceSettings.value;

    if (!root || !scale) {
      console.warn("Cannot start practice: missing root or scale type");
      return;
    }

    // Generate scale notes
    const scaleNotes = getScaleNotes(root, scale, DEFAULT_OCTAVE);
    const scaleData: Scale = { root, type: scale, notes: scaleNotes };

    // Create session but don't start it yet
    selectScale(scaleData, { tempo: bpm });
  };

  // Generate scale notes for current settings (for highlighting)
  const generateScaleNotes = () => {
    const { root, scale } = practiceSettings.value;

    if (!root || !scale) {
      return [];
    }

    try {
      return getScaleNotes(root, scale, DEFAULT_OCTAVE);
    }
    catch (error) {
      console.error("Error generating scale:", error);
      return [];
    }
  };

  // Reset practice to default settings
  const resetPracticeToDefaults = () => {
    practiceSettings.value = { ...DEFAULT_SCALE_SETTINGS };
    resetPractice();
  };

  // Set number of loops for practice
  const setLoops = (loops: number) => {
    totalLoops.value = Math.max(1, loops);
  };

  // Set practice direction
  const setPracticeDirection = (direction: "ascending" | "descending" | "both") => {
    if (currentSession.value) {
      currentSession.value.direction = direction;
    }
  };

  return {
    // State
    currentSession,
    availableScales,
    practiceSettings,
    sessionState,
    currentNoteIndex,
    practiceHistory,
    currentLoop,
    totalLoops,

    // Getters
    currentScale,
    scalesByType,
    currentSessionStats,
    expectedNote,
    nextNote,
    shouldShowSuccess,
    isSessionReady,

    // Actions
    selectScale,
    startPractice,
    stopPractice,
    stopProgressionTimer,
    resetPractice,
    resetPracticeToDefaults,
    updatePracticeSettings,
    goToNote,
    recordNotePlayed,
    completePracticeSession,
    handleRootChange,
    handleScaleTypeChange,
    handleStartPractice,
    handleTempoChange,
    generateScaleNotes,
    setLoops,
    setPracticeDirection,
  };
});
