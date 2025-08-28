<script setup lang="ts">
import { ref, watch } from "vue";

import type { ScaleType } from "@/types/scale";

import { AVAILABLE_ROOT_NOTES, AVAILABLE_SCALE_TYPES } from "@/constants/scale";

// ============================================================================
// PROPS & EMITS
// ============================================================================

type Props = {
  selectedRoot?: string;
  selectedScaleType?: ScaleType;
  disabled?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  selectedRoot: "D",
  selectedScaleType: "blues",
  disabled: false,
});

const emit = defineEmits<{
  "root-change": [root: string];
  "scale-type-change": [scaleType: ScaleType];
}>();

// ============================================================================
// REACTIVE STATE
// ============================================================================

const currentRoot = ref(props.selectedRoot);
const currentScaleType = ref<ScaleType>(props.selectedScaleType);

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
</script>

<template>
  <!-- Root Note Selection -->
  <div class="form-control">
    <label class="label">
      <span class="label-text font-medium text-xs">Root Note</span>
    </label>
    <select
      :value="currentRoot"
      :disabled="disabled"
      class="select select-bordered w-full select-sm"
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
      <span class="label-text font-medium text-xs">Scale Type</span>
    </label>
    <select
      :value="currentScaleType"
      :disabled="disabled"
      class="select select-bordered w-full select-sm"
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
