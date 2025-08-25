<script setup lang="ts">
import type { KeyHandler, WhiteNote } from "~/types/piano";

import KeyboardHint from "./keyboard-hint.vue";

const _props = withDefaults(defineProps<{
  note: WhiteNote;
  octave: number;
  disabled?: boolean;
  colorClass?: string;
  labelText?: string;
  keyboardHint?: string;
  labelColorClass?: string;
  ariaLabel?: string;
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
    class="white-key piano-key relative select-none flex items-end justify-center pb-4 transition-all duration-200 focus:outline-none "
    :class="[
      colorClass,
      {
        'cursor-not-allowed': disabled,
        'cursor-pointer': !disabled,
      },
    ]"
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
      <KeyboardHint :hint="keyboardHint" />
      <span
        v-if="labelText"
        class="text-xs font-medium"
        :class="labelColorClass"
        aria-hidden="true"
      >{{ labelText }}</span>
    </div>
  </button>
</template>

<style scoped>
.piano-key {
  transform-origin: bottom;
  transition: all 0.2s ease;
}

.white-key {
  z-index: 0;
  width: clamp(32px, 4vw, 56px);
  height: 224px;
  border: 1px solid rgb(229, 231, 235, 0.3);
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.01);
}

.white-key:not(.highlighted-key):not(.active-key):not(.hint-key) {
  background-color: white;
}

.white-key:hover:not(:disabled):not(.highlighted-key):not(.active-key):not(.hint-key) {
  background-color: rgb(249, 250, 251);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.white-key:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.1),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

@media (max-width: 640px) {
  .white-key {
    height: 180px;
  }
}

.dark .white-key {
  background-color: rgb(31, 41, 55);
  border-color: rgb(55, 65, 81);
}

.dark .white-key:hover:not(:disabled) {
  background-color: rgb(55, 65, 81);
}

/* Success ring animation - appears on top of active state */
.success-ring {
  position: relative;
  z-index: 10; /* Ensure it appears above adjacent keys */
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
  z-index: 11; /* Above the key itself */
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
