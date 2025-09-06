<script setup lang="ts">
import type { BlackNote, KeyHandler } from "~/types/piano";

import KeyboardHint from "./keyboard-hint.vue";

type GetBlackKeyPosition = (note: string, whiteKeyWidth: number) => Record<string, string>;

// Note: `whiteKeyWidth` and `getBlackKeyPosition` are passed as props on purpose.
// They depend on the parent layout measurement (useKeyboardMeasurement) and keeping
// them as props makes this component standalone (stories/tests) and explicit.
// If we ever thread many piano-wide values, we can switch to provide/inject
// (e.g., a PianoPositionContext) to centralize them.
const _props = withDefaults(defineProps<{
  note: BlackNote;
  octave: number;
  disabled?: boolean;
  colorClass?: string;
  labelText?: string;
  keyboardHint?: string;
  labelColorClass?: string;
  ariaLabel?: string;
  whiteKeyWidth: number;
  getBlackKeyPosition: GetBlackKeyPosition;
  onPress: KeyHandler;
  onRelease: KeyHandler;
}>(), {
  disabled: false,
  colorClass: "",
  labelText: "",
  keyboardHint: "",
  labelColorClass: "",
  ariaLabel: "",
});
</script>

<template>
  <button
    type="button"
    class="black-key piano-key absolute z-10 select-none flex items-end justify-center pb-2 transition-all duration-200 focus:outline-none"
    :class="[
      colorClass,
      {
        'cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
      },
    ]"
    :style="getBlackKeyPosition(note, whiteKeyWidth)"
    :disabled="disabled"
    :tabindex="disabled ? -1 : 0"
    :aria-label="ariaLabel || `${note}${octave}`"
    role="button"
    @pointerdown="onPress(note, octave)"
    @pointerup="onRelease(note, octave)"
    @pointerleave="onRelease(note, octave)"
    @keydown.space.exact.prevent="onPress(note, octave)"
    @keyup.space.exact.prevent="onRelease(note, octave)"
    @keydown.enter.exact.prevent="onPress(note, octave)"
    @keyup.enter.exact.prevent="onRelease(note, octave)"
  >
    <div class="pointer-events-none select-none flex flex-col items-center gap-0.5">
      <KeyboardHint :hint="keyboardHint" size="sm" />
      <span
        v-if="labelText"
        class="text-xs font-medium"
        :class="labelColorClass"
        aria-hidden="true"
      >
        {{ labelText }}
      </span>
    </div>
  </button>
</template>

<style scoped>
.piano-key {
  transform-origin: bottom;
  transition: all 0.2s ease;
}

.black-key {
  z-index: 10;
  width: clamp(26px, 2.4vw, 34px);
  height: 134px;
  border: 1px solid rgb(17, 24, 39, 0.3);
  border-radius: 0 0 0.375rem 0.375rem;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.black-key:not(.highlighted-key):not(.active-key):not(.hint-key) {
  background-color: rgb(55, 65, 81);
}

.black-key:hover:not(:disabled):not(.highlighted-key):not(.active-key):not(.hint-key) {
  background-color: rgb(75, 85, 99);
  box-shadow:
    0 4px 8px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.black-key:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 2px 4px rgba(0, 0, 0, 0.15);
}

@media (max-width: 640px) {
  .black-key {
    height: 108px;
  }
}

/* Success ring animation - appears on top of active state */
.success-ring {
  z-index: 20; /* Higher than white keys to ensure visibility */
}

.success-ring::after {
  content: "";
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border: 2px solid currentColor;
  border-radius: inherit;
  animation: successRing 500ms ease-out;
  pointer-events: none;
  z-index: 21; /* Above the key itself */
}

@keyframes successRing {
  0% {
    transform: scale(1);
    opacity: 0.8;
    border-width: 2px;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
    border-width: 1px;
  }
}
</style>
