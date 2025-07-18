# OKR Manager Authentication Migration

## Authentication System

- The app now uses NextAuth for all authentication and session management.
- All custom JWT/session logic and utilities have been removed.
- API endpoints and middleware use `getServerSession(authOptions)` from NextAuth.
- Shared NextAuth config is located in `src/lib/auth.ts`.
- Session and JWT types are extended in `src/types/next-auth.d.ts`.

## Deprecated Files

- `src/utils/session.ts` (custom JWT/session logic)
- `src/middleware.ts` (custom session middleware)
- `src/middleware/withRole.ts` (role-based middleware)

These files are no longer used and can be deleted.

## How to Authenticate

- Use NextAuth's built-in endpoints and hooks for login, logout, and session management.
- For protected API routes, use:
  ```ts
  import { getServerSession } from "next-auth/next";
  import { authOptions } from "@/lib/auth";
  const session = await getServerSession(authOptions);
  if (!session || !session.user) { /* handle unauthorized */ }
  ```

## Role/Permission Checks

- Use `session.user.isAdmin`, `session.user.isLineManager`, and `session.user.roleName` for role-based logic.

## Migration Notes

- All endpoints and pages have been updated to use NextAuth.
- Remove any remaining imports or references to deprecated files.
- Test all authentication and authorization flows.
