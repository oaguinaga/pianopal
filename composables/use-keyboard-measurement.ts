import type { Ref } from "vue";

import { ref } from "vue";

import type { BlackKeyPosition } from "~/types/piano";

import {
  BLACK_KEY_MAPPING,
  BLACK_KEY_POSITION_MAP,
  BLACK_KEY_WIDTH_RATIO,
  DEFAULT_WHITE_KEY_WIDTH,
  KEY_GAP,
} from "~/constants/piano";

/**
 * useKeyboardMeasurement
 *
 * Measures white key width from DOM and derives black key positions.
 * Provides a fallback calculation when measurements are unavailable.
 */
export function useKeyboardMeasurement(containerRef: Ref<HTMLElement | undefined>) {
  // Actual white key width (measured from DOM)
  const actualWhiteKeyWidth = ref(DEFAULT_WHITE_KEY_WIDTH);

  // Store measured black key positions for DOM-based calculations
  const blackKeyPositions = ref<Record<string, BlackKeyPosition>>({});

  // Fallback positioning: center between adjacent white keys
  function calculateFallbackPosition(note: string, actualWidth: number): BlackKeyPosition {
    const position = BLACK_KEY_POSITION_MAP[note as keyof typeof BLACK_KEY_POSITION_MAP];
    if (position === undefined) {
      return { left: "0px", width: "0px", transform: "translateX(-50%)" };
    }

    const blackKeyWidth = actualWidth * BLACK_KEY_WIDTH_RATIO;
    const centerPoint = position * (actualWidth + KEY_GAP);

    return {
      left: `${centerPoint}px`,
      width: `${blackKeyWidth}px`,
      transform: "translateX(-50%)",
    };
  }

  // Public: prefer measured positions; fallback to calculated
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

    const blackKeyWidth = actualWhiteKeyWidth.value * BLACK_KEY_WIDTH_RATIO;
    const newPositions: Record<string, BlackKeyPosition> = {};

    // Calculate positions relative to the first octave container
    const firstOctave = octaveContainers[0];
    const octaveRect = firstOctave.getBoundingClientRect();
    const whiteKeysInOctave = firstOctave.querySelectorAll(".white-key");

    if (whiteKeysInOctave.length >= 7) {
      Object.entries(BLACK_KEY_MAPPING).forEach(([note, [leftIndex, rightIndex]]) => {
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
