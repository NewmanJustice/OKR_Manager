import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamAssignCard from '../TeamAssignCard';

describe('TeamAssignCard', () => {
  it('renders search input and assign button', () => {
    render(<TeamAssignCard />);
    expect(screen.getByLabelText(/Search active users/i)).toBeInTheDocument();
    expect(screen.getByText(/Assign to My Team/i)).toBeInTheDocument();
  });
  // Add more tests for assign/remove and error states as needed
});
