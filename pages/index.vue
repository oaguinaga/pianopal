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
        <div
          v-else
          class="flex gap-2 justify-center"
        >
          <NuxtLink
            to="/playground"
            class="btn btn-primary"
          >
            Playground
          </NuxtLink>
          <NuxtLink
            to="/piano-test"
            class="btn btn-secondary"
          >
            Piano Test
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
