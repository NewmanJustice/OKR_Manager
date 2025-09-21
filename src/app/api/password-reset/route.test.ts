import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/password-reset/route';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  passwordResetToken: {
    create: jest.fn(),
  },
};
const mockSendPasswordResetEmail = jest.fn();

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));
jest.mock('@/utils/sendPasswordRestRequest', () => ({
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/password-reset', () => {
  it('returns 400 if email is missing', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData()).error).toBe('Email required.');
  });

  it('returns 200 and does not create token if user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const { req, res } = createMocks({ method: 'POST', body: { email: 'notfound@example.com' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData()).message).toMatch(/you will receive a reset link/);
    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('creates token and sends email if user found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, name: 'Test User', email: 'test@example.com' });
    mockPrisma.passwordResetToken.create.mockResolvedValue({});
    const { req, res } = createMocks({ method: 'POST', body: { email: 'test@example.com' } });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(200);
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(expect.objectContaining({ email: 'test@example.com' }));
  });

  it('returns 405 for non-POST methods', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });
});
