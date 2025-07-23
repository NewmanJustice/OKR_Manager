// IMPORTANT: For Prisma mocking to work, ensure your jest.config.js includes:
// moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
// This allows '@/lib/prisma' to resolve correctly in both code and tests.
// If you change the import path in your API route, update this mapping accordingly.

(global as any).Request = class Request {
  _json?: any;
  constructor(public url: string) {}
  async json() { return this._json || {}; }
};

var mockPrisma = {
  verificationToken: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

var mockSendVerificationEmail = jest.fn();
var mockRateLimit = jest.fn(() => true);
var mockJson = jest.fn((...args: any[]) => {
  const [body, opts] = args;
  return { status: opts?.status, json: async () => body };
});

jest.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
jest.mock("@/utils/sendVerificationEmail", () => ({ sendVerificationEmail: mockSendVerificationEmail }));
jest.mock("@/app/api/_middleware/rateLimit", () => ({ rateLimit: mockRateLimit }));
jest.mock("next/server", () => ({
  NextResponse: class {
    static json(...args: any[]) {
      return mockJson(...args);
    }
  }
}));

import { POST } from "./route";

describe("POST /api/verify/resend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRateLimit.mockReturnValue(true);
  });

  it("blocks requests if rate limited", async () => {
    mockRateLimit.mockReturnValue(false);
    const req = new Request("https://test.com/api/verify/resend");
    req._json = { token: "abc" };
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ message: expect.stringContaining("Too many requests") });
  });

  it("returns 400 if token is missing", async () => {
    const req = new Request("https://test.com/api/verify/resend");
    req._json = {};
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Invalid request." });
  });

  it("returns 404 if token not found", async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue(null);
    const req = new Request("https://test.com/api/verify/resend");
    req._json = { token: "abc" };
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: "Verification token not found." });
  });

  it("returns 404 if user not found", async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue({ token: "abc", userId: 1 });
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req = new Request("https://test.com/api/verify/resend");
    req._json = { token: "abc" };
    const res = await POST(req);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ message: "User not found." });
  });

  it("resends verification email and creates new token", async () => {
    mockPrisma.verificationToken.findUnique.mockResolvedValue({ token: "abc", userId: 1 });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: "Test", email: "test@example.com" });
    mockPrisma.verificationToken.delete.mockResolvedValue({});
    mockPrisma.verificationToken.create.mockResolvedValue({});
    const req = new Request("https://test.com/api/verify/resend");
    req._json = { token: "abc" };
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ message: expect.stringContaining("Verification email resent") });
    expect(mockPrisma.verificationToken.delete).toHaveBeenCalledWith({ where: { token: "abc" } });
    expect(mockPrisma.verificationToken.create).toHaveBeenCalled();
    expect(mockSendVerificationEmail).toHaveBeenCalledWith("Test", "test@example.com", expect.any(String));
  });
});
