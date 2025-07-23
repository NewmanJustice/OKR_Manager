import { authOptions } from "./authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const credentialsProvider = authOptions.providers.find(
  (provider) => provider.name === "Credentials"
);
const authorize = credentialsProvider && typeof credentialsProvider.authorize === "function" ? credentialsProvider.authorize : undefined;

describe("authOptions.credentials.authorize", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns null if no credentials", async () => {
    if (!authorize) throw new Error("Authorize not found");
    expect(await authorize(undefined, {})).toBeNull();
  });

  it("returns null if user not found", async () => {
    if (!authorize) throw new Error("Authorize not found");
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue(null as any);
    expect(await authorize({ email: "test@example.com", password: "pass" }, {})).toBeNull();
  });

  it("throws error if user not verified", async () => {
    if (!authorize) throw new Error("Authorize not found");
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: 1, name: "Test", email: "test@example.com", password: "hashed", status: "pending" } as any);
    await expect(authorize({ email: "test@example.com", password: "pass" }, {})).rejects.toThrow("Account not verified. Please check your email.");
  });

  it("returns null if password is invalid", async () => {
    if (!authorize) throw new Error("Authorize not found");
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: 1, name: "Test", email: "test@example.com", password: "hashed", status: "active" } as any);
    jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(false));
    expect(await authorize({ email: "test@example.com", password: "wrong" }, {})).toBeNull();
  });

  it("returns user object if credentials are valid and verified", async () => {
    if (!authorize) throw new Error("Authorize not found");
    jest.spyOn(prisma.user, "findUnique").mockResolvedValue({ id: 1, name: "Test", email: "test@example.com", password: "hashed", status: "active" } as any);
    jest.spyOn(bcrypt, "compare").mockImplementation(() => Promise.resolve(true));
    expect(await authorize({ email: "test@example.com", password: "pass" }, {})).toEqual({ id: "1", name: "Test", email: "test@example.com" });
  });
});
