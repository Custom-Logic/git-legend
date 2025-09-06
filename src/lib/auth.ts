
import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { CustomPrismaAdapter } from "@/lib/auth/prisma-adapter";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: CustomPrismaAdapter(db),
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
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        (session.user as any).id = token.sub as string;
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
    jwt: async ({ user, token, account }) => {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
};