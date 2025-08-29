import { defineStore } from "pinia";
import { Note } from "tonal";
import { computed, ref } from "vue";

import type {
  NotePlayedEvent,
  PracticeMode,
  PracticeSessionState,
  Scale,
  ScaleNote,
  ScalePracticeSession,
  ScaleType,
} from "~/types/scale";

import { DEFAULT_OCTAVE } from "~/constants/piano";
import {
  COUNT_IN_MS,
  DEFAULT_DIRECTION,
  DEFAULT_SCALE_SETTINGS,
  METRONOME_CONFIG,
} from "~/constants/scale";
import { getScaleNotes } from "~/utils/scale-utils";

export const useScalePracticeStore = defineStore("scale-practice", () => {
  const currentSession = ref<ScalePracticeSession | null>(null);
  const availableScales = ref<Scale[]>([]);
  const sessionState = ref<PracticeSessionState>("idle");
  const currentNoteIndex = ref(0);
  const practiceHistory = ref<NotePlayedEvent[]>([]);
  const lastExpectedNoteTime = ref<number | null>(null);
  const currentLoop = ref(0);
  const lastCorrectNote = ref<string | null>(null);
  const lastCorrectNoteTime = ref<number>(0);

  // Tempo-driven progression timer
  const progressionTimer = ref<NodeJS.Timeout | null>(null);

  // Countdown state for visual feedback during count-in
  const countdownValue = ref<string | null>(null);
  const countdownTimer = ref<NodeJS.Timeout | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Get notes array based on practice direction
  const getNotesForDirection = (scaleNotes: ScaleNote[], direction: string) => {
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

  // Start countdown timer for visual feedback
  const startCountdown = () => {
    countdownValue.value = "3";

    // Clear any existing countdown timer
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
    }

    let count = 3;
    const interval = 800; // 800ms per step

    countdownTimer.value = setInterval(() => {
      count--;
      if (count === 2) {
        countdownValue.value = "2";
      }
      else if (count === 1) {
        countdownValue.value = "1";
      }
      else if (count === 0) {
        countdownValue.value = "GO!";
      }
      else {
        // Countdown finished
        countdownValue.value = null;
        if (countdownTimer.value) {
          clearInterval(countdownTimer.value);
          countdownTimer.value = null;
        }
      }
    }, interval);
  };

  // Stop countdown timer
  const stopCountdown = () => {
    if (countdownTimer.value) {
      clearInterval(countdownTimer.value);
      countdownTimer.value = null;
    }
    countdownValue.value = null;
  };

  // Complete the current practice session
  const completePracticeSession = () => {
    if (!currentSession.value)
      return;

    stopProgressionTimer();
    stopCountdown();
    sessionState.value = "grading";

    // Session completion is now handled by state only
    // Results are calculated on-demand via currentSessionStats

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
        if (currentLoop.value < currentSession.value.repetitions) {
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
  const selectScale = (scale: Scale, tempo: number = METRONOME_CONFIG.DEFAULT_BPM, direction: PracticeMode = DEFAULT_DIRECTION, repetitions: number = 1) => {
    const session: ScalePracticeSession = {
      id: `session-${Date.now()}`,
      scale,
      tempo,
      direction,
      repetitions,
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

    // Start visual countdown
    startCountdown();

    // Simulate count-in delay
    setTimeout(() => {
      sessionState.value = "playing";
      // Set the expected time for the first note
      lastExpectedNoteTime.value = Date.now();
      // Start the tempo-driven progression
      startProgressionTimer();
    }, COUNT_IN_MS);
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
      && (expectedNoteData.note === note || Note.enharmonic(note) === expectedNoteData.note)
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
        if (currentLoop.value < currentSession.value.repetitions) {
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

  // Stop current practice but keep session configuration
  const stopPractice = () => {
    stopProgressionTimer();
    stopCountdown();
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
  // SCALE PRACTICE EVENT HANDLERS
  // ============================================================================

  // Handle root note change - updates current session scale
  const handleRootChange = (root: string) => {
    if (currentSession.value) {
      const scaleNotes = getScaleNotes(root, currentSession.value.scale.type, DEFAULT_OCTAVE as number);

      // Update the current session's scale directly for reactivity
      currentSession.value.scale = {
        root,
        type: currentSession.value.scale.type,
        notes: scaleNotes,
      };
    }
  };

  // Handle scale type change - updates current session scale
  const handleScaleTypeChange = (scaleType: ScaleType) => {
    if (currentSession.value) {
      const scaleNotes = getScaleNotes(currentSession.value.scale.root, scaleType, DEFAULT_OCTAVE as number);

      // Update the current session's scale directly for reactivity
      currentSession.value.scale = {
        root: currentSession.value.scale.root,
        type: scaleType,
        notes: scaleNotes,
      };
    }
  };

  // Handle tempo change
  const handleTempoChange = (tempo: number) => {
    if (currentSession.value) {
      currentSession.value.tempo = tempo;
    }
  };

  // Handle start practice with default C Major scale
  const handleStartPractice = () => {
    // Generate default C Major scale
    const scaleNotes = getScaleNotes(
      DEFAULT_SCALE_SETTINGS.root,
      DEFAULT_SCALE_SETTINGS.scale,
      DEFAULT_OCTAVE as number,
    );
    const scaleData: Scale = {
      root: DEFAULT_SCALE_SETTINGS.root,
      type: DEFAULT_SCALE_SETTINGS.scale,
      notes: scaleNotes,
    };

    // Create session with defaults
    selectScale(scaleData, METRONOME_CONFIG.DEFAULT_BPM, DEFAULT_DIRECTION, 1);
  };

  // Set number of loops for practice
  const setLoops = (loops: number) => {
    if (currentSession.value) {
      currentSession.value.repetitions = Math.max(1, loops);
    }
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
    sessionState,
    currentNoteIndex,
    practiceHistory,
    currentLoop,
    countdownValue,

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
    goToNote,
    recordNotePlayed,
    completePracticeSession,
    handleRootChange,
    handleScaleTypeChange,
    handleStartPractice,
    handleTempoChange,
    setLoops,
    setPracticeDirection,
  };
});
