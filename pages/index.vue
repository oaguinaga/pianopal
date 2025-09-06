<script setup lang="ts">
const authStore = useAuthStore();
</script>

<template>
  <div class="overflow-x-clip">
    <div class="hero bg-base-100 mx-auto flex flex-col gap-4 mt-4">
      <div class="hero-content flex flex-col gap-2 text-center mx-auto z-10">
        <h1 class="text-3xl font-bold">
          👋🏽 Welcome to Pianopal!
        </h1>
        <p class="text-base-content/80 max-w-56 mx-auto font-medium">
          Your Cheerful Scales Companion ✨
        </p>
      </div>

      <div class="relative mt-4 md:mt-6">
        <doodle-background class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 " />
        <single-octave-piano />
      </div>

      <div class="z-10">
        <AuthButton
          v-if="!authStore.user"
          variant="accent"
        />
        <div
          v-else
          class="flex gap-2 justify-center flex-col"
        >
          <NuxtLink
            to="/playground"
            class="btn btn-primary"
          >
            Go to Playground
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
