import { createAuthClient } from "better-auth/client";
import { defineStore } from "pinia";

const authClient = createAuthClient();

export const useAuthStore = defineStore("auth", () => {
  const loading = ref(false);

  const signIn = async () => {
    loading.value = true;
    await authClient.signIn.social({
      provider: "google",
      errorCallbackURL: "/error",
    });
    loading.value = false;
  };

  return {
    loading,
    signIn,
  };
});
