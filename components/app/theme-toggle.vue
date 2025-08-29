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
  <ClientOnly>
    <label
      class="swap swap-rotate "
      :class="isDark ? 'text-warning' : 'text-base-content'"
    >
      <input
        v-model="isDark"
        type="checkbox"
        class="swap"
      >

      <Icon
        name="hugeicons:moon-02"
        class="swap-off"
        :size="24"
        aria-label="dark"
      />

      <Icon
        name="hugeicons:sun-01"
        class="swap-on"
        :size="24"
        aria-label="light"
      />
    </label>
  </ClientOnly>
</template>
