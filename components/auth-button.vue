<script setup lang="ts">
withDefaults(defineProps<{
  variant?: "default" | "accent";
}>(), {
  variant: "default",
});
const authStore = useAuthStore();
const isOpen = ref(false);

const email = ref("");
const isSubmitting = ref(false);
const showSuccess = ref(false);

const { user, loading } = storeToRefs(authStore);

const dialog = useTemplateRef("dialog");

function onClose() {
  isOpen.value = false;
}

onMounted(() => {
  dialog.value?.addEventListener("close", onClose);
});

onUnmounted(() => {
  dialog.value?.removeEventListener("close", onClose);
});

async function handleMagicLinkSubmit() {
  if (!email.value)
    return;

  isSubmitting.value = true;
  showSuccess.value = false;

  try {
    await authStore.signInWithMagicLink(email.value);
    showSuccess.value = true;
  }
  catch (error) {
    console.error("Magic link error:", error);
    // Handle error (show error message)
  }
  finally {
    isSubmitting.value = false;
  }
}

function handleAnonymousSignIn() {
  authStore.signInAnonymously();
  isOpen.value = false;
  navigateTo("/playground");
}
</script>

<template>
  <div
    v-if="user && !loading"
    class="dropdown dropdown-end"
  >
    <div
      tabindex="0"
      role="button"
      class="btn m-1 px-2"
    >
      <div class="avatar">
        <div
          v-if="user?.image"
          class="avatar"
        >
          <div class="w-8 h-8 mask mask-squircle rotate-12">
            <img
              :src="user?.image"
            >
          </div>
        </div>
        <div
          v-else
        >
          <div class="w-8 h-8 flex items-center justify-center">
            <Icon
              name="hugeicons:user-circle"
              size="24"
            />
          </div>
        </div>
      </div>
    </div>
    <ul tabindex="0" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm">
      <li>
        <NuxtLink to="/sign-out">
          <Icon
            name="hugeicons:logout-03"
            size="16"
          />
          Sign out
        </NuxtLink>
      </li>
    </ul>
  </div>

  <button
    v-else
    class="btn"
    :class="{ 'btn-primary': variant === 'accent' }"
    @click="isOpen = true"
  >
    <span v-if="variant === 'accent'">
      Start Playing Scales Now
    </span>
    <span v-else>
      Sign in
    </span>
  </button>

  <dialog
    ref="dialog"
    :open="isOpen"
    class="modal "
  >
    <div class="modal-box max-w-96">
      <h3 class="text-lg font-bold mb-4 text-center">
        Sign in
      </h3>

      <form class="space-y-2" @submit.prevent="handleMagicLinkSubmit">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">
            Email address
          </legend>

          <label class="input validator w-full">
            <Icon name="hugeicons:mail-02" size="24" />
            <input
              v-model="email"
              type="email"
              placeholder="mail@site.com"
              required
            >
          </label>
        </fieldset>

        <div v-if="showSuccess" class="alert alert-success">
          <Icon name="hugeicons:checkmark-circle-02" size="16" />
          Magic link sent! Check your email.
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isSubmitting || !email"
        >
          <Icon
            name="hugeicons:magic-wand-01"
            size="20"
            :class="{ 'animate-spin': isSubmitting }"
          />
          {{ isSubmitting ? 'Sending...' : 'Email me a magic link' }}
        </button>
      </form>

      <div class="divider">
        or
      </div>

      <div class="space-y-2">
        <button
          class="btn bg-white text-black w-full"
          :disabled="authStore.loading"
          @click="authStore.signIn"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            preserveAspectRatio="xMidYMid"
            viewBox="-3 0 262 262"
            :class="{ 'opacity-50': authStore.loading }"
          >
            <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" /><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" /><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" /><path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
          </svg>
          Login with Google
        </button>

        <button
          class="btn btn-ghost w-full"
          @click="handleAnonymousSignIn"
        >
          <Icon
            name="hugeicons:incognito"
            size="16"
          />
          Continue as guest
        </button>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button @click="isOpen = false">
        close
      </button>
    </form>
  </dialog>
</template>
