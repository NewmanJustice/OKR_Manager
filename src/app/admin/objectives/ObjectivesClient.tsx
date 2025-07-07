"use client";
import * as React from "react";
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';
import ProfessionSelect from './ProfessionSelect';

// Move currentYear outside the component to avoid SSR/CSR mismatch
const CURRENT_YEAR = new Date().getFullYear();

export interface KeyResult {
  id?: number;
  title: string;
}

export interface Objective {
  id: number;
  title: string;
  description: string;
  quarter: number;
  year: number;
  keyResults: KeyResult[];
  professionId?: string | number;
}

export default function ObjectivesClient() {
  const [objectives, setObjectives] = React.useState<Objective[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [professions, setProfessions] = React.useState<{ id: number; roleName: string }[]>([]);
  const [form, setForm] = React.useState<{ title: string; description: string; quarter: string; year: string; keyResults: { id?: number; title: string }[]; professionId: string }>({ title: '', description: '', quarter: '', year: '', keyResults: [{ title: '' }], professionId: '' });
  const [error, setError] = React.useState('');
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editForm, setEditForm] = React.useState<Objective | null>(null);
  const [quarterError, setQuarterError] = React.useState<string | null>(null);
  const [yearError, setYearError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/objectives').then(async res => {
      if (res.ok) {
        const data: Array<{ id: number; title: string; description: string; quarter: number; year: number; key_results: KeyResult[]; professionId?: string | number }> = await res.json();
        // Normalize key_results to keyResults for frontend
        const normalized: Objective[] = (data || []).map((obj) => ({
          ...obj,
          keyResults: (obj.key_results || []).map((kr) => ({
            id: kr.id,
            title: kr.title
          }))
        }));
        setObjectives(normalized);
      }
      setLoading(false);
    });
    fetch('/api/profession').then(async res => {
      if (res.ok) {
        const data: { professions: { id: number; roleName: string }[] } = await res.json();
        setProfessions(data.professions || []);
      }
    });
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'quarter') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1 || num > 4) {
        setQuarterError('Quarter must be a number between 1 and 4');
      } else {
        setQuarterError(null);
      }
    }
    if (name === 'year') {
      const num = Number(value);
      if (!Number.isInteger(num) || num < CURRENT_YEAR) {
        setYearError(`Year must be ${CURRENT_YEAR} or later`);
      } else {
        setYearError(null);
      }
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleKRChange = (idx: number, value: string) => {
    setForm(f => ({ ...f, keyResults: f.keyResults.map((kr, i) => i === idx ? { ...kr, title: value } : kr) }));
  };

  const addKR = () => setForm(f => ({ ...f, keyResults: [...f.keyResults, { title: '' }] }));
  const removeKR = (idx: number) => setForm(f => ({ ...f, keyResults: f.keyResults.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        quarter: Number(form.quarter),
        year: Number(form.year),
        keyResults: form.keyResults,
        professionId: form.professionId ? Number(form.professionId) : undefined
      }),
    });
    if (res.ok) {
      const newObj = await res.json();
      // Normalize key_results to keyResults for the new objective
      const normalizedNewObj: Objective = {
        ...newObj,
        keyResults: (newObj.key_results || []).map((kr: KeyResult) => ({
          ...kr,
          title: kr.title
        }))
      };
      setObjectives([...objectives, normalizedNewObj]);
      setForm({ title: '', description: '', quarter: '', year: '', keyResults: [{ title: '' }], professionId: '' });
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
      keyResults: obj.keyResults.map(kr => ({ id: kr.id, title: kr.title })),
      professionId: obj.professionId ? String(obj.professionId) : '', // Ensure present for edit
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
    setEditForm(f => f ? { ...f, keyResults: f.keyResults.map((kr, i) => i === idx ? { ...kr, title: value } : kr) } : null);
  };
  const addEditKR = () => setEditForm(f => f ? { ...f, keyResults: [...f.keyResults, { title: '' }] } : null);
  const removeEditKR = (idx: number) => setEditForm(f => f ? { ...f, keyResults: f.keyResults.filter((_, i) => i !== idx) } : null);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!editForm) return;
    // Send keyResults (not key_results) for backend compatibility
    const { keyResults, ...rest } = editForm;
    const payload = {
      ...rest,
      quarter: Number(editForm.quarter),
      year: Number(editForm.year),
      keyResults, // use keyResults, not key_results
    };
    const res = await fetch(`/api/admin/objectives/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const updated = await res.json();
      // Normalize key_results to keyResults for the updated objective
      const normalizedUpdated: Objective = {
        ...updated,
        keyResults: (updated.key_results || []).map((kr: KeyResult) => ({
          ...kr,
          title: kr.title
        }))
      };
      setObjectives(objectives.map(o => o.id === editingId ? normalizedUpdated : o));
      setEditingId(null);
      setEditForm(null);
    } else {
      setError('Failed to update objective');
    }
  };

  const handleProfessionChange = (_: React.SyntheticEvent | null, value: string | null) => {
    setForm(f => ({ ...f, professionId: value || '' }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-4">
      <Card variant="outlined" sx={{ width: 500, maxWidth: '95vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {editingId !== null && editForm ? (
          <form key="edit" onSubmit={handleEditSubmit} className="w-full flex flex-col" style={{ gap: '0.5em' }}>
            <Input name="title" placeholder="Title" value={editForm.title} onChange={handleEditFormChange} required />
            <Input name="description" placeholder="Description" value={editForm.description} onChange={handleEditFormChange} />
            <Input name="quarter" placeholder="Quarter (e.g. 2)" value={editForm.quarter} onChange={handleEditFormChange} required type="number" />
            <Input name="year" placeholder="Year (e.g. 2025)" value={editForm.year} onChange={handleEditFormChange} required type="number" />
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Profession</label>
            <ProfessionSelect professions={professions} value={String(editForm.professionId || '')} onChange={(_e, value) => setEditForm(f => f ? { ...f, professionId: value || '' } : null)} />
            <Typography level="body-sm">Key Results:</Typography>
            {editForm.keyResults.map((kr, idx) => (
              <div key={kr.id !== undefined ? `kr-${kr.id}` : `new-${idx}`} className="flex" style={{ gap: '0.5em', marginBottom: '0.5em' }}>
                <Input value={kr.title} onChange={e => handleEditKRChange(idx, e.target.value)} placeholder={`Key Result ${idx + 1}`} required />
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
          <form key="create" onSubmit={handleSubmit} className="w-full flex flex-col" style={{ gap: '0.5em' }}>
            <Input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} required />
            <Input name="description" placeholder="Description" value={form.description} onChange={handleFormChange} />
            <Input name="quarter" placeholder="Quarter (e.g. 2)" value={form.quarter} onChange={handleFormChange} required type="number" slotProps={{ input: { min: 1, max: 4 } }} />
            {quarterError && <Typography color="danger" level="body-xs" sx={{ mb: 1 }}>{quarterError}</Typography>}
            <Input name="year" placeholder="Year (e.g. 2025)" value={form.year} onChange={handleFormChange} required type="number" slotProps={{ input: { min: CURRENT_YEAR } }} />
            {yearError && <Typography color="danger" level="body-xs" sx={{ mb: 1 }}>{yearError}</Typography>}
            <label style={{ fontWeight: 500, marginBottom: 4 }}>Profession</label>
            <ProfessionSelect professions={professions} value={form.professionId} onChange={handleProfessionChange} />
            <Typography level="body-sm">Key Results:</Typography>
            {form.keyResults.map((kr, idx) => (
              <div key={kr.id !== undefined ? `kr-${kr.id}` : `new-${idx}`} className="flex" style={{ gap: '0.5em', marginBottom: '0.5em' }}>
                <Input value={kr.title} onChange={e => handleKRChange(idx, e.target.value)} placeholder={`Key Result ${idx + 1}`} required />
                <Button type="button" color="danger" onClick={() => removeKR(idx)} disabled={form.keyResults.length === 1}>Remove</Button>
              </div>
            ))}
            <Button type="button" onClick={addKR} color="neutral">Add Key Result</Button>
            <Button type="submit" color="primary" disabled={!!quarterError || !!yearError}>Create Objective</Button>
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
                      <li key={kr.id !== undefined ? `kr-${kr.id}` : `new-${i}`}>{kr.title}</li>
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
