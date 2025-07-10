<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.preference === "dark";
  },
  set(value: boolean) {
    colorMode.preference = value ? "dark" : "light";
  },
});
</script>

<template>
  <label class="swap swap-rotate color-primary">
    <!-- this hidden checkbox controls the state -->
    <input v-model="isDark" type="checkbox">

    <!-- sun icon -->
    <Icon
      name="hugeicons:sun-03"
      class="swap-on"
      :size="24"
    />
    <!-- moon icon -->
    <Icon
      name="hugeicons:moon-01"
      class="swap-off"
      :size="24"
    />

  </label>
</template>
