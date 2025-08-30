import { anonymousClient, magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/vue";
import { defineStore } from "pinia";

const authClient = createAuthClient({
  plugins: [
    anonymousClient(),
    magicLinkClient(),
  ],
},
);

export const useAuthStore = defineStore("auth", () => {
  const session = ref<Awaited<ReturnType<typeof authClient.useSession>> | null>(null);

  async function init() {
    const data = await authClient.useSession(useFetch);
    session.value = data;
  }

  const user = computed(() => session.value?.data?.user);
  const loading = computed(() => session.value?.isPending);

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/playground",
      errorCallbackURL: "/error",
    });
  };

  const signInAnonymously = async () => {
    await authClient.signIn.anonymous();
  };

  const signInWithMagicLink = async (email: string) => {
    await authClient.signIn.magicLink({
      email,
      callbackURL: "/playground",
    });
  };

  const signOut = async () => {
    await authClient.signOut();
    navigateTo("/");
  };

  return {
    init,
    signIn,
    signInAnonymously,
    signInWithMagicLink,
    signOut,
    user,
    loading,
  };
});
