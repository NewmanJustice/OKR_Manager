import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LineManagerObjectivesCard from '../LineManagerObjectivesCard';

// Mock fetch
const mockObjectives = [
  {
    id: 1,
    title: 'Objective 1',
    description: 'Description 1',
    keyResults: [
      {
        id: 11,
        title: 'KR 1',
        metric: 'Sales',
        targetValue: 100,
        successCriteria: [
          { id: 111, description: 'Criteria 1', threshold: 90 },
        ],
      },
    ],
  },
];

global.fetch = jest.fn((url) => {
  if (url === '/api/objectives/line-manager') {
    const body = JSON.stringify({
      lineManagerName: 'Jane Doe',
      objectives: mockObjectives,
    });
    return Promise.resolve(new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }));
  }
  return Promise.reject('Unknown endpoint');
});

describe('LineManagerObjectivesCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders card and line manager name', async () => {
    render(<LineManagerObjectivesCard />);
    expect(screen.getByText(/Line Manager's Objectives|Jane Doe's Objectives/)).toBeInTheDocument();
  });

  it('shows loading spinner when toggled open', async () => {
    render(<LineManagerObjectivesCard />);
    fireEvent.click(screen.getByLabelText('Show'));
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Objective 1')).toBeInTheDocument());
  });

  it('displays objectives and key results', async () => {
    render(<LineManagerObjectivesCard />);
    fireEvent.click(screen.getByLabelText('Show'));
    await waitFor(() => {
      expect(screen.getByText('Objective 1')).toBeInTheDocument();
      expect(screen.getByText('KR 1')).toBeInTheDocument();
      expect(screen.getByText(/Criteria 1/)).toBeInTheDocument();
    });
  });

  it('handles no objectives', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ lineManagerName: 'Jane Doe', objectives: [] }),
    }));
    render(<LineManagerObjectivesCard />);
    fireEvent.click(screen.getByLabelText('Show'));
    await waitFor(() => {
      expect(screen.getByText(/No objectives found/)).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Fetch error' }),
    }));
    render(<LineManagerObjectivesCard />);
    fireEvent.click(screen.getByLabelText('Show'));
    await waitFor(() => {
      expect(screen.getByText('Fetch error')).toBeInTheDocument();
    });
  });
});
