// Mock PrismaClient so all instances share the same mock for update/delete
const mockObjectiveUD = {
  update: jest.fn(),
  delete: jest.fn(),
};
const mockKeyResultUD = {
  deleteMany: jest.fn(),
};
const PrismaClientMockUD = jest.fn(() => ({ objective: mockObjectiveUD, keyResult: mockKeyResultUD }));
jest.mock('@prisma/client', () => ({ PrismaClient: PrismaClientMockUD }));

const mockSessionUD = { id: 1, email: 'admin@example.com', role: 'ADMIN' };
jest.mock('../../../../../utils/session', () => ({
  getSessionUserFromCookies: jest.fn(() => mockSessionUD),
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

import { PUT, DELETE } from '../[id]/route';

describe('Objectives API Update/Delete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockObjectiveUD.update.mockReset();
    mockObjectiveUD.delete.mockReset();
    mockKeyResultUD.deleteMany.mockReset();
  });

  it('updates an objective', async () => {
    mockObjectiveUD.update.mockResolvedValue({
      id: 1,
      title: 'Updated',
      description: 'Updated Desc',
      quarter: 2,
      year: 2025,
      key_results: [],
    } as Record<string, unknown>);
    const req = new Request('http://localhost/api/admin/objectives/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Updated',
        description: 'Updated Desc',
        quarter: 2,
        year: 2025,
        keyResults: [],
      }),
    });
    // Call PUT and DELETE with only the req argument, matching the handler signature
    const response = await PUT(req as unknown as import('next/server').NextRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.title).toBe('Updated');
  });

  it('deletes an objective', async () => {
    mockKeyResultUD.deleteMany.mockResolvedValue({});
    mockObjectiveUD.delete.mockResolvedValue({ id: 1 });
    const req = new Request('http://localhost/api/admin/objectives/1', {
      method: 'DELETE',
    });
    // Call PUT and DELETE with only the req argument, matching the handler signature
    const response = await DELETE(req as unknown as import('next/server').NextRequest);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
