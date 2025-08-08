<script setup lang="ts">
defineProps<{ hint?: string }>();
</script>

<template>
  <kbd
    v-if="hint"
    class="kbd kbd-xxs mb-0.5 bg-gray-800 text-white border border-gray-700 shadow-sm"
  >{{ hint }}</kbd>
</template>
