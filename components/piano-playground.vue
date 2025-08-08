<script setup lang="ts">
import { computed, ref, watch } from "vue";

import type { PianoPlaygroundEmits, PianoPlaygroundProps } from "~/types/piano-playground";

import { useKeyboardPiano } from "~/composables/use-keyboard-piano";

// Props with validation and defaults
const props = withDefaults(defineProps<PianoPlaygroundProps>(), {
  octaveRange: 3,
  startOctave: 3,
  showKeyboardGuide: true,
  labelStyle: "letter",
  theme: "light",
  colorMode: "per-note",
  showOctaveLabels: false,
  highlightedNotes: () => [],
  showKeyboardHints: false,
});

// Emits
const emit = defineEmits<PianoPlaygroundEmits>();

// State managed by keyboard composable
const pianoRef = ref<HTMLElement>();
const {
  activeNotes,
  selectedOctaveIndex,
  visibleKeyboardMapping,
  isKeyboardBlocked,
} = useKeyboardPiano({
  octaveRange: computed(() => props.octaveRange),
  startOctave: computed(() => props.startOctave),
  emitNoteOn: note => emit("noteOn", note),
  emitNoteOff: note => emit("noteOff", note),
  getRootEl: () => pianoRef.value ?? null,
});

watch(selectedOctaveIndex, (idx) => {
  emit("selectedOctaveChange", idx);
});

// Expose selected octave if parent needs to read it
defineExpose({ selectedOctaveIndex });

// Build noteId -> key label map for keyboard hints
const noteIdToKeyMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  const current = visibleKeyboardMapping.value;
  for (const [key, noteId] of Object.entries(current)) {
    map[noteId] = key.toUpperCase();
  }
  return map;
});
</script>

<template>
  <div
    ref="pianoRef"
    class="piano-playground w-full focus:outline-none relative"
    tabindex="0"
  >
    <!-- Floating banner when keyboard is blocked by focus on other controls -->
    <div
      v-if="isKeyboardBlocked"
      class="alert alert-warning  shadow-lg absolute left-1/2 top-8 -translate-x-1/2 z-50 w-[min(90vw,400px)] flex items-center gap-2"
      role="status"
    >
      <Icon name="hugeicons:alert-square" size="32" />
      <span class="text-xs ">
        Keyboard input paused while focused on other controls. Click the piano to resume playing.
      </span>
    </div>
    <!-- Visual Piano Component -->
    <VisualPiano
      :active-notes="activeNotes"
      :octaves="octaveRange"
      :start-octave="startOctave"
      :highlighted-notes="highlightedNotes"
      :label-style="labelStyle"
      :theme="theme"
      :color-mode="colorMode"
      :input-enabled="true"
      :show-octave-labels="showOctaveLabels"
      :show-keyboard-hints="showKeyboardHints"
      :keyboard-hints="noteIdToKeyMap"
    />

    <!-- Keyboard Guide -->
    <div
      v-if="showKeyboardGuide"
      class="keyboard-guide mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
    >
      <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Keyboard Mapping
      </h3>

      <!-- Octave selector -->
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-300 mr-2">Octave:</span>
        <button
          v-for="i in octaveRange"
          :key="i"
          type="button"
          class="btn  btn-ghost btn-square"
          @click="selectedOctaveIndex = i - 1"
        >
          <kbd
            class="kbd"
            :class="i - 1 === selectedOctaveIndex ? 'border-primary' : 'btn-ghost'"
          >
            {{ i }}
          </kbd>
        </button>
        <span class="ml-auto text-xs text-gray-500">Press <kbd class="kbd kbd-xs">1</kbd>..<kbd class="kbd kbd-xs">{{ octaveRange }}</kbd> to switch</span>
      </div>

      <!-- Key hints -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <kbd class="kbd">A</kbd><span class="text-sm">{{ visibleKeyboardMapping.a }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">S</kbd><span class="text-sm">{{ visibleKeyboardMapping.s }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">D</kbd><span class="text-sm">{{ visibleKeyboardMapping.d }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">F</kbd><span class="text-sm">{{ visibleKeyboardMapping.f }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <kbd class="kbd">G</kbd><span class="text-sm">{{ visibleKeyboardMapping.g }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">H</kbd><span class="text-sm">{{ visibleKeyboardMapping.h }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">J</kbd><span class="text-sm">{{ visibleKeyboardMapping.j }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">K</kbd><span class="text-sm">{{ visibleKeyboardMapping.k }}</span>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <kbd class="kbd">W</kbd><span class="text-sm">{{ visibleKeyboardMapping.w }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">E</kbd><span class="text-sm">{{ visibleKeyboardMapping.e }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">T</kbd><span class="text-sm">{{ visibleKeyboardMapping.t }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">Y</kbd><span class="text-sm">{{ visibleKeyboardMapping.y }}</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="kbd">U</kbd><span class="text-sm">{{ visibleKeyboardMapping.u }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.key-map-item {
  transition: all 0.2s ease;
}

.key-map-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
