"use client";
import * as React from "react";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Table from "@mui/joy/Table";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect } from "react";

export interface Admin {
  id: number;
  email: string;
  name: string;
}

export default function ManageAdmins({ initialAdmins }: { initialAdmins: Admin[] }) {
  const [admins, setAdmins] = React.useState<Admin[]>(initialAdmins);
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [editId, setEditId] = React.useState<number | null>(null);
  const [editEmail, setEditEmail] = React.useState("");
  const [editName, setEditName] = React.useState("");
  const [currentUserEmail, setCurrentUserEmail] = React.useState("");

  useEffect(() => {
    // Fetch current user email from /api/auth/me or similar endpoint
    fetch("/api/auth/me").then(async res => {
      if (res.ok) {
        const data = await res.json();
        setCurrentUserEmail(data.email);
      }
    });
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) {
      const data = await res.json();
      setAdmins([...admins, data]);
      setEmail("");
      setName("");
      setSuccess("Admin added successfully");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to add admin");
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditId(admin.id);
    setEditEmail(admin.email);
    setEditName(admin.name);
  };

  const handleEditSave = async (id: number) => {
    setError("");
    setSuccess("");
    const res = await fetch("/api/admin/edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, email: editEmail, name: editName }),
    });
    if (res.ok) {
      const data = await res.json();
      setAdmins(admins.map(a => a.id === id ? data : a));
      setEditId(null);
      setSuccess("Admin updated successfully");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to update admin");
    }
  };

  const handleEditCancel = () => {
    setEditId(null);
  };

  const handleDelete = async (id: number, email: string) => {
    setError("");
    setSuccess("");
    if (email === currentUserEmail) {
      setError("You cannot delete your own admin account.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
      return;
    }
    const res = await fetch("/api/admin/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setAdmins(admins.filter(a => a.id !== id));
      setSuccess("Admin deleted successfully");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to delete admin");
    }
  };

  if (!currentUserEmail) {
    return null;
  }

  return (
    <Sheet sx={{ mt: 4, p: 3, borderRadius: "md", boxShadow: "lg" }}>
      <Typography level="h3" sx={{ mb: 2 }}>Manage Admins</Typography>
      <form onSubmit={handleAddAdmin} className="flex gap-2 mb-4">
        <Input
          placeholder="Admin Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
        <Button type="submit" color="primary">Add Admin</Button>
      </form>
      {error && <Typography color="danger" sx={{ mb: 2 }}>{error}</Typography>}
      {success && <Typography color="success" sx={{ mb: 2 }}>{success}</Typography>}
      <Table sx={{ mt: 2 }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td>
                {editId === admin.id ? (
                  <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} size="sm" />
                ) : (
                  admin.email
                )}
              </td>
              <td>
                {editId === admin.id ? (
                  <Input value={editName} onChange={e => setEditName(e.target.value)} size="sm" />
                ) : (
                  admin.name
                )}
              </td>
              <td>
                {editId === admin.id ? (
                  <>
                    <IconButton aria-label="Save" onClick={() => handleEditSave(admin.id)} color="success" size="sm"><SaveIcon /></IconButton>
                    <IconButton aria-label="Cancel" onClick={handleEditCancel} color="neutral" size="sm"><CancelIcon /></IconButton>
                  </>
                ) : (
                  <>
                    <IconButton aria-label="Edit" onClick={() => handleEdit(admin)} color="primary" size="sm"><EditIcon /></IconButton>
                    <IconButton aria-label="Delete" onClick={() => handleDelete(admin.id, admin.email)} color="danger" size="sm" disabled={admin.email === currentUserEmail}><DeleteIcon /></IconButton>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  );
}
