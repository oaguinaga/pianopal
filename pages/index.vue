<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <div class="hero bg-base-300 mx-auto container mt-8 rounded-2xl">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold">
          Hello there
        </h1>
        <p class="py-6">
          Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
          quasi. In deleniti eaque aut repudiandae et a id nisi.
        </p>
        <AuthButton v-if="!authStore.user" />
        <NuxtLink
          v-else
          to="/playground"
          class="btn btn-primary"
        >
          Playground
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
