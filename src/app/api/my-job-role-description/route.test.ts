import { createMocks } from "node-mocks-http";
import { GET } from "../../app/api/my-job-role-description/route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    lineManagerTeam: {
      findFirst: jest.fn()
    },
    jobRoleDescription: {
      findFirst: jest.fn()
    }
  }
}));

const prisma = require("@/lib/prisma").prisma;

describe("GET /api/my-job-role-description", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns 401 if not authenticated", async () => {
    // Mock getServerSession to return null
    jest.mock("next-auth", () => ({ getServerSession: jest.fn(() => null) }));
    const req = createMocks({ method: "GET" }).req;
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns null if no line manager found", async () => {
    jest.mock("next-auth", () => ({ getServerSession: jest.fn(() => ({ user: { id: 1, jobRoleId: 2 } })) }));
    prisma.lineManagerTeam.findFirst.mockResolvedValue(null);
    const req = createMocks({ method: "GET" }).req;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.description).toBeNull();
  });

  it("returns null if no job role description found", async () => {
    jest.mock("next-auth", () => ({ getServerSession: jest.fn(() => ({ user: { id: 1, jobRoleId: 2 } })) }));
    prisma.lineManagerTeam.findFirst.mockResolvedValue({ lineManagerId: 99 });
    prisma.jobRoleDescription.findFirst.mockResolvedValue(null);
    const req = createMocks({ method: "GET" }).req;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.description).toBeNull();
  });

  it("returns job role description if found", async () => {
    jest.mock("next-auth", () => ({ getServerSession: jest.fn(() => ({ user: { id: 1, jobRoleId: 2 } })) }));
    prisma.lineManagerTeam.findFirst.mockResolvedValue({ lineManagerId: 99 });
    prisma.jobRoleDescription.findFirst.mockResolvedValue({ id: 1, jobRoleId: 2, managerId: 99, content: "desc", jobRole: { name: "Engineer" } });
    const req = createMocks({ method: "GET" }).req;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.description).toBeDefined();
    expect(data.description.content).toBe("desc");
    expect(data.description.jobRole.name).toBe("Engineer");
  });
});
