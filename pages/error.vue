<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const error = route.query.error ?? "Something went wrong";
</script>

<template>
  <div class="flex flex-col items-center justify-center h-80 flex-1 container mx-auto bg-base-200 gap-y-4 mt-10 rounded-2xl">
    <div class="alert alert-error">
      <Icon
        name="hugeicons:alert-02"
        :size="32"
      />
      <p>
        {{ error }}
      </p>
    </div>

    <button class="btn btn-ghost " @click="router.push('/')">
      <Icon
        name="hugeicons:link-backward"
        :size="24"
      />
      Go to home
    </button>
  </div>
</template>
