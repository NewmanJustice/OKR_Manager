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
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    roleName?: string;
    isLineManager?: boolean;
    isAdmin?: boolean;
  }
}
