import NextAuth from "next-auth/next";
import { authConfig } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { GET, POST } = NextAuth(authConfig as any);
