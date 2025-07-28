import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/authOptions';

jest.mock('next-auth');
jest.mock('@/lib/prisma');

const mockSession = {
  user: { email: 'test@example.com' }
};

describe('Objective API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });
    (prisma.objective.create as jest.Mock).mockResolvedValue({ id: 123 });
  });

  it('returns 401 if not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const req = { json: async () => ({}) } as any;
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 if required fields are missing', async () => {
    const req = { json: async () => ({ title: '', dueDate: '', keyResults: [] }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    const req = { json: async () => ({ title: 'Obj', dueDate: '2025-12-31', keyResults: [{ title: 'KR', metric: 'M', targetValue: 'T', successCriteria: [{ description: 'SC', threshold: 'TH' }] }] }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it('creates objective and returns id', async () => {
    const req = { json: async () => ({ title: 'Obj', dueDate: '2025-12-31', keyResults: [{ title: 'KR', metric: 'M', targetValue: 'T', successCriteria: [{ description: 'SC', threshold: 'TH' }] }] }) } as any;
    const res = await POST(req);
    expect(prisma.objective.create).toHaveBeenCalled();
    expect(res.status).toBeUndefined(); // NextResponse.json does not set status for success
    const json = await res.json();
    expect(json.id).toBe(123);
  });

  it('validates nested key results and success criteria', async () => {
    const req = { json: async () => ({ title: 'Obj', dueDate: '2025-12-31', keyResults: [{ title: '', metric: '', targetValue: '', successCriteria: [] }] }) } as any;
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
