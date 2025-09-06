import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { PrismaClient } from "@prisma/client";

/**
 * Custom Prisma Adapter to map NextAuth's `image` field to our schema's `avatar` field.
 * Extends the default PrismaAdapter, overriding user creation and update logic.
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const base = PrismaAdapter(prisma);

  return {
    ...base,
    async createUser(user) {
      // Map `image` to `avatar` for our schema
      const { image, ...rest } = user;
      const data = { ...rest, avatar: image ?? null };
      try {
        // @ts-ignore - base.createUser may expect AdapterUser, but we map fields here
        return await base.createUser(data);
      } catch (error) {
        // Add error handling/logging as needed
        throw error;
      }
    },
    async updateUser(user) {
      // Map `image` to `avatar` for our schema
      const { image, ...rest } = user;
      const data = { ...rest, avatar: image ?? null };
      try {
        // @ts-ignore - base.updateUser may expect AdapterUser, but we map fields here
        return await base.updateUser(data);
      } catch (error) {
        throw error;
      }
    },
    // Optionally, override getUser if you want to map `avatar` back to `image` for NextAuth
    async getUser(id) {
      if (!base.getUser) return null;
      const user = await base.getUser(id);
      if (!user) return null;
      // Map `avatar` back to `image` for NextAuth compatibility
      return { ...user, image: (user as any).avatar ?? null } as AdapterUser;
    },
    async getUserByEmail(email) {
      if (!base.getUserByEmail) return null;
      const user = await base.getUserByEmail(email);
      if (!user) return null;
      return { ...user, image: (user as any).avatar ?? null } as AdapterUser;
    },
    async getUserByAccount(account) {
      if (!base.getUserByAccount) return null;
      const user = await base.getUserByAccount(account);
      if (!user) return null;
      return { ...user, image: (user as any).avatar ?? null } as AdapterUser;
    },
  };
}
