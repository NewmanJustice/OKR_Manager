import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions, SessionStrategy } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        if (user.status !== "active") {
          // Only allow verified users to log in
          throw new Error("Account not verified. Please check your email.");
        }
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return { id: String(user.id), name: user.name, email: user.email };
      }
    })
  ],
  session: {
    strategy: "jwt" as SessionStrategy
  },
  pages: {
    signIn: "/"
  },
  callbacks: {
    async jwt({ token, user }) {
      // Always fetch user from DB for up-to-date isLineManager
      if (token?.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.isLineManager = dbUser.isLineManager;
        }
      }
      if (user) {
        token.id = user.id;
        token.isLineManager = (user as any).isLineManager;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id;
        (session.user as any).isLineManager = token.isLineManager;
      }
      return session;
    },
  },
};
