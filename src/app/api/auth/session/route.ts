import NextAuth from "next-auth/next";
import { authConfig } from "@/lib/auth";

// Handles GET /api/auth/session for NextAuth v5
export const { GET } = NextAuth(authConfig as any);
