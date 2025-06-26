"use client";
import * as React from "react";
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';

export interface Objective {
  id: number;
  title: string;
  description: string;
  quarter: number;
  year: number;
  keyResults: { text: string }[];
  // Add other fields as needed
}

export default function ObjectivesClient() {
  const [objectives, setObjectives] = React.useState<Objective[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<{ title: string; description: string; quarter: string; year: string; keyResults: { text: string }[] }>({ title: '', description: '', quarter: '', year: '', keyResults: [{ text: '' }] });
  const [error, setError] = React.useState('');
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState<Objective | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/objectives').then(async res => {
      if (res.ok) setObjectives(await res.json());
      setLoading(false);
    });
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleKRChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, keyResults: f.keyResults.map((kr, i) => i === idx ? { text: value } : kr) }));
  };

  const addKR = () => setForm(f => ({ ...f, keyResults: [...f.keyResults, { text: '' }] }));
  const removeKR = (idx: number) => setForm(f => ({ ...f, keyResults: f.keyResults.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, quarter: Number(form.quarter), year: Number(form.year), keyResults: form.keyResults }),
    });
    if (res.ok) {
      const newObj = await res.json();
      setObjectives([...objectives, newObj]);
      setForm({ title: '', description: '', quarter: '', year: '', keyResults: [{ text: '' }] });
    } else {
      setError('Failed to create objective');
    }
  };

  const handleDelete = async (id: number) => {
    await fetch(`/api/admin/objectives/${id}`, { method: 'DELETE' });
    setObjectives(objectives.filter(o => o.id !== id));
  };

  const startEdit = (obj: Objective) => {
    setEditingId(obj.id);
    setEditForm({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      quarter: obj.quarter,
      year: obj.year,
      keyResults: obj.keyResults.map(kr => ({ text: kr.text })),
    });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm(f => f ? { ...f, [e.target.name]: e.target.value } : null);
  };
  const handleEditKRChange = (idx: number, value: string) => {
    setEditForm(f => f ? { ...f, keyResults: f.keyResults.map((kr, i) => i === idx ? { ...kr, text: value } : kr) } : null);
  };
  const addEditKR = () => setEditForm(f => f ? { ...f, keyResults: [...f.keyResults, { text: '' }] } : null);
  const removeEditKR = (idx: number) => setEditForm(f => f ? { ...f, keyResults: f.keyResults.filter((_, i) => i !== idx) } : null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!editForm) return;
    const res = await fetch(`/api/admin/objectives/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editForm, quarter: Number(editForm.quarter), year: Number(editForm.year), keyResults: editForm.keyResults }),
    });
    if (res.ok) {
      const updated = await res.json();
      setObjectives(objectives.map(o => o.id === editingId ? updated : o));
      setEditingId(null);
      setEditForm(null);
    } else {
      setError('Failed to update objective');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-4">
      <Card variant="outlined" sx={{ width: 500, maxWidth: '95vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {editingId !== null && editForm ? (
          <form onSubmit={handleEditSubmit} className="w-full flex flex-col" style={{ gap: '0.5em' }}>
            <Input name="title" placeholder="Title" value={editForm.title} onChange={handleEditFormChange} required />
            <Input name="description" placeholder="Description" value={editForm.description} onChange={handleEditFormChange} />
            <Input name="quarter" placeholder="Quarter (e.g. 2)" value={editForm.quarter} onChange={handleEditFormChange} required type="number" />
            <Input name="year" placeholder="Year (e.g. 2025)" value={editForm.year} onChange={handleEditFormChange} required type="number" />
            <Typography level="body-sm">Key Results:</Typography>
            {editForm.keyResults.map((kr, idx) => (
              <div key={idx} className="flex" style={{ gap: '0.5em', marginBottom: '0.5em' }}>
                <Input value={kr.text} onChange={e => handleEditKRChange(idx, e.target.value)} placeholder={`Key Result ${idx + 1}`} required />
                <Button type="button" color="danger" onClick={() => removeEditKR(idx)} disabled={editForm.keyResults.length === 1}>Remove</Button>
              </div>
            ))}
            <Button type="button" onClick={addEditKR} color="neutral">Add Key Result</Button>
            <div className="flex" style={{ gap: '0.5em' }}>
              <Button type="submit" color="primary">Save Changes</Button>
              <Button type="button" color="neutral" onClick={cancelEdit}>Cancel</Button>
            </div>
            {error && <Typography color="danger">{error}</Typography>}
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col" style={{ gap: '0.5em' }}>
            <Input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} required />
            <Input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} />
            <Input name="quarter" placeholder="Quarter (e.g. 2)" value={form.quarter} onChange={handleFormChange} required type="number" />
            <Input name="year" placeholder="Year (e.g. 2025)" value={form.year} onChange={handleFormChange} required type="number" />
            <Typography level="body-sm">Key Results:</Typography>
            {form.keyResults.map((kr, idx) => (
              <div key={idx} className="flex" style={{ gap: '0.5em', marginBottom: '0.5em' }}>
                <Input value={kr.text} onChange={e => handleKRChange(idx, e.target.value)} placeholder={`Key Result ${idx + 1}`} required />
                <Button type="button" color="danger" onClick={() => removeKR(idx)} disabled={form.keyResults.length === 1}>Remove</Button>
              </div>
            ))}
            <Button type="button" onClick={addKR} color="neutral">Add Key Result</Button>
            <Button type="submit" color="primary">Create Objective</Button>
            {error && <Typography color="danger">{error}</Typography>}
          </form>
        )}
      </Card>
      {objectives.length > 0 && (
        <Table variant="outlined" sx={{ width: 900, maxWidth: '98vw', mb: 4, background: 'white', boxShadow: 'sm' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Quarter</th>
              <th>Year</th>
              <th>Key Results</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map(obj => (
              <tr key={obj.id}>
                <td>{obj.title}</td>
                <td>{obj.description}</td>
                <td>{obj.quarter}</td>
                <td>{obj.year}</td>
                <td>
                  <ul style={{ paddingLeft: 16 }}>
                    {obj.keyResults.map((kr, i) => (
                      <li key={i}>{kr.text}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <Button color="primary" size="sm" onClick={() => startEdit(obj)} sx={{ mr: 1 }}>Edit</Button>
                  <Button color="danger" size="sm" onClick={() => handleDelete(obj.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {/* Optionally keep the List for editing UI, or remove if not needed */}
      {/* <List> ...existing code... </List> */}
    </div>
  );
}
