import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobRoleDescriptionsManager from '../JobRoleDescriptionsManager';

// Mock fetch for job roles and descriptions
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/job-roles')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ jobRoles: [{ id: '1', name: 'Engineer' }, { id: '2', name: 'Manager' }] })
      });
    }
    if (url.includes('/api/job-role-descriptions')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ descriptions: [{ id: 1, jobRoleId: '1', jobRole: { name: 'Engineer' }, content: '<p>Engineer role</p>' }] })
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('JobRoleDescriptionsManager', () => {
  it('renders job role descriptions table', async () => {
    render(<JobRoleDescriptionsManager />);
    expect(screen.getByText(/Manage Job Role Descriptions/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());
    expect(screen.getByText('Engineer role')).toBeInTheDocument();
  });

  it('opens dialog and allows adding a description', async () => {
    render(<JobRoleDescriptionsManager />);
    fireEvent.click(screen.getByText(/Add Description/i));
    await waitFor(() => expect(screen.getByLabelText(/Job Role/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Job Role/i), { target: { value: '2' } });
    // Simulate rich text input
    // For tiptap, you may need to simulate editor commands or set HTML directly
    // Here, we just check the dialog and button
    expect(screen.getByText(/Create/i)).toBeInTheDocument();
  });

  it('shows loading and empty states', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ jobRoles: [] }) }));
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ descriptions: [] }) }));
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByText(/No descriptions found/i)).toBeInTheDocument());
  });

  it('allows editing and deleting a description', async () => {
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByText('Engineer')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit'));
    await waitFor(() => expect(screen.getByText(/Update/i)).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Delete'));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      '/api/job-role-descriptions',
      expect.objectContaining({ method: 'DELETE' })
    ));
  });
});
