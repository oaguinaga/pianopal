<script setup lang="ts">
const authStore = useAuthStore();

onMounted(() => {
  authStore.signOut();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center h-80 flex-1 container mx-auto">
    <span class="loading loading-ring loading-md" />
  </div>
</template>
