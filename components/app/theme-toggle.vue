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
  <!-- <label class="swap swap-rotate color-primary">
    <input v-model="isDark" type="checkbox">

    <Icon
      name="hugeicons:sun-03"
      class="swap-on"
      :size="24"
    />
    <Icon
      name="hugeicons:moon-01"
      class="swap-off"
      :size="24"
    />

  </label> -->

  <label class="toggle text-base-content">
    <input
      v-model="isDark"
      type="checkbox"
      class="swap"
    >
    <Icon
      name="hugeicons:moon-01"
      class="swap-on"
      :size="16"
      aria-label="light"
    />
    <Icon
      name="hugeicons:sun-01"
      class="swap-off"
      :size="16"
      aria-label="dark"
    />
  </label>
</template>
