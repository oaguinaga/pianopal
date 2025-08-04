<script setup lang="ts">
const authStore = useAuthStore();

await authStore.init();
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavBar />
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
