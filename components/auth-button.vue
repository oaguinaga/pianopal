<script setup lang="ts">
const authStore = useAuthStore();
const isOpen = ref(false);

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
        <div class="mask mask-squircle w-8 h-8" :class="{ 'rotate-12': user?.image }">
          <img
            v-if="user?.image"
            :src="user?.image"
          >
          <Icon
            v-else
            name="hugeicons:user-circle"
            size="24"
          />
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
    @click="isOpen = true"
  >
    Sign in
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

      <form class="space-y-2">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">
            Email address
          </legend>

          <label class="input validator w-full">
            <Icon
              name="hugeicons:mail-02"
              size="24"
            />
            <input
              type="email"
              placeholder="mail@site.com"
              required
            >
          </label>
        </fieldset>
        <div class="validator-hint hidden">
          Enter valid email address
        </div>
        <button
          class="btn btn-primary w-full"
          :disabled="authStore.loading"
        >
          <Icon
            name="hugeicons:magic-wand-01"
            size="20"
          />
          Email me a magic link
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

        <button class="btn bg-black text-white border-black w-full">
          <svg
            aria-label="Apple logo"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1195 1195"
          ><path fill="white" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z" /></svg>
          Login with Apple
        </button>

        <button
          class="btn btn-ghost w-full"
        >
          <Icon
            name="hugeicons:incognito"
            size="16"
          />
          Continue as guest
        </button>
      </div>

      <div class="modal-footer">
        <p class="text-xs mt-4">
          Please note that if your Github or Discord use a different email address it might not match the one you used to sign up.
        </p>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button @click="isOpen = false">
        close
      </button>
    </form>
  </dialog>
</template>
