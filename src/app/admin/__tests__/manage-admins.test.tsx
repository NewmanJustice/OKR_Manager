import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageAdmins from '../manage-admins';

const mockAdmins = [
	{ id: 1, email: 'admin1@email.com', name: 'Admin One' },
	{ id: 2, email: 'admin2@email.com', name: 'Admin Two' },
];

global.fetch = jest.fn((url) => {
	if (url === '/api/auth/me') {
		return Promise.resolve({ ok: true, json: () => Promise.resolve({ email: 'admin1@email.com' }) });
	}
	if (url === '/api/admin/add') {
		return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 3, email: 'admin3@email.com', name: 'Admin Three' }) });
	}
	if (url === '/api/admin/edit') {
		return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1, email: 'admin1@email.com', name: 'Admin One Edited' }) });
	}
	if (url === '/api/admin/delete') {
		return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
	}
	return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Error' }) });
}) as jest.Mock;

describe('ManageAdmins', () => {
	it('renders admin list', async () => {
		render(<ManageAdmins initialAdmins={mockAdmins} />);
		expect(await screen.findByText('Admin One')).toBeInTheDocument();
		expect(await screen.findByText('Admin Two')).toBeInTheDocument();
	});

	it('adds a new admin', async () => {
		render(<ManageAdmins initialAdmins={mockAdmins} />);
		await screen.findByText('Admin One'); // Wait for UI
		fireEvent.change(screen.getByPlaceholderText('Admin Email'), { target: { value: 'admin3@email.com' } });
		fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Admin Three' } });
		fireEvent.click(screen.getByText('Add Admin'));
		expect(await screen.findByText('Admin Three')).toBeInTheDocument();
	});

	it('edits an admin', async () => {
		render(<ManageAdmins initialAdmins={mockAdmins} />);
		await screen.findByText('Admin One'); // Wait for UI
		fireEvent.click(screen.getAllByLabelText('Edit')[0]);
		fireEvent.change(screen.getAllByDisplayValue('Admin One')[0], { target: { value: 'Admin One Edited' } });
		fireEvent.click(screen.getAllByLabelText('Save')[0]);
		expect(await screen.findByDisplayValue('Admin One Edited')).toBeInTheDocument();
	});

	it('prevents self-deletion', async () => {
		render(<ManageAdmins initialAdmins={mockAdmins} />);
		await screen.findByText('Admin One'); // Wait for UI
		const deleteButton = screen.getAllByLabelText('Delete')[0];
		expect(deleteButton).toBeDisabled();
	});

	it('deletes another admin with confirmation', async () => {
		window.confirm = jest.fn(() => true);
		render(<ManageAdmins initialAdmins={mockAdmins} />);
		await screen.findByText('Admin One'); // Wait for UI
		const deleteButton = screen.getAllByLabelText('Delete')[1];
		fireEvent.click(deleteButton);
		await waitFor(() => expect(screen.queryByText('Admin Two')).not.toBeInTheDocument());
	});
});
