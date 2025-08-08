/**
 * useKeyboardPiano
 *
 * Keyboard-to-piano input composable that:
 * - Maps QWERTY keys to piano notes (white/black)
 * - Tracks selected octave (1..N via number keys)
 * - Emits noteOn/noteOff through the provided config callbacks
 * - Handles focus/blur and interactive element guards
 *
 * Returns: { activeNotes, selectedOctaveIndex, selectedOctave, visibleKeyboardMapping, isKeyboardBlocked }
 */
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import type { KeyboardKeyBlack, KeyboardKeyWhite, UseKeyboardPianoConfig } from "~/types/piano";

import { KEYBOARD_TO_PIANO_BLACK_MAP, KEYBOARD_TO_PIANO_WHITE_MAP } from "~/constants/piano";

export function useKeyboardPiano(config: UseKeyboardPianoConfig) {
  // Local boundaries for octave math when mapping keys → notes
  const MIN_OCTAVE_INDEX = 0;
  const MAX_OCTAVE_INDEX = 8;

  const activeNotes = ref<string[]>([]);
  const pressedKeys = ref<Set<string>>(new Set());
  const isKeyboardBlocked = ref(false);
  const isWindowFocused = ref(true);
  let onWindowFocusHandler: (() => void) | undefined;
  let onWindowBlurHandler: (() => void) | undefined;

  // Selected octave index within the configured range (default to middle)
  const selectedOctaveIndex = ref(0);
  const selectedOctave = computed(() => config.startOctave.value + selectedOctaveIndex.value);

  // Initialize default selected octave (middle) and keep within bounds on changes
  watch(() => config.octaveRange.value, (newValue) => {
    const clamped = Math.max(1, Math.min(7, newValue));
    selectedOctaveIndex.value = Math.floor((clamped - 1) / 2);
  }, { immediate: true });

  watch(() => config.startOctave.value, () => {
    const maxIndex = Math.max(0, config.octaveRange.value - 1);
    selectedOctaveIndex.value = Math.min(selectedOctaveIndex.value, maxIndex);
  }, { immediate: true });

  // Mappings are imported from constants for readability/testability

  // Helpers
  function isNumberKey(key: string): boolean {
    return /^[1-9]$/.test(key);
  }

  function withinOctaveBounds(octave: number): boolean {
    return octave >= MIN_OCTAVE_INDEX && octave <= MAX_OCTAVE_INDEX;
  }

  function getNoteForKey(key: string, baseOctave: number): string | undefined {
    const lower = key.toLowerCase() as KeyboardKeyWhite | KeyboardKeyBlack | string;
    if (lower in KEYBOARD_TO_PIANO_WHITE_MAP) {
      const { note, deltaOctave = 0 } = KEYBOARD_TO_PIANO_WHITE_MAP[lower as KeyboardKeyWhite];
      const octave = baseOctave + deltaOctave;
      if (!withinOctaveBounds(octave))
        return undefined;
      return `${note}${octave}`;
    }
    if (lower in KEYBOARD_TO_PIANO_BLACK_MAP) {
      const { note } = KEYBOARD_TO_PIANO_BLACK_MAP[lower as KeyboardKeyBlack];
      if (!withinOctaveBounds(baseOctave))
        return undefined;
      return `${note}${baseOctave}`;
    }
    return undefined;
  }

  // Keyboard guide mapping for current selected octave
  const visibleKeyboardMapping = computed<Record<string, string>>(() => {
    const mapping: Record<string, string> = {};
    Object.entries(KEYBOARD_TO_PIANO_WHITE_MAP).forEach(([k, { note, deltaOctave = 0 }]) => {
      mapping[k] = `${note}${selectedOctave.value + deltaOctave}`;
    });
    Object.entries(KEYBOARD_TO_PIANO_BLACK_MAP).forEach(([k, { note }]) => {
      mapping[k] = `${note}${selectedOctave.value}`;
    });
    return mapping;
  });

  function isInteractiveTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element))
      return false;
    const tag = target.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select")
      return true;
    if ((target as HTMLElement).isContentEditable)
      return true;
    return false;
  }

  function updateBlockedByFocus() {
    if (!import.meta.client)
      return;
    if (!isWindowFocused.value) {
      isKeyboardBlocked.value = true;
      return;
    }
    const active = document.activeElement as HTMLElement | null;
    const root = config.getRootEl?.() ?? null;
    // If focus is within the piano, do not block
    if (active && root && root.contains(active)) {
      isKeyboardBlocked.value = false;
      return;
    }
    isKeyboardBlocked.value = isInteractiveTarget(active);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (isInteractiveTarget(event.target))
      return;
    const key = event.key.toLowerCase();

    // Octave selection via number keys (1..octaveRange)
    if (handleOctaveSelection(key)) {
      event.preventDefault();
      return;
    }

    const note = getNoteForKey(key, selectedOctave.value);

    if (note)
      event.preventDefault();

    if (pressedKeys.value.has(key))
      return;

    if (note) {
      pressedKeys.value.add(key);
      if (!activeNotes.value.includes(note)) {
        activeNotes.value = [...activeNotes.value, note];
        config.emitNoteOn(note);
      }
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (isInteractiveTarget(event.target))
      return;
    const key = event.key.toLowerCase();
    if (isNumberKey(key))
      return;
    const note = getNoteForKey(key, selectedOctave.value);
    if (note) {
      pressedKeys.value.delete(key);
      activeNotes.value = activeNotes.value.filter(n => n !== note);
      config.emitNoteOff(note);
    }
  }

  function handleOctaveSelection(key: string): boolean {
    if (!isNumberKey(key))
      return false;
    const requestedIndex = Number.parseInt(key, 10) - 1;
    if (requestedIndex >= 0 && requestedIndex < config.octaveRange.value) {
      selectedOctaveIndex.value = requestedIndex;
      return true;
    }
    return false;
  }

  function cleanup() {
    const notesToRelease = [...activeNotes.value];
    activeNotes.value = [];
    pressedKeys.value.clear();
    notesToRelease.forEach(config.emitNoteOff);
  }

  // Global keyboard listeners
  onMounted(() => {
    if (!import.meta.client)
      return;
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    onWindowFocusHandler = function onWindowFocus() {
      isWindowFocused.value = true;
      updateBlockedByFocus();
    };
    onWindowBlurHandler = function onWindowBlur() {
      isWindowFocused.value = false;
      updateBlockedByFocus();
      cleanup();
    };
    window.addEventListener("blur", onWindowBlurHandler);
    window.addEventListener("focus", onWindowFocusHandler);
    window.addEventListener("focusin", updateBlockedByFocus, true);
    window.addEventListener("focusout", updateBlockedByFocus, true);
    updateBlockedByFocus();
  });

  onUnmounted(() => {
    if (!import.meta.client)
      return;
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    if (onWindowBlurHandler) {
      window.removeEventListener("blur", onWindowBlurHandler);
      onWindowBlurHandler = undefined;
    }
    if (onWindowFocusHandler) {
      window.removeEventListener("focus", onWindowFocusHandler);
      onWindowFocusHandler = undefined;
    }
    window.removeEventListener("focusin", updateBlockedByFocus, true);
    window.removeEventListener("focusout", updateBlockedByFocus, true);
  });

  return {
    // state
    activeNotes,
    selectedOctaveIndex,
    selectedOctave,
    visibleKeyboardMapping,
    isKeyboardBlocked,
    // handlers (intentionally not exported; handled globally)
  };
}
