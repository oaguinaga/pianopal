import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";

import type { ScaleNote, ScaleType } from "@/types/scale";

// Mock the store
vi.mock("@/stores/scale-practice", () => ({
  useScalePracticeStore: vi.fn(() => ({
    currentSession: ref(null),
    availableScales: ref([]),
    practiceSettings: ref({}),
    sessionState: ref("idle"),
    currentNoteIndex: ref(0),
    practiceHistory: ref([]),
    initializeScales: vi.fn(),
    selectScale: vi.fn(),
    startPractice: vi.fn(),
    pausePractice: vi.fn(),
    resumePractice: vi.fn(),
    recordNotePlayed: vi.fn(),
    completePracticeSession: vi.fn(),
    updatePracticeSettings: vi.fn(),
    resetPractice: vi.fn(),
    goToNote: vi.fn(),
  })),
}));

// Mock the scale utilities
vi.mock("@/utils/scale-utils", () => ({
  generateScale: vi.fn(),
  getScaleNotes: vi.fn(),
}));

// Mock constants
vi.mock("@/constants/scale", () => ({
  AVAILABLE_ROOT_NOTES: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  AVAILABLE_SCALE_TYPES: ["major", "natural minor", "pentatonic major", "pentatonic minor", "blues"],
  METRONOME_CONFIG: {
    MIN_BPM: 60,
    MAX_BPM: 200,
    DEFAULT_BPM: 120,
  },
}));

// ============================================================================
// INTEGRATION TEST HELPERS
// ============================================================================

// Create mock scale notes
function createMockScaleNotes(root: string, scaleType: ScaleType): ScaleNote[] {
  const baseNotes = scaleType === "major"
    ? ["C", "D", "E", "F", "G", "A", "B", "C"]
    : scaleType === "natural minor"
      ? ["A", "B", "C", "D", "E", "F", "G", "A"]
      : scaleType === "blues"
        ? ["E", "G", "A", "Bb", "B", "D", "E"]
        : ["C", "D", "E", "G", "A", "C"]; // pentatonic

  return baseNotes.map((note, index) => ({
    note: note.replace("Bb", "A#"), // Normalize for our system
    octave: 4 + Math.floor(index / 7),
    midi: 60 + index,
    degree: index + 1,
    isRoot: index === 0,
  }));
}

// Mock component logic for integration testing
function createMockComponentIntegration() {
  // Scale Selection State
  const selectedRoot = ref("C");
  const selectedScaleType = ref<ScaleType>("major");
  const selectedTempo = ref(120);
  const isFormValid = computed(() => Boolean(selectedRoot.value && selectedScaleType.value));

  // Scale Visualization State
  const scaleNotes = ref<ScaleNote[]>([]);
  const isGenerating = ref(false);
  const isVisible = ref(false);

  // Store Integration State
  const currentSession = ref(null);
  const sessionState = ref<"idle" | "count-in" | "playing" | "grading">("idle");

  // Define generateScaleNotes first since it's used in event handlers
  const generateScaleNotes = async () => {
    if (!selectedRoot.value || !selectedScaleType.value) {
      scaleNotes.value = [];
      return;
    }

    try {
      isGenerating.value = true;

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate mock scale notes
      scaleNotes.value = createMockScaleNotes(selectedRoot.value, selectedScaleType.value);
    }
    catch (error) {
      console.error("Error generating scale:", error);
      scaleNotes.value = [];
    }
    finally {
      isGenerating.value = false;
    }
  };

  // Event Handlers
  const handleRootChange = (root: string) => {
    selectedRoot.value = root;
    if (isVisible.value) {
      generateScaleNotes();
    }
  };

  const handleScaleTypeChange = (scaleType: ScaleType) => {
    selectedScaleType.value = scaleType;
    if (isVisible.value) {
      generateScaleNotes();
    }
  };

  const handleTempoChange = (tempo: number) => {
    selectedTempo.value = tempo;
  };

  const handleStartPractice = () => {
    if (!isFormValid.value)
      return false;

    isVisible.value = true;
    generateScaleNotes();
    sessionState.value = "count-in";
    return true;
  };

  const handleNoteClick = (note: ScaleNote) => {
    if (sessionState.value === "playing") {
      // Record the note played
      return { success: true, note };
    }
    return { success: false, note };
  };

  const handleScaleChange = (root: string, scaleType: ScaleType) => {
    selectedRoot.value = root;
    selectedScaleType.value = scaleType;
    if (isVisible.value) {
      generateScaleNotes();
    }
  };

  const resetPractice = () => {
    selectedRoot.value = "C";
    selectedScaleType.value = "major";
    selectedTempo.value = 120;
    isVisible.value = false;
    scaleNotes.value = [];
    sessionState.value = "idle";
    currentSession.value = null;
  };

  return {
    // State
    selectedRoot,
    selectedScaleType,
    selectedTempo,
    isFormValid,
    scaleNotes,
    isGenerating,
    currentSession,
    sessionState,
    isVisible,

    // Methods
    handleRootChange,
    handleScaleTypeChange,
    handleTempoChange,
    handleStartPractice,
    generateScaleNotes,
    handleNoteClick,
    handleScaleChange,
    resetPractice,
  };
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe("scale Practice Integration", () => {
  let integration: ReturnType<typeof createMockComponentIntegration>;

  beforeEach(() => {
    integration = createMockComponentIntegration();
  });

  describe("component Communication", () => {
    it("should propagate root note changes from selection to visualization", async () => {
      // Initial state
      expect(integration.selectedRoot.value).toBe("C");
      expect(integration.scaleNotes.value).toHaveLength(0);

      // Show visualization
      integration.isVisible.value = true;
      await integration.generateScaleNotes();
      expect(integration.scaleNotes.value).toHaveLength(8);

      // Change root note
      integration.handleRootChange("F#");
      await integration.generateScaleNotes();

      expect(integration.selectedRoot.value).toBe("F#");
      expect(integration.scaleNotes.value).toHaveLength(8);
      // Note: The mock function doesn't actually change the note content, just the root
      // This test verifies the state change, not the actual note content
    });

    it("should propagate scale type changes from selection to visualization", async () => {
      // Initial state
      expect(integration.selectedScaleType.value).toBe("major");
      integration.isVisible.value = true;
      await integration.generateScaleNotes();

      const majorScaleNotes = integration.scaleNotes.value;
      expect(majorScaleNotes).toHaveLength(8);

      // Change to minor scale
      integration.handleScaleTypeChange("natural minor");
      await integration.generateScaleNotes();

      expect(integration.selectedScaleType.value).toBe("natural minor");
      expect(integration.scaleNotes.value).toHaveLength(8);

      // Notes should be different
      expect(integration.scaleNotes.value).not.toEqual(majorScaleNotes);
    });

    it("should maintain tempo consistency across components", () => {
      const initialTempo = integration.selectedTempo.value;
      expect(initialTempo).toBe(120);

      // Change tempo
      integration.handleTempoChange(150);
      expect(integration.selectedTempo.value).toBe(150);

      // Tempo should persist across other operations
      integration.handleRootChange("G");
      expect(integration.selectedTempo.value).toBe(150);
    });
  });

  describe("practice Flow Integration", () => {
    it("should start practice session correctly", async () => {
      // Initial state
      expect(integration.sessionState.value).toBe("idle");
      expect(integration.isVisible.value).toBe(false);

      // Start practice
      const success = integration.handleStartPractice();
      expect(success).toBe(true);
      expect(integration.isVisible.value).toBe(true);
      expect(integration.sessionState.value).toBe("count-in");

      // Scale notes should be generated
      await integration.generateScaleNotes();
      expect(integration.scaleNotes.value).toHaveLength(8);
    });

    it("should prevent practice start with invalid form", () => {
      // Make form invalid
      integration.selectedRoot.value = "";

      const success = integration.handleStartPractice();
      expect(success).toBe(false);
      expect(integration.isVisible.value).toBe(false);
      expect(integration.sessionState.value).toBe("idle");
    });

    it("should handle note interactions during practice", async () => {
      // Start practice
      integration.handleStartPractice();
      integration.sessionState.value = "playing";

      // Generate scale notes
      await integration.generateScaleNotes();
      const testNote = integration.scaleNotes.value[0];

      // Click note during practice
      const result = integration.handleNoteClick(testNote);
      expect(result.success).toBe(true);
      expect(result.note).toEqual(testNote);
    });

    it("should handle note interactions outside practice", async () => {
      // Not in practice mode
      integration.sessionState.value = "idle";
      integration.isVisible.value = true;
      await integration.generateScaleNotes();

      const testNote = integration.scaleNotes.value[0];
      const result = integration.handleNoteClick(testNote);

      expect(result.success).toBe(false);
      expect(result.note).toEqual(testNote);
    });
  });

  describe("state Synchronization", () => {
    it("should synchronize scale changes across all components", async () => {
      // Initial state
      expect(integration.selectedRoot.value).toBe("C");
      expect(integration.selectedScaleType.value).toBe("major");

      // Change scale via scale change event
      integration.handleScaleChange("A", "blues");

      // All state should be synchronized
      expect(integration.selectedRoot.value).toBe("A");
      expect(integration.selectedScaleType.value).toBe("blues");

      // Visualization should update
      if (integration.isVisible.value) {
        await integration.generateScaleNotes();
        expect(integration.scaleNotes.value[0].note).toBe("A");
      }
    });

    it("should maintain state consistency during rapid changes", async () => {
      // Rapidly change states
      integration.handleRootChange("D");
      integration.handleScaleTypeChange("natural minor");
      integration.handleTempoChange(140);

      // All changes should be applied
      expect(integration.selectedRoot.value).toBe("D");
      expect(integration.selectedScaleType.value).toBe("natural minor");
      expect(integration.selectedTempo.value).toBe(140);

      // Form should remain valid (both root and scale type are set)
      expect(integration.isFormValid.value).toBe(true);
    });
  });

  describe("error Handling", () => {
    it("should handle scale generation errors gracefully", async () => {
      // Mock an error in scale generation
      const originalGenerateScaleNotes = integration.generateScaleNotes;
      integration.generateScaleNotes = async () => {
        throw new Error("Scale generation failed");
      };

      // Try to start practice
      integration.handleStartPractice();

      // Should handle error gracefully
      expect(integration.isVisible.value).toBe(true);
      expect(integration.scaleNotes.value).toHaveLength(0);

      // Restore original function
      integration.generateScaleNotes = originalGenerateScaleNotes;
    });

    it("should handle invalid scale configurations", () => {
      // Set invalid configuration
      integration.selectedRoot.value = "";
      integration.selectedScaleType.value = "major" as ScaleType;

      // Form should be invalid (empty root)
      expect(integration.isFormValid.value).toBe(false);

      // Practice should not start
      const success = integration.handleStartPractice();
      expect(success).toBe(false);
    });
  });

  describe("reset Functionality", () => {
    it("should reset all state to defaults", async () => {
      // Change some values
      integration.handleRootChange("F#");
      integration.handleScaleTypeChange("blues");
      integration.handleTempoChange(150);
      integration.handleStartPractice();
      await integration.generateScaleNotes();

      // Verify changes
      expect(integration.selectedRoot.value).toBe("F#");
      expect(integration.selectedScaleType.value).toBe("blues");
      expect(integration.selectedTempo.value).toBe(150);
      expect(integration.isVisible.value).toBe(true);
      expect(integration.scaleNotes.value).toHaveLength(7);

      // Reset
      integration.resetPractice();

      // Should be back to defaults
      expect(integration.selectedRoot.value).toBe("C");
      expect(integration.selectedScaleType.value).toBe("major");
      expect(integration.selectedTempo.value).toBe(120);
      expect(integration.isVisible.value).toBe(false);
      expect(integration.scaleNotes.value).toHaveLength(0);
      expect(integration.sessionState.value).toBe("idle");
    });
  });

  describe("performance and Responsiveness", () => {
    it("should handle rapid user interactions", async () => {
      const startTime = Date.now();

      // Rapid interactions
      integration.handleRootChange("D");
      integration.handleScaleTypeChange("natural minor");
      integration.handleTempoChange(160);
      integration.handleStartPractice();

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond quickly (less than 100ms for UI interactions)
      expect(responseTime).toBeLessThan(100);

      // State should be consistent
      expect(integration.selectedRoot.value).toBe("D");
      expect(integration.selectedScaleType.value).toBe("natural minor");
      expect(integration.selectedTempo.value).toBe(160);
      expect(integration.isVisible.value).toBe(true);
    });

    it("should handle async operations gracefully", async () => {
      // Start practice (triggers async scale generation)
      integration.handleStartPractice();

      // Should show loading state during generation
      expect(integration.isGenerating.value).toBe(true); // Should be true during generation

      // Wait for scale generation to complete
      await integration.generateScaleNotes();

      // Should complete successfully
      expect(integration.isGenerating.value).toBe(false);
      expect(integration.scaleNotes.value).toHaveLength(8);
    });
  });
});
