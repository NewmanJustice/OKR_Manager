// Mock PrismaClient so all instances share the same mock
const mockObjective = {
  findFirst: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
};
const PrismaClientMock = jest.fn(() => ({ objective: mockObjective }));
jest.mock('@prisma/client', () => ({ PrismaClient: PrismaClientMock }));

const mockSession = { id: 1, email: 'admin@example.com', role: 'ADMIN' };
jest.mock('../../../../../utils/session', () => ({
  getSessionUserFromCookies: jest.fn(() => mockSession),
}));

jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: (init && init.status) || 200,
      json: async () => data,
    }),
  },
}));

import { POST, GET } from '../route';

describe('Objectives API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjective.findFirst.mockReset();
    mockObjective.create.mockReset();
    mockObjective.findMany.mockReset();
  });

  it('creates an objective and key results', async () => {
    mockObjective.findFirst.mockResolvedValue(null);
    mockObjective.create.mockResolvedValue({
      id: 1,
      title: 'Test Objective',
      description: 'Test Desc',
      quarter: 2,
      year: 2025,
      pdm_id: null,
      created_by_id: 1,
      objective_number: 1,
      key_results: [
        { id: 1, title: 'KR1', description: '', status: 'Not Started', created_by_id: 1 }
      ],
    } as Record<string, unknown>);
    // Use the Web API Request object
    const req = new Request('http://localhost/api/admin/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Objective',
        description: 'Test Desc',
        quarter: 2,
        year: 2025,
        keyResults: [{ title: 'KR1' }],
      }),
    });
    // @ts-expect-error: Web API Request is not NextRequest, but sufficient for test
    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Test Objective');
    expect(data.key_results[0].title).toBe('KR1');
  });

  it('returns objectives (GET)', async () => {
    mockObjective.findMany.mockResolvedValue([
      { id: 1, title: 'Test', description: '', quarter: 2, year: 2025, key_results: [] }
    ] as Array<{ id: number; title: string; description: string; quarter: number; year: number; key_results: { id: number; title: string }[] }>);
    // Use the Web API Request object for GET
    // @ts-expect-error: GET does not require arguments in this test context
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data[0].title).toBe('Test');
  });
});
