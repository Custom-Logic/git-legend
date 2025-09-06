/**
 * @file This file contains a custom Prisma adapter for NextAuth.js.
 * @exports CustomPrismaAdapter
 */

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { PrismaClient } from "@prisma/client";

/**
 * A custom Prisma adapter for NextAuth.js that handles schema compatibility issues.
 *
 * This adapter extends the base Prisma adapter to:
 * - Map NextAuth's `image` field to the `avatar` field in the User model.
 * - Ensure the `emailVerified` field is handled correctly.
 *
 * @param {PrismaClient} prisma - The Prisma client instance.
 * @returns {Adapter} A custom NextAuth.js adapter.
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,

    /**
     * Creates a new user in the database.
     * @param {Omit<AdapterUser, "id">} userData - The user data.
     * @returns {Promise<AdapterUser>} The created user.
     */
    createUser(userData: Omit<AdapterUser, "id">) {
      try {
        const { image, ...rest } = userData;
        
        return prisma.user.create({
          data: {
            ...rest,
            avatar: image ?? null,
            githubId: userData.email, // Using email as fallback for githubId
          },
        });
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },

    /**
     * Updates an existing user in the database.
     * @param {Partial<AdapterUser> & Pick<AdapterUser, "id">} userData - The user data to update.
     * @returns {Promise<AdapterUser>} The updated user.
     */
    updateUser(userData: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      try {
        const { image, id, ...rest } = userData;
        
        return prisma.user.update({
          where: { id },
          data: {
            ...rest,
            avatar: image ?? undefined,
          },
        });
      } catch (error) {
        console.error("Error updating user:", error);
        throw error;
      }
    },

    /**
     * Retrieves a user by their ID.
     * @param {string} id - The user's ID.
     * @returns {Promise<AdapterUser | null>} The user, or null if not found.
     */
    getUser(id) {
      try {
        return prisma.user.findUnique({
          where: { id },
        }).then(user => {
          if (!user) return null;
          
          // Map our avatar field back to NextAuth's expected image field
          return {
            ...user,
            image: user.avatar ?? null,
          } as AdapterUser;
        });
      } catch (error) {
        console.error("Error getting user:", error);
        return Promise.resolve(null);
      }
    },

    /**
     * Retrieves a user by their email address.
     * @param {string} email - The user's email address.
     * @returns {Promise<AdapterUser | null>} The user, or null if not found.
     */
    getUserByEmail(email) {
      try {
        return prisma.user.findUnique({
          where: { email },
        }).then(user => {
          if (!user) return null;
          
          return {
            ...user,
            image: user.avatar ?? null,
          } as AdapterUser;
        });
      } catch (error) {
        console.error("Error getting user by email:", error);
        return Promise.resolve(null);
      }
    },

    /**
     * Retrieves a user by their linked account.
     * @param {object} providerAccountId - The provider and provider account ID.
     * @param {string} providerAccountId.provider - The provider (e.g., "github").
     * @param {string} providerAccountId.providerAccountId - The provider account ID.
     * @returns {Promise<AdapterUser | null>} The user, or null if not found.
     */
    getUserByAccount(providerAccountId: { provider: string; providerAccountId: string; }) {
      try {
        return prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: providerAccountId.provider,
              providerAccountId: providerAccountId.providerAccountId,
            },
          },
          include: { user: true },
        }).then(account => {
          if (!account?.user) return null;
          
          return {
            ...account.user,
            image: account.user.avatar ?? null,
            emailVerified: account.user.emailVerified ?? null,
          } as AdapterUser;
        });
      } catch (error) {
        console.error("Error getting user by account:", error);
        return Promise.resolve(null);
      }
    },

    // Keep all other methods from the base adapter
    linkAccount: baseAdapter.linkAccount?.bind(baseAdapter),
    createSession: baseAdapter.createSession?.bind(baseAdapter),
    getSessionAndUser: baseAdapter.getSessionAndUser?.bind(baseAdapter),
    updateSession: baseAdapter.updateSession?.bind(baseAdapter),
    deleteSession: baseAdapter.deleteSession?.bind(baseAdapter),
    createVerificationToken: baseAdapter.createVerificationToken?.bind(baseAdapter),
    useVerificationToken: baseAdapter.useVerificationToken?.bind(baseAdapter),
  };
}