<script setup lang="ts">
import { computed, ref, watch } from "vue";

import type { ScaleType } from "@/types/scale";

import { AVAILABLE_ROOT_NOTES, AVAILABLE_SCALE_TYPES, METRONOME_CONFIG } from "@/constants/scale";

// ============================================================================
// PROPS & EMITS
// ============================================================================

type Props = {
  selectedRoot?: string;
  selectedScaleType?: ScaleType;
  selectedTempo?: number;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  selectedRoot: "C",
  selectedScaleType: "major",
  selectedTempo: METRONOME_CONFIG.DEFAULT_BPM,
  disabled: false,
});

const emit = defineEmits<{
  "root-change": [root: string];
  "scale-type-change": [scaleType: ScaleType];
  "tempo-change": [tempo: number];
  "start-practice": [];
}>();

// ============================================================================
// REACTIVE STATE
// ============================================================================

const currentRoot = ref(props.selectedRoot);
const currentScaleType = ref<ScaleType>(props.selectedScaleType);
const currentTempo = ref(props.selectedTempo);

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const isFormValid = computed(() => {
  return currentRoot.value && currentScaleType.value && currentTempo.value;
});

const tempoRange = computed(() => ({
  min: METRONOME_CONFIG.MIN_BPM,
  max: METRONOME_CONFIG.MAX_BPM,
}));

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleRootChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const newRoot = target.value;
  currentRoot.value = newRoot;
  emit("root-change", newRoot);
}

function handleScaleTypeChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const newScaleType = target.value as ScaleType;
  currentScaleType.value = newScaleType;
  emit("scale-type-change", newScaleType);
}

function handleTempoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const newTempo = Number.parseInt(target.value, 10);
  currentTempo.value = newTempo;
  emit("tempo-change", newTempo);
}

function handleStartPractice() {
  if (isFormValid.value) {
    emit("start-practice");
  }
}

// ============================================================================
// WATCHERS
// ============================================================================

// Sync with props changes
watch(
  () => props.selectedRoot,
  (newRoot) => {
    if (newRoot && newRoot !== currentRoot.value) {
      currentRoot.value = newRoot;
    }
  },
);

watch(
  () => props.selectedScaleType,
  (newScaleType) => {
    if (newScaleType && newScaleType !== currentScaleType.value) {
      currentScaleType.value = newScaleType;
    }
  },
);

watch(
  () => props.selectedTempo,
  (newTempo) => {
    if (newTempo && newTempo !== currentTempo.value) {
      currentTempo.value = newTempo;
    }
  },
);
</script>

<template>
  <div class="scale-selection">
    <!-- Header -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-base-content mb-2">
        🎹 Scale Practice Configuration
      </h3>
      <p class="text-sm text-base-content/70">
        Choose your scale, root note, and tempo to begin practicing
      </p>
    </div>

    <!-- Configuration Form -->
    <div class="space-y-4">
      <!-- Root Note Selection -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Root Note</span>
        </label>
        <select
          :value="currentRoot"
          :disabled="disabled"
          class="select select-bordered w-full"
          data-testid="root-note-select"
          @change="handleRootChange"
        >
          <option
            v-for="note in AVAILABLE_ROOT_NOTES"
            :key="note"
            :value="note"
          >
            {{ note }}
          </option>
        </select>
      </div>

      <!-- Scale Type Selection -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">Scale Type</span>
        </label>
        <select
          :value="currentScaleType"
          :disabled="disabled"
          class="select select-bordered w-full"
          data-testid="scale-type-select"
          @change="handleScaleTypeChange"
        >
          <option
            v-for="scaleType in AVAILABLE_SCALE_TYPES"
            :key="scaleType"
            :value="scaleType"
          >
            {{ scaleType.charAt(0).toUpperCase() + scaleType.slice(1) }}
          </option>
        </select>
      </div>

      <!-- Tempo Selection -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">
            Tempo: {{ currentTempo }} BPM
          </span>
        </label>
        <input
          type="range"
          :step="5"
          :min="tempoRange.min"
          :max="tempoRange.max"
          :value="currentTempo"
          :disabled="disabled"
          class="range range-primary range-xs"
          data-testid="tempo-slider"
          @input="handleTempoChange"
        >
        <div class="flex justify-between text-xs text-base-content/60 mt-1">
          <span>{{ tempoRange.min }} BPM</span>
          <span>{{ tempoRange.max }} BPM</span>
        </div>
      </div>

      <!-- Start Practice Button -->
      <div class="pt-4">
        <button
          :disabled="!isFormValid || disabled"
          class="btn btn-primary w-full"
          data-testid="start-practice-btn"
          @click="handleStartPractice"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Start Practice
        </button>
      </div>
    </div>

    <!-- Preview Display -->
    <div class="mt-6 p-4 bg-base-200 rounded-box">
      <h4 class="font-medium text-base-content mb-2">
        Preview
      </h4>
      <p class="text-sm text-base-content/70">
        You'll be practicing the
        <span class="font-semibold text-primary">{{ currentRoot }} {{ currentScaleType }}</span>
        scale at
        <span class="font-semibold text-primary">{{ currentTempo }} BPM</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.scale-selection {
  max-width: 28rem; /* equivalent to max-w-md */
  margin-left: auto;
  margin-right: auto;
}

/* Custom range slider styling */
.range::-webkit-slider-thumb {
  background-color: hsl(var(--p)); /* primary color */
  border-color: hsl(var(--p));
}

.range::-moz-range-thumb {
  background-color: hsl(var(--p)); /* primary color */
  border-color: hsl(var(--p));
}
</style>
