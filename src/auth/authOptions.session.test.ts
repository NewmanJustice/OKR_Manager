import { authOptions } from "./authOptions";
import { prisma } from "@/lib/prisma";

describe("authOptions.session callback", () => {
  it("includes jobRoleId and isLineManager in session.user", async () => {
    const token = {
      id: 1,
      email: "test@example.com",
      isLineManager: true,
      jobRoleId: "role-123"
    };
    const session = { user: { name: "Test", email: "test@example.com" }, expires: "2099-12-31T23:59:59.999Z" };
    const user = { id: "1", name: "Test", email: "test@example.com", emailVerified: null };
    const result = await authOptions.callbacks?.session!({ session, token, user, newSession: undefined, trigger: "update" });
    expect(result).toBeDefined();
    expect((result!.user as any).id).toBe(1);
    expect((result!.user as any).isLineManager).toBe(true);
    expect((result!.user as any).jobRoleId).toBe("role-123");
  });

  it("does not add jobRoleId if not present in token", async () => {
    const token = {
      id: 1,
      email: "test@example.com",
      isLineManager: false
    };
    const session = { user: { name: "Test", email: "test@example.com" }, expires: "2099-12-31T23:59:59.999Z" };
    const user = { id: "1", name: "Test", email: "test@example.com", emailVerified: null };
    const result = await authOptions.callbacks?.session!({ session, token, user, newSession: undefined, trigger: "update" });
    expect(result).toBeDefined();
    expect((result!.user as any).jobRoleId).toBeUndefined();
  });
});
