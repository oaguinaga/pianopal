<script setup lang="ts">
const highlightedNotes = ref<string[]>(["C4", "E4", "G4"]);
</script>

<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold mb-4">
      PianoPlayground Demo
    </h1>

    <PianoPlayground
      :octave-range="3"
      :start-octave="3"
      :show-keyboard-guide="true"
      label-style="letter"
      color-mode="per-note"
      :highlighted-notes="highlightedNotes"
    />
  </div>
</template>
