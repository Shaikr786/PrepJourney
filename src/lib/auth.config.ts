import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible Auth.js configuration.
 * Keep database adapters and Node.js-only dependencies out of this file,
 * because middleware imports this configuration.
 */
const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;

export default authConfig;
