<script setup lang="ts">
withDefaults(defineProps<{
  hint?: string;
  size?: "sm" | "md" | "lg" | "xl";
}>(), {
  size: "md",
});
</script>

<template>
  <kbd
    v-if="hint"
    :class="`kbd kbd-${size} mb-0.5 bg-gray-800 text-white border border-gray-700 shadow-sm ${size === 'sm' ? 'rounded-md' : ''}`"
  >{{ hint }}</kbd>
</template>
