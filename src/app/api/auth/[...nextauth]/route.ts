/**
 * @file This file contains the NextAuth.js API route handlers.
 * @exports GET
 * @exports POST
 */

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

/**
 * The NextAuth.js handler.
 * @type {import("next-auth").NextAuthHandler}
 */
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }