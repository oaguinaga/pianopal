<script setup lang="ts">
const colorMode = useColorMode();

const isDark = computed(() => colorMode.preference === "dark");
</script>

<template>
  <ClientOnly>
    <NuxtImg
      :ssr="false"
      :src="isDark ? '/logo/logo-dark.svg' : '/logo/logo-light.svg'"
      alt="logo"
      class="h-8"
    />
  </ClientOnly>
</template>
