import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { Session, User } from "next-auth";

// Type augmentation for session and user (must match NextAuth defaults)
declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roleName?: string;
      isLineManager?: boolean;
      isAdmin?: boolean;
    };
  }
  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    roleName?: string;
    isLineManager?: boolean;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roleName?: string;
    isLineManager?: boolean;
    isAdmin?: boolean;
  }
}

// NextAuth.js v5: Export config only
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) return null;
        // If you want roleName, you must join the related role table or map roleId to a name
        // For now, just return roleId as roleName (string)
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          image: null,
          roleName: user.roleId ? String(user.roleId) : undefined,
          isLineManager: user.isLineManager,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: Record<string, unknown> }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.roleName = token.roleName as string | undefined;
        session.user.isLineManager = token.isLineManager as boolean | undefined;
        session.user.isAdmin = token.isAdmin as boolean | undefined;
      }
      return session;
    },
    async jwt({ token, user }: { token: Record<string, unknown>; user?: User }) {
      if (user) {
        token.id = user.id;
        token.roleName = user.roleName;
        token.isLineManager = user.isLineManager;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=CredentialsSignin",
  },
};

export const authConfig = authOptions;
