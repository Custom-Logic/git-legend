import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { PrismaClient } from "@prisma/client";

/**
 * Custom Prisma Adapter to handle NextAuth.js compatibility with our schema
 * - Maps NextAuth's `image` field to our `avatar` field
 * - Handles `emailVerified` field properly
 * - Synchronous version for older NextAuth.js versions
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,

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