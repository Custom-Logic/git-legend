/**
 * @file This file contains the NextAuth configuration options.
 * @exports authOptions
 */

import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { CustomPrismaAdapter } from "@/lib/auth/prisma-adapter";
import { db } from "@/lib/db";

/**
 * The NextAuth configuration options.
 * @type {NextAuthOptions}
 */
export const authOptions: NextAuthOptions = {
  /**
   * A custom Prisma adapter for NextAuth.
   * @see {@link CustomPrismaAdapter}
   */
  adapter: CustomPrismaAdapter(db),
  /**
   * An array of authentication providers.
   * @see {@link https://next-auth.js.org/providers/github}
   */
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "repo read:user user:email read:org repo:status",
        },
      },
    }),
  ],
  /**
   * Callbacks for handling authentication events.
   * @see {@link https://next-auth.js.org/configuration/callbacks}
   */
  callbacks: {
    /**
     * This callback is called whenever a JSON Web Token is created (i.e. at sign in) or updated.
     * @param {object} params - The parameters for the JWT callback.
     * @param {JWT} params.token - The token.
     * @param {Account} params.account - The account.
     * @param {User} params.user - The user.
     * @returns {Promise<JWT>} The updated token.
     */
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    /**
     * This callback is called whenever a session is checked.
     * @param {object} params - The parameters for the session callback.
     * @param {Session} params.session - The session.
     * @param {JWT} params.token - The token.
     * @param {User} params.user - The user.
     * @returns {Promise<Session>} The updated session.
     */
    async session({ session, token, user }) {
      // Add access token if available
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      
      // Add user ID to session
      if (token?.userId) {
        session.user.id = token.userId as string;
      } else if (user?.id) {
        session.user.id = user.id;
      }
      
      return session;
    },
  },
  /**
   * The pages for authentication.
   * @see {@link https://next-auth.js.org/configuration/pages}
   */
  pages: {
    signIn: "/auth/signin",
  },
  /**
   * The session configuration.
   * @see {@link https://next-auth.js.org/configuration/options#session}
   */
  session: {
    strategy: "jwt",
  },
};