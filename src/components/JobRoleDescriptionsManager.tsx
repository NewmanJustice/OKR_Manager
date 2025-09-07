import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Editor as TiptapEditor } from '@tiptap/core';

// Fetch job roles from API
async function fetchJobRoles() {
  const res = await fetch("/api/job-roles");
  if (!res.ok) return [];
  const data = await res.json();
  return data.jobRoles || [];
}

// Fetch descriptions from API
async function fetchDescriptions() {
  const res = await fetch("/api/job-role-descriptions");
  if (!res.ok) return [];
  const data = await res.json();
  return data.descriptions || [];
}

export default function JobRoleDescriptionsManager() {
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ jobRoleId: "", content: "" });

  // Set up Tiptap editor with explicit type
  const editor = useEditor({
    extensions: [StarterKit],
    content: form.content,
    onUpdate: ({ editor }: { editor: TiptapEditor }) => {
      setForm((f) => ({ ...f, content: editor.getHTML() }));
    },
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      setJobRoles(await fetchJobRoles());
      setDescriptions(await fetchDescriptions());
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    // Update editor content when editing
    if (openDialog && editor) {
      editor.commands.setContent(form.content || "");
    }
  }, [openDialog, form.content, editor]);

  const handleOpenDialog = (desc?: any) => {
    if (desc) {
      setEditId(desc.id);
      setForm({ jobRoleId: desc.jobRoleId, content: desc.content });
    } else {
      setEditId(null);
      setForm({ jobRoleId: "", content: "" });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditId(null);
    setForm({ jobRoleId: "", content: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.jobRoleId || !form.content.trim()) return;
    const method = editId ? "PUT" : "POST";
    const body = editId ? { id: editId, content: form.content } : { jobRoleId: form.jobRoleId, content: form.content };
    const res = await fetch("/api/job-role-descriptions", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setDescriptions(await fetchDescriptions());
      handleCloseDialog();
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this description?")) return;
    const res = await fetch("/api/job-role-descriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setDescriptions(await fetchDescriptions());
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">Manage Job Role Descriptions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>Add Description</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Role</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
            ) : descriptions.length === 0 ? (
              <TableRow><TableCell colSpan={3}>No descriptions found.</TableCell></TableRow>
            ) : (
              descriptions.map((desc) => (
                <TableRow key={desc.id}>
                  <TableCell>{desc.jobRole?.name || desc.jobRoleId}</TableCell>
                  <TableCell>{desc.content}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(desc)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(desc.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Description" : "Add Description"}</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Job Role"
            name="jobRoleId"
            value={form.jobRoleId}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!!editId}
          >
            {jobRoles.map((role) => (
              <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
            ))}
          </TextField>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Description
            </Typography>
            {/* Use EditorContent from @tiptap/react for the editor UI */}
            {editor && <EditorContent editor={editor} />}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>{editId ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
