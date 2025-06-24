"use client";
import * as React from "react";
import Card from '@mui/joy/Card';
import Autocomplete from '@mui/joy/Autocomplete';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Define types for users and OKRs
interface UserOption {
  id: number;
  name: string;
  email: string;
}
interface OkrOption {
  id: number;
  title: string;
  quarter: number;
  year: number;
}

export default function AssignOkrsPage() {
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [okrs, setOkrs] = React.useState<OkrOption[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<UserOption[]>([]);
  const [selectedOkrs, setSelectedOkrs] = React.useState<OkrOption[]>([]);

  React.useEffect(() => {
    // Fetch users
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
    // Fetch OKRs
    fetch('/api/admin/objectives')
      .then(res => res.json())
      .then(setOkrs)
      .catch(() => setOkrs([]));
  }, []);

  const [assignStatus, setAssignStatus] = React.useState<string | null>(null);
  const handleAssign = async () => {
    setAssignStatus(null);
    try {
      const res = await fetch('/api/admin/assign-okrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers.map(u => u.id),
          okrIds: selectedOkrs.map(o => o.id),
        }),
      });
      if (res.ok) {
        setAssignStatus('OKRs assigned successfully!');
        setSelectedUsers([]);
        setSelectedOkrs([]);
      } else {
        setAssignStatus('Failed to assign OKRs.');
      }
    } catch {
      setAssignStatus('Failed to assign OKRs.');
    }
  };

  return (
    <main className="max-w-3xl mx-auto mt-10 p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/admin"
          className="flex items-center text-gray-700 hover:text-black font-medium text-base mr-4"
        >
          <ArrowBackIcon sx={{ fontSize: 20, mr: 1 }} />
          Back to Admin
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-center w-full mb-4">Assign OKRs to User</h1>
      <div className="flex justify-center w-full">
        <Card variant="outlined" sx={{ width: 500, maxWidth: '95vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography level="body-md" className="mb-2">Search and select users</Typography>
          <Autocomplete
            multiple
            options={users}
            getOptionLabel={(u: UserOption) => u.name ? `${u.name} (${u.email})` : u.email}
            value={selectedUsers}
            onChange={(_, val) => setSelectedUsers(val as UserOption[])}
            placeholder="Type name or email..."
            sx={{ width: '100%', mb: 3 }}
          />
          <Typography level="body-md" className="mb-2">Select OKRs to assign</Typography>
          <Autocomplete
            multiple
            options={okrs}
            getOptionLabel={(o: OkrOption) => `${o.title} (Q${o.quarter} ${o.year})`}
            value={selectedOkrs}
            onChange={(_, val) => setSelectedOkrs(val as OkrOption[])}
            placeholder="Type to search OKRs..."
            sx={{ width: '100%', mb: 3 }}
          />
          <Button
            variant="solid"
            color="primary"
            disabled={selectedUsers.length === 0 || selectedOkrs.length === 0}
            sx={{ mt: 2, width: '100%' }}
            onClick={handleAssign}
          >
            Assign Selected OKRs
          </Button>
          {assignStatus && (
            <Typography color={assignStatus.includes('success') ? 'success' : 'danger'} sx={{ mt: 2 }}>
              {assignStatus}
            </Typography>
          )}
        </Card>
      </div>
    </main>
  );
}
