import { createMocks } from 'node-mocks-http';
import { GET as listHandler } from '../list/route';
import { POST as assignHandler } from '../assign/route';
import { DELETE as removeHandler } from '../remove/route';

describe('My Team API', () => {
  it('should deny access to non-line managers (list)', async () => {
    const req = createMocks().req;
    const res = await listHandler(req);
    expect(res.status).toBe(401);
  });
  // Add more tests for assign and remove endpoints as needed
});
