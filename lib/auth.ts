import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous, createAuthMiddleware, magicLink } from "better-auth/plugins";

import db from "./db/index";
import { magicLinkEmailTemplate, sendEmail } from "./email";
import env from "./env";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [
    anonymous(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          from: `PianoPal <noreply@${env.EMAIL_FROM_DOMAIN}>`,
          to: email,
          subject: "🎹 Sign in to PianoPal",
          html: magicLinkEmailTemplate(url),
          text: `Sign in to PianoPal: ${url}\n\nThis link expires in 10 minutes.`,
        });
      },
      expiresIn: 60 * 10, // 10 minutes
    }),
  ],
  hooks: {
    // middleware to fix issue of duplicated request on the client when logged out
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/get-session") {
        if (!ctx.context.session) {
          return ctx.json({
            session: null,
            user: null,
          });
        }
        return ctx.json(ctx.context.session);
      }
    }),
  },
});
