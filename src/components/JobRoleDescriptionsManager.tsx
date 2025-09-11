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
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Editor as TiptapEditor } from '@tiptap/core';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EditIcon from '@mui/icons-material/Edit';
import { TextAlign } from '@tiptap/extension-text-align';
import Heading from '@tiptap/extension-heading';
import Blockquote from '@tiptap/extension-blockquote';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Paragraph from '@tiptap/extension-paragraph';

function TiptapToolbar({ editor }: { editor: any }) {
  if (!editor) return null;
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <Tooltip title="Bold">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBold().run()}
          color={editor.isActive('bold') ? 'primary' : 'default'}
        >
          <FormatBoldIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Italic">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          color={editor.isActive('italic') ? 'primary' : 'default'}
        >
          <FormatItalicIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bullet List">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
        >
          <FormatListBulletedIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Numbered List">
        <IconButton
          size="small"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive('orderedList') ? 'primary' : 'default'}
        >
          <FormatListNumberedIcon />
        </IconButton>
      </Tooltip>
      {/* Fix: Split heading buttons into separate tooltips */}
      <Tooltip title="Heading 1">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}>
          <Typography variant="h6">H1</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 2">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}>
          <Typography variant="subtitle1">H2</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Heading 3">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}>
          <Typography variant="body1">H3</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Blockquote">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleBlockquote().run()} color={editor.isActive('blockquote') ? 'primary' : 'default'}>
          <FormatItalicIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Code Block">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleCodeBlock().run()} color={editor.isActive('codeBlock') ? 'primary' : 'default'}>
          <Typography variant="body2">{'</>'}</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Underline">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleUnderline().run()} color={editor.isActive('underline') ? 'primary' : 'default'}>
          <Typography variant="body2" sx={{ textDecoration: 'underline' }}>U</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Strike">
        <IconButton size="small" onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'default'}>
          <Typography variant="body2" sx={{ textDecoration: 'line-through' }}>S</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Left">
        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('left').run()} color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}>
          <Typography variant="body2">L</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Center">
        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('center').run()} color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}>
          <Typography variant="body2">C</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Align Right">
        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('right').run()} color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}>
          <Typography variant="body2">R</Typography>
        </IconButton>
      </Tooltip>
      <Tooltip title="Justify">
        <IconButton size="small" onClick={() => editor.chain().focus().setTextAlign('justify').run()} color={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'}>
          <Typography variant="body2">J</Typography>
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function JobRoleDescriptionsManager() {
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [descriptions, setDescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ jobRoleId: "", content: "" });
  const [editId, setEditId] = useState<number | null>(null);
  const [viewDesc, setViewDesc] = useState<any | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Paragraph,
      Heading,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Blockquote,
      CodeBlock,
      Link,
      Underline,
      Strike,
    ],
    content: form.content,
    onUpdate: ({ editor }: { editor: TiptapEditor }) => {
      setForm((f: any) => ({ ...f, content: editor.getHTML() }));
    },
    immediatelyRender: false,
  });

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

  useEffect(() => {
    async function load() {
      setLoading(true);
      setJobRoles(await fetchJobRoles());
      setDescriptions(await fetchDescriptions());
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (desc: any) => {
    setEditId(desc.id);
    setForm({ jobRoleId: desc.jobRoleId, content: desc.content });
    if (editor) editor.commands.setContent(desc.content || "");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm({ jobRoleId: "", content: "" });
    if (editor) editor.commands.setContent("");
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
      setForm({ jobRoleId: "", content: "" });
      setEditId(null);
      if (editor) editor.commands.setContent("");
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
      <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 2, background: '#fafafa' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'black' }}>
          Add Job Role Description
        </Typography>
        <TextField
          select
          label="Job Role"
          name="jobRoleId"
          value={form.jobRoleId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ style: { color: 'black' } }}
        >
          {jobRoles.map((role: any) => (
            <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'black' }}>
            Description
          </Typography>
          {editor && (
            <Box sx={{ border: '1px solid #ccc', borderRadius: 2, minHeight: 200, p: 1, width: '100%', background: '#fff', overflowY: 'auto', whiteSpace: 'normal', userSelect: 'text' }}>
              <TiptapToolbar editor={editor} />
              <EditorContent
                editor={editor}
                style={{
                  minHeight: 150,
                  width: '100%',
                  outline: 'none',
                  fontSize: '1rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  userSelect: 'text',
                  color: 'black', // Set editor text color to black
                }}
              />
            </Box>
          )}
        </Box>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={!form.jobRoleId || !form.content.trim()}
        >
          {editId ? "Update Description" : "Add Description"}
        </Button>
        {editId && (
          <Button sx={{ mt: 2, ml: 2 }} onClick={handleCancelEdit} color="secondary" variant="outlined">
            Cancel Edit
          </Button>
        )}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: 'black' }}>Manage Job Role Descriptions</Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Job Role</TableCell>
              <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Description</TableCell>
              <TableCell align="right" sx={{ color: 'black', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
            ) : descriptions.length === 0 ? (
              <TableRow><TableCell colSpan={3}>No descriptions found.</TableCell></TableRow>
            ) : (
              descriptions.map((desc) => {
                // Extract first few words from first line
                const firstLine = desc.content.replace(/<[^>]+>/g, '').split('\n')[0];
                const preview = firstLine.split(' ').slice(0, 8).join(' ') + (firstLine.split(' ').length > 8 ? '...' : '');
                return (
                  <TableRow key={desc.id} hover sx={{ cursor: 'pointer' }} onClick={() => setViewDesc(desc)}>
                    <TableCell>{desc.jobRole?.name || desc.jobRoleId}</TableCell>
                    <TableCell>
                      <Box sx={{ wordBreak: 'break-word', maxWidth: 400 }}>
                        {preview}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={e => { e.stopPropagation(); handleEdit(desc); }}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(desc.id); }}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {viewDesc && (
        <Box sx={{ mt: 4, p: 3, border: '2px solid #1976d2', borderRadius: 2, background: '#fff', maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: 'black', mb: 2 }}>
            {viewDesc.jobRole?.name || viewDesc.jobRoleId} - Full Description
          </Typography>
          <Box sx={{ wordBreak: 'break-word', color: 'black' }}>
            <span dangerouslySetInnerHTML={{ __html: viewDesc.content }} />
          </Box>
          <Button sx={{ mt: 2 }} variant="outlined" color="primary" onClick={() => setViewDesc(null)}>
            Close
          </Button>
        </Box>
      )}
    </Box>
  );
}
