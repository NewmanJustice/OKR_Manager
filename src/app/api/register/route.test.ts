// Polyfill for Request in Jest/node
(global as any).Request = class Request {
  constructor(public input: any, public init?: any) {}
  headers = {
    get: () => null,
  };
  json = async () => ({ });
};

let mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  verificationToken: {
    create: jest.fn(),
  },
};

jest.mock("@/utils/sendVerificationEmail", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../_middleware/rateLimit", () => ({
  rateLimit: jest.fn(() => true),
}));
jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => Promise.resolve("hashed")),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Import POST after polyfills and mocks
import { POST } from "./route";

// Helper to mock fetch Response
function mockFetchResponse(jsonData: any) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(jsonData),
    headers: new Map(),
    redirected: false,
    statusText: "OK",
    type: "default",
    url: "",
    clone: () => ({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
    text: async () => "",
  } as unknown as Response);
}

global.fetch = jest.fn((url, opts) => {
  if (url === "https://hcaptcha.com/siteverify") {
    return mockFetchResponse({ success: true });
  }
  return mockFetchResponse({});
});

describe("POST /api/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require("../_middleware/rateLimit").rateLimit.mockReturnValue(true);
  });

  it("blocks requests if rate limited", async () => {
    require("../_middleware/rateLimit").rateLimit.mockReturnValue(false);
    const req = { json: () => Promise.resolve({}) } as any;
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ message: expect.stringContaining("Too many registration attempts") });
  });

  it("fails if captcha is invalid", async () => {
    global.fetch = jest.fn(() => mockFetchResponse({ success: false }));
    const req = { json: () => Promise.resolve({ name: "A", email: "a@b.com", password: "Abc123!@#", role: "user", captchaToken: "bad" }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "CAPTCHA validation failed." });
  });

  it("fails if required fields are missing", async () => {
    const req = { json: () => Promise.resolve({ email: "a@b.com", password: "Abc123!@#", role: "user" }) } as any; // no captchaToken
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "All fields are required." });
  });

  it("fails if email is invalid", async () => {
    const req = { json: () => Promise.resolve({ name: "A", email: "bad", password: "Abc123!@#", role: "user", captchaToken: "good" }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Invalid email address." });
  });

  it("fails if password is weak", async () => {
    const req = { json: () => Promise.resolve({ name: "A", email: "a@b.com", password: "abc", role: "user", captchaToken: "good" }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: expect.stringContaining("Password must be at least 8 characters") });
  });

  it("fails if email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 1,
      name: "A",
      email: "a@b.com",
      password: "hashed",
      role: "user",
      // add any other required fields from your User model
    });
    const req = { json: () => Promise.resolve({ name: "A", email: "a@b.com", password: "Abc123!@#", role: "user", captchaToken: "good" }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ message: "Email already registered." });
  });

  it("registers user and sends email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 1, name: "A", email: "a@b.com" });
    mockPrisma.verificationToken.create.mockResolvedValue({});
    const req = { json: () => Promise.resolve({ name: "A", email: "a@b.com", password: "Abc123!@#", role: "user", captchaToken: "good" }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ message: expect.stringContaining("Registration successful") });
    expect(require("@/utils/sendVerificationEmail").sendVerificationEmail).toHaveBeenCalled();
  });
});
