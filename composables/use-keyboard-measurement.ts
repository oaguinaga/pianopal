import type { Ref } from "vue";

import { ref } from "vue";

// Black key positioning mapping within each octave
const blackKeyMapping = {
  "C#": [0, 1], // Between C and D within the octave
  "D#": [1, 2], // Between D and E within the octave
  "F#": [3, 4], // Between F and G within the octave
  "G#": [4, 5], // Between G and A within the octave
  "A#": [5, 6], // Between A and B within the octave
} as const;

type BlackKeyPosition = {
  left: string;
  width: string;
  transform: string;
};

export function useKeyboardMeasurement(containerRef: Ref<HTMLElement | undefined>) {
  // Actual white key width (measured from DOM)
  const actualWhiteKeyWidth = ref(48); // Default fallback

  // Store measured black key positions for DOM-based calculations
  const blackKeyPositions = ref<Record<string, BlackKeyPosition>>({});

  // Helper function for fallback positioning calculation
  function calculateFallbackPosition(note: string, actualWidth: number): BlackKeyPosition {
    const positionMap: Record<string, number> = {
      "C#": 0.5,
      "D#": 1.5,
      "F#": 3.5,
      "G#": 4.5,
      "A#": 5.5,
    } as const;

    const position = positionMap[note];
    if (position === undefined) {
      return { left: "0px", width: "0px", transform: "translateX(-50%)" };
    }

    const gap = 1;
    const blackKeyWidth = actualWidth * 0.6;
    const centerPoint = position * (actualWidth + gap);

    return {
      left: `${centerPoint}px`,
      width: `${blackKeyWidth}px`,
      transform: "translateX(-50%)",
    };
  }

  // Get black key position from stored measurements or fallback calculation
  function getBlackKeyPosition(note: string, actualWidth: number): BlackKeyPosition {
    // Use stored position if available
    const storedPosition = blackKeyPositions.value[note];
    if (storedPosition) {
      return storedPosition;
    }

    // Fallback to calculated positioning using constants
    return calculateFallbackPosition(note, actualWidth);
  }

  // Calculate precise black key positions using DOM measurements
  function calculateBlackKeyPositions() {
    if (!import.meta.client || !containerRef.value)
      return;

    // Get all octave containers to calculate positions within each octave
    const octaveContainers = containerRef.value.querySelectorAll(".octave-container");
    if (octaveContainers.length === 0)
      return;

    const blackKeyWidth = actualWhiteKeyWidth.value * 0.6;
    const newPositions: Record<string, BlackKeyPosition> = {};

    // Calculate positions relative to the first octave container
    const firstOctave = octaveContainers[0];
    const octaveRect = firstOctave.getBoundingClientRect();
    const whiteKeysInOctave = firstOctave.querySelectorAll(".white-key");

    if (whiteKeysInOctave.length >= 7) {
      Object.entries(blackKeyMapping).forEach(([note, [leftIndex, rightIndex]]) => {
        if (whiteKeysInOctave[leftIndex] && whiteKeysInOctave[rightIndex]) {
          const leftKey = whiteKeysInOctave[leftIndex].getBoundingClientRect();
          const rightKey = whiteKeysInOctave[rightIndex].getBoundingClientRect();

          // Calculate the exact center point between the two white keys
          const center = (leftKey.right + rightKey.left) / 2;
          // Position relative to the octave container, not the main container
          const centerPoint = center - octaveRect.left;

          newPositions[note] = {
            left: `${centerPoint}px`,
            width: `${blackKeyWidth}px`,
            transform: "translateX(-50%)",
          };
        }
      });
    }

    blackKeyPositions.value = newPositions;
  }

  // Measure actual white key width and trigger black key position calculation
  function measureKeyWidth() {
    if (!import.meta.client || !containerRef.value)
      return;

    const whiteKeyElement = containerRef.value.querySelector(".white-key");
    if (whiteKeyElement) {
      const width = whiteKeyElement.getBoundingClientRect().width;
      actualWhiteKeyWidth.value = width;

      // Calculate black key positions based on actual white key positions
      calculateBlackKeyPositions();
    }
  }

  return {
    actualWhiteKeyWidth,
    blackKeyPositions,
    getBlackKeyPosition,
    measureKeyWidth,
    calculateBlackKeyPositions,
  };
}
