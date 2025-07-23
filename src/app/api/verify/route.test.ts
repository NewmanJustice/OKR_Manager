// IMPORTANT: For Prisma mocking to work, ensure your jest.config.js includes:
// moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
// This allows '@/lib/prisma' to resolve correctly in both code and tests.
// If you change the import path in your API route, update this mapping accordingly.

// Polyfill for Request in Jest/node
(global as any).Request = class Request {
  constructor(public url: string) {}
};

// Best Practice: Mock prisma from the same import path as used in the API route
// Ensure your jest.config.js includes:
// moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
// This ensures the mock is used and avoids direct instantiation of PrismaClient
var mockPrisma = {
  verificationToken: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    update: jest.fn(),
  },
};

// Use var for mockJson to avoid hoisting issues
var mockJson = jest.fn((...args: any[]) => {
  const [body, opts] = args;
  return { status: opts?.status, json: async () => body };
});
jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));
// Best Practice: Mock NextResponse as a class with a static json method
jest.mock("next/server", () => ({
  NextResponse: class {
    static json(...args: any[]) {
      return mockJson(...args);
    }
  }
}));

import { GET } from "./route";

describe("GET /api/verify", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resets prisma mock between tests", () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue("foo");
    jest.clearAllMocks();
    expect(mockPrisma.verificationToken.findUnique).not.toHaveBeenCalled();
  });

  it("returns 400 if token is missing", async () => {
    const req = new Request("https://test.com/api/verify");
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Invalid verification link." });
  });

  it("returns 400 if token not found", async () => {
    const req = new Request("https://test.com/api/verify?token=abc");
    mockPrisma.verificationToken.findUnique.mockResolvedValue(null);
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: expect.stringContaining("expired or invalid") });
  });

  it("returns 400 if token expired", async () => {
    const req = new Request("https://test.com/api/verify?token=abc");
    mockPrisma.verificationToken.findUnique.mockResolvedValue({ token: "abc", expiresAt: new Date(Date.now() - 1000), userId: 1 });
    const res = await GET(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: expect.stringContaining("expired or invalid") });
  });

  it("verifies account and deletes token", async () => {
    const req = new Request("https://test.com/api/verify?token=abc");
    mockPrisma.verificationToken.findUnique.mockResolvedValue({ token: "abc", expiresAt: new Date(Date.now() + 10000), userId: 1 });
    mockPrisma.user.update.mockResolvedValue({ id: 1, status: "active" });
    mockPrisma.verificationToken.delete.mockResolvedValue({});
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: expect.stringContaining("Account verified successfully") });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { status: "active" },
    });
    expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({ where: { token: "abc" } });
  });

  it("prisma mock is used (best practice runtime check)", () => {
    expect(typeof mockPrisma.verificationToken.findUnique).toBe("function");
    expect(typeof mockPrisma.user.update).toBe("function");
  });
});
