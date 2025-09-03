import { render, screen } from '@testing-library/react';
import MyTeamPage from '../page';
import { useSession } from 'next-auth/react';
jest.mock('next-auth/react');

describe('MyTeamPage', () => {
  it('shows loading spinner', () => {
    useSession.mockReturnValue({ status: 'loading' });
    render(<MyTeamPage />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  it('shows access denied for non-line managers', () => {
    useSession.mockReturnValue({ status: 'authenticated', data: { user: { isLineManager: false } } });
    render(<MyTeamPage />);
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
  });
  it('renders main UI for line managers', () => {
    useSession.mockReturnValue({ status: 'authenticated', data: { user: { isLineManager: true } } });
    render(<MyTeamPage />);
    expect(screen.getByText(/My Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Manage Team Members/i)).toBeInTheDocument();
  });
});
