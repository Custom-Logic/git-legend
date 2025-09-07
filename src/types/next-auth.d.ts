/**
 * @file This file contains the type definitions for NextAuth.js.
 */

// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  /**
   * The session object.
   * @interface
   */
  interface Session {
    /** The user's access token. */
    accessToken?: string;
  }

  /**
   * The user object.
   * @interface
   */
  interface User {
    /** The user's GitHub ID. */
    githubId?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * The JWT object.
   * @interface
   */
  interface JWT {
    /** The user's access token. */
    accessToken?: string;
  }
}