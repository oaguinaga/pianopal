import { createAuthClient } from "better-auth/vue";
import { defineStore } from "pinia";

const authClient = createAuthClient();

export const useAuthStore = defineStore("auth", () => {
  const session = authClient.useSession();
  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending);

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/playground",
      errorCallbackURL: "/error",
    });
  };

  const signOut = async () => {
    await authClient.signOut();
    navigateTo("/");
  };

  return {
    loading,
    signIn,
    signOut,
    user,
  };
});
