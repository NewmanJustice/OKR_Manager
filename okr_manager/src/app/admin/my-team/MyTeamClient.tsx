"use client";
import * as React from "react";
import Autocomplete from "@mui/joy/Autocomplete";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import Table from "@mui/joy/Table";

export default function MyTeamClient() {
  const [team, setTeam] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<string>("");

  React.useEffect(() => {
    fetch("/api/admin/my-team", { credentials: "include" }).then(async res => {
      if (res.ok) setTeam(await res.json());
      setLoading(false);
    });
    fetch("/api/admin/users", { credentials: "include" }).then(async res => {
      if (res.ok) setUsers(await res.json());
    });
  }, []);

  const handleAdd = async () => {
    if (!selectedUser) return;
    setStatus("");
    const res = await fetch("/api/admin/my-team/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUser.id }),
      credentials: "include"
    });
    if (res.ok) {
      setTeam([...team, selectedUser]);
      setSelectedUser(null); // Clear selection after adding
      setStatus("User added to your team.");
    } else {
      const data = await res.json();
      setStatus(data.error || "Failed to add user.");
    }
  };

  const handleRemove = async (userId: number) => {
    setStatus("");
    const res = await fetch("/api/admin/my-team/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
      credentials: "include"
    });
    if (res.ok) {
      setTeam(team.filter(u => u.id !== userId));
      setStatus("User removed from your team.");
    } else {
      const data = await res.json();
      setStatus(data.error || "Failed to remove user.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Card variant="outlined" sx={{ width: 500, maxWidth: '95vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography level="h4" className="mb-2">Add User to Team</Typography>
        <Autocomplete
          options={users.filter(u => !team.some(t => t.id === u.id))}
          getOptionLabel={option => option.name + ' (' + option.email + ')'}
          value={selectedUser}
          onChange={(_, value) => setSelectedUser(value)}
          slotProps={{ input: { placeholder: "Search users..." } }}
          sx={{ width: '100%', mb: 2 }}
        />
        <Button onClick={handleAdd} disabled={!selectedUser}>Add to Team</Button>
        {status && <Typography color={status.includes('Failed') ? 'danger' : 'success'} sx={{ mt: 2 }}>{status}</Typography>}
      </Card>
      <Card variant="outlined" sx={{ width: 700, maxWidth: '98vw', p: 4, boxShadow: 'sm', background: 'white' }}>
        <Typography level="h4" className="mb-2">Current Team Members</Typography>
        {loading ? <div>Loading...</div> : (
          <Table variant="outlined" sx={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.roleName || user.role?.name || ''}</td>
                  <td>
                    <Button color="danger" size="sm" onClick={() => handleRemove(user.id)}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
