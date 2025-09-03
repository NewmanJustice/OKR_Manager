// If you haven't already, install node-mocks-http with:
// npm install node-mocks-http --save-dev
import { createMocks } from 'node-mocks-http';
import { GET } from './route';

describe('/api/objectives/line-manager', () => {
  it('returns objectives and line manager name', async () => {
    const req = createMocks({ method: 'GET' }).req;
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.lineManagerName).toBeDefined();
    expect(Array.isArray(data.objectives)).toBe(true);
  });

  it('handles missing line manager', async () => {
    // Simulate missing line manager in DB
    // You may need to mock your DB call here
    // For example:
    // jest.spyOn(db, 'getLineManager').mockResolvedValueOnce(null);
    const req = createMocks({ method: 'GET' }).req;
    const res = await GET(req);
    const data = await res.json();
    // Expect error or empty objectives
    expect(data.lineManagerName).toBeNull();
    expect(Array.isArray(data.objectives)).toBe(true);
  });

  it('handles unauthorized', async () => {
    // Simulate missing session/user
    const req = createMocks({ method: 'GET' }).req;
    // You may need to mock getServerSession to return null
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized');
  });
});
