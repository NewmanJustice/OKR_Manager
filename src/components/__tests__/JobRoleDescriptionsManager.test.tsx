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

describe("JobRoleDescriptionsManager", () => {
  it("renders job roles and descriptions list", async () => {
    render(<JobRoleDescriptionsManager />);
    expect(await screen.findByText(/Add Job Role Description/i)).toBeInTheDocument();
    expect(await screen.findByText(/Manager/i)).toBeInTheDocument();
    expect(await screen.findByText(/Developer/i)).toBeInTheDocument();
    expect(await screen.findByText(/First description/i)).toBeInTheDocument();
    expect(await screen.findByText(/Second description/i)).toBeInTheDocument();
  });

  it("can add a new description", async () => {
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByLabelText(/Job Role/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Job Role/i), { target: { value: "1" } });
    fireEvent.input(screen.getByRole("textbox"), { target: { innerHTML: "<p>New description</p>" } });
    fireEvent.click(screen.getByText(/Add Description/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("job-role-descriptions"), expect.objectContaining({ method: "POST" })));
  });

  it("can edit a description and update", async () => {
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByText(/Manager/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByLabelText(/Edit/i)[0]);
    await waitFor(() => expect(screen.getByText(/Update Description/i)).toBeInTheDocument());
    fireEvent.input(screen.getByRole("textbox"), { target: { innerHTML: "<p>Updated description</p>" } });
    fireEvent.click(screen.getByText(/Update Description/i));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("job-role-descriptions"), expect.objectContaining({ method: "PUT" })));
  });

  it("can delete a description", async () => {
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByText(/Manager/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByLabelText(/Delete/i)[0]);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("job-role-descriptions"), expect.objectContaining({ method: "DELETE" })));
  });

  it("shows only preview in list and full description on row click", async () => {
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByText(/First description/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole("row")[1]); // First data row
    expect(await screen.findByText(/Full Description/i)).toBeInTheDocument();
    expect(screen.getByText(/First description for manager./i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Close/i));
    expect(screen.queryByText(/Full Description/i)).not.toBeInTheDocument();
  });

  it("can cancel edit", async () => {
    render(<JobRoleDescriptionsManager />);
    await waitFor(() => expect(screen.getByText(/Manager/i)).toBeInTheDocument());
    fireEvent.click(screen.getAllByLabelText(/Edit/i)[0]);
    await waitFor(() => expect(screen.getByText(/Cancel Edit/i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Cancel Edit/i));
    expect(screen.queryByText(/Update Description/i)).not.toBeInTheDocument();
  });
});
