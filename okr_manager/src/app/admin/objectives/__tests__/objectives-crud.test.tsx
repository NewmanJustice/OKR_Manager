import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ObjectivesClient from '../ObjectivesClient';

const testObjective = {
  id: 1,
  title: 'Test Objective',
  description: 'Test Desc',
  quarter: 2,
  year: 2025,
  keyResults: [{ id: 1, text: 'KR1', description: '', status: 'Not Started', created_by_id: 1 }],
};

// Helper to set fetch mock for GET
function mockGetObjectives(objectives: any[]) {
  (global.fetch as jest.Mock).mockImplementation((url, options) => {
    if (url === '/api/admin/objectives' && (!options || options.method === 'GET')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(objectives) });
    }
    if (url === '/api/admin/objectives' && options.method === 'POST') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(testObjective) });
    }
    if (url === '/api/admin/objectives/1' && options.method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ ...testObjective, title: 'Updated Objective', keyResults: [{ ...testObjective.keyResults[0], text: 'KR1 updated' }] }) });
    }
    if (url === '/api/admin/objectives/1' && options.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
  });
}

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Objectives CRUD UI', () => {
  it('can create an objective and key result', async () => {
    mockGetObjectives([]); // No objectives initially
    render(<ObjectivesClient />);
    await waitFor(() => expect(screen.getByText('Objectives')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Objective' } });
    fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Test Desc' } });
    fireEvent.change(screen.getByPlaceholderText('Quarter (e.g. 2)'), { target: { value: '2' } });
    fireEvent.change(screen.getByPlaceholderText('Year (e.g. 2025)'), { target: { value: '2025' } });
    fireEvent.change(screen.getByPlaceholderText('Key Result 1'), { target: { value: 'KR1' } });
    fireEvent.click(screen.getByText('Create Objective'));
    await waitFor(() => expect(screen.getByText('Test Objective')).toBeInTheDocument());
    expect(screen.getByText('KR1')).toBeInTheDocument();
  });

  it('can update an objective and key result', async () => {
    mockGetObjectives([testObjective]); // Pre-existing objective
    render(<ObjectivesClient />);
    await waitFor(() => expect(screen.getByText('Objectives')).toBeInTheDocument());
    fireEvent.click(await screen.findByText('Edit'));
    // Use getAllByPlaceholderText to avoid ambiguity
    const titleInputs = screen.getAllByPlaceholderText('Title');
    const editTitleInput = titleInputs.find(input => (input as HTMLInputElement).value === 'Test Objective') as HTMLInputElement;
    fireEvent.change(editTitleInput, { target: { value: 'Updated Objective' } });
    const descInputs = screen.getAllByPlaceholderText('Description');
    const editDescInput = descInputs.find(input => (input as HTMLInputElement).value === 'Test Desc') as HTMLInputElement;
    fireEvent.change(editDescInput, { target: { value: 'Updated Desc' } });
    // Disambiguate key result input
    const krInputs = screen.getAllByPlaceholderText('Key Result 1');
    const editKRInput = krInputs.find(input => (input as HTMLInputElement).value === 'KR1') as HTMLInputElement;
    fireEvent.change(editKRInput, { target: { value: 'KR1 updated' } });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(screen.getByText('Updated Objective')).toBeInTheDocument());
    expect(screen.getByText('KR1 updated')).toBeInTheDocument();
  });

  it('can delete an objective', async () => {
    mockGetObjectives([testObjective]); // Pre-existing objective
    render(<ObjectivesClient />);
    await waitFor(() => expect(screen.getByText('Objectives')).toBeInTheDocument());
    fireEvent.click(await screen.findByText('Delete'));
    // After deletion, objective should not be in the document
    await waitFor(() => expect(screen.queryByText('Test Objective')).not.toBeInTheDocument());
  });
});
