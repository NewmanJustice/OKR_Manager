"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Box, Typography, CircularProgress, Paper, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import SideNav from '@/components/SideNav';

const ObjectiveDetailsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const guid = params?.guid as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [objective, setObjective] = useState<any>(null);
  const [sideNavOpen, setSideNavOpen] = useState(true);
  // Dialog state for delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'objective' | 'keyResult' | 'successCriteria' | null, id?: number, parentId?: number }>({ type: null });
  // --- Edit dialog state ---
  const [editDialog, setEditDialog] = useState<
    | { type: 'objective'; data: any }
    | { type: 'keyResult'; data: any; id: number }
    | { type: 'successCriteria'; data: any; id: number; parentId: number }
    | null
  >(null);
  const [editForm, setEditForm] = useState<any>({});
  // --- Add Key Result dialog state ---
  const [addKRDialogOpen, setAddKRDialogOpen] = useState(false);
  const [addKRForm, setAddKRForm] = useState({ title: '', metric: '', targetValue: '', successCriteria: [{ description: '', threshold: '' }] });
  // --- Add Success Criteria dialog state ---
  const [addSCDialog, setAddSCDialog] = useState<{ open: boolean, krId?: number }>({ open: false });
  const [addSCForm, setAddSCForm] = useState({ description: '', threshold: '' });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (!guid) return;
    setLoading(true);
    fetch(`/api/objectives/${guid}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setObjective(data.objective);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch objective details.");
        setLoading(false);
      });
  }, [guid, status, router]);

  if (loading) return <Box mt={6}><CircularProgress /></Box>;
  if (error) return <Typography color="error" mt={6}>{error}</Typography>;
  if (!objective) return null;

  // --- Edit handlers ---
  const handleEditObjective = () => {
    setEditDialog({ type: 'objective', data: { ...objective } });
    setEditForm({ ...objective });
  };
  const handleEditKeyResult = (krId: number) => {
    const kr = objective.keyResults.find((k: any) => k.id === krId);
    setEditDialog({ type: 'keyResult', data: { ...kr }, id: krId });
    setEditForm({ ...kr });
  };
  const handleEditSuccessCriteria = (krId: number, scId: number) => {
    const kr = objective.keyResults.find((k: any) => k.id === krId);
    const sc = kr.successCriteria.find((s: any) => s.id === scId);
    setEditDialog({ type: 'successCriteria', data: { ...sc }, id: scId, parentId: krId });
    setEditForm({ ...sc });
  };
  const handleCloseEditDialog = () => setEditDialog(null);

  // --- Save edit logic ---
  const handleSaveEdit = async () => {
    if (!editDialog) return;
    let url = '';
    let method = 'PATCH';
    let body = {};
    if (editDialog.type === 'objective') {
      url = `/api/objectives/${guid}`;
      body = {
        title: editForm.title,
        description: editForm.description,
        dueDate: editForm.dueDate,
      };
    } else if (editDialog.type === 'keyResult' && editDialog.id) {
      url = `/api/objectives/${guid}/keyResults/${editDialog.id}`;
      body = {
        title: editForm.title,
        metric: editForm.metric,
        targetValue: editForm.targetValue,
      };
    } else if (editDialog.type === 'successCriteria' && editDialog.id && editDialog.parentId) {
      url = `/api/objectives/${guid}/keyResults/${editDialog.parentId}/successCriteria/${editDialog.id}`;
      body = {
        description: editForm.description,
        threshold: editForm.threshold,
      };
    } else {
      setError('Invalid edit action.');
      setEditDialog(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Edit failed');
      // Refresh objective details after edit
      const data = await fetch(`/api/objectives/${guid}`).then(r => r.json());
      setObjective(data.objective);
      setEditDialog(null);
    } catch (e: any) {
      setError(e.message || 'Edit failed.');
      setEditDialog(null);
    } finally {
      setLoading(false);
    }
  };

  // --- Actual delete logic ---
  const handleConfirmDelete = async () => {
    if (!deleteDialog.type) return;
    let url = '';
    let method = 'DELETE';
    let body: any = undefined;
    if (deleteDialog.type === 'objective') {
      url = `/api/objectives/${guid}`;
    } else if (deleteDialog.type === 'keyResult' && deleteDialog.id) {
      url = `/api/objectives/${guid}/keyResults/${deleteDialog.id}`;
    } else if (deleteDialog.type === 'successCriteria' && deleteDialog.id && deleteDialog.parentId) {
      url = `/api/objectives/${guid}/keyResults/${deleteDialog.parentId}/successCriteria/${deleteDialog.id}`;
    } else {
      setError('Invalid delete action.');
      setDeleteDialog({ type: null });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Delete failed');
      if (deleteDialog.type === 'objective') {
        // Redirect to root after objective delete
        router.push('/');
      } else {
        // Refresh objective details after KR/SC delete
        const data = await fetch(`/api/objectives/${guid}`).then(r => r.json());
        setObjective(data.objective);
      }
      setDeleteDialog({ type: null });
    } catch (e: any) {
      setError(e.message || 'Delete failed.');
      setDeleteDialog({ type: null });
    } finally {
      setLoading(false);
    }
  };

  // Handler stubs for edit/delete (to be implemented)
  const handleDeleteObjective = () => setDeleteDialog({ type: 'objective' });
  const handleDeleteKeyResult = (krId: number) => setDeleteDialog({ type: 'keyResult', id: krId });
  const handleDeleteSuccessCriteria = (krId: number, scId: number) => setDeleteDialog({ type: 'successCriteria', id: scId, parentId: krId });
  const handleOpenAddKRDialog = () => {
    setAddKRForm({ title: '', metric: '', targetValue: '', successCriteria: [{ description: '', threshold: '' }] });
    setAddKRDialogOpen(true);
  };
  const handleCloseAddKRDialog = () => setAddKRDialogOpen(false);

  const handleAddKRFormChange = (field: string, value: string) => {
    setAddKRForm(f => ({ ...f, [field]: value }));
  };
  const handleAddKRSuccessCriteriaChange = (idx: number, field: string, value: string) => {
    setAddKRForm(f => {
      const updated = [...f.successCriteria];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...f, successCriteria: updated };
    });
  };
  const handleAddKRAddSuccessCriteria = () => {
    setAddKRForm(f => ({ ...f, successCriteria: [...f.successCriteria, { description: '', threshold: '' }] }));
  };
  const handleAddKRRemoveSuccessCriteria = (idx: number) => {
    setAddKRForm(f => ({ ...f, successCriteria: f.successCriteria.filter((_, i) => i !== idx) }));
  };

  const handleAddKeyResult = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/objectives/${guid}/keyResults`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addKRForm),
      });
      if (!res.ok) throw new Error('Failed to add key result');
      const data = await fetch(`/api/objectives/${guid}`).then(r => r.json());
      setObjective(data.objective);
      setAddKRDialogOpen(false);
    } catch (e: any) {
      setError(e.message || 'Failed to add key result.');
      setAddKRDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // --- Add Success Criteria handlers ---
  const handleOpenAddSCDialog = (krId: number) => {
    setAddSCForm({ description: '', threshold: '' });
    setAddSCDialog({ open: true, krId });
  };
  const handleCloseAddSCDialog = () => setAddSCDialog({ open: false });
  const handleAddSCFormChange = (field: string, value: string) => {
    setAddSCForm(f => ({ ...f, [field]: value }));
  };
  const handleAddSuccessCriteria = async () => {
    if (!addSCDialog.krId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/objectives/${guid}/keyResults/${addSCDialog.krId}/successCriteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addSCForm),
      });
      if (!res.ok) throw new Error('Failed to add success criteria');
      const data = await fetch(`/api/objectives/${guid}`).then(r => r.json());
      setObjective(data.objective);
      setAddSCDialog({ open: false });
    } catch (e: any) {
      setError(e.message || 'Failed to add success criteria.');
      setAddSCDialog({ open: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex">
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box flex={1}>
        <Box mt={6} maxWidth={700} mx="auto">
          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h4" sx={{ color: 'black' }} mb={3} fontWeight={600} textAlign="center">
              Edit your objective
            </Typography>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" sx={{ color: 'black' }}>Objective Details</Typography>
              <Box>
                <IconButton sx={{ color: 'black' }} onClick={handleEditObjective} size="small"><EditIcon sx={{ color: 'black' }} /></IconButton>
                <IconButton sx={{ color: 'black' }} onClick={handleDeleteObjective} size="small"><DeleteIcon sx={{ color: 'black' }} /></IconButton>
              </Box>
            </Box>
            <Typography variant="h6" sx={{ color: 'black' }}>{objective.title}</Typography>
            <Typography sx={{ color: 'black' }} mb={2}>{objective.description}</Typography>
            <Typography sx={{ color: 'black' }} mb={2}><strong>Due Date:</strong> {new Date(objective.dueDate).toLocaleDateString('en-GB')}</Typography>
            <Typography variant="subtitle1" sx={{ color: 'black' }} mb={1}>
              Key Results
              <Button onClick={handleOpenAddKRDialog} sx={{ color: 'black', ml: 2 }} size="small" variant="outlined">+ Add Key Result</Button>
            </Typography>
            <List>
              {objective.keyResults.map((kr: any, idx: number) => (
                <ListItem key={kr.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, width: '100%', border: '2px solid black', borderRadius: 2, p: 2 }}>
                  <Box display="flex" alignItems="center" width="100%" mb={0.5}>
                    <Typography component="span" sx={{ color: 'black', fontWeight: 500, flex: 1 }}>{`KR ${idx + 1}: ${kr.title}`}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, ml: 'auto', alignItems: 'center' }}>
                      <IconButton sx={{ color: 'black', width: 32, height: 32 }} onClick={() => handleEditKeyResult(kr.id)} size="small"><EditIcon sx={{ color: 'black', fontSize: 20 }} /></IconButton>
                      <IconButton sx={{ color: 'black', width: 32, height: 32 }} onClick={() => handleDeleteKeyResult(kr.id)} size="small"><DeleteIcon sx={{ color: 'black', fontSize: 20 }} /></IconButton>
                    </Box>
                  </Box>
                  <ListItemText
                    primary={null}
                    secondary={
                      <React.Fragment>
                        <span style={{ color: 'black', flex: 1 }}><strong>Metric:</strong> {kr.metric} | <strong>Target:</strong> {kr.targetValue}</span>
                      </React.Fragment>
                    }
                  />
                  <Box display="flex" alignItems="center" width="100%" mb={1}>
                    <span style={{ display: 'block', color: 'black', fontWeight: 600 }}><strong>Success Criteria:</strong></span>
                    <Button onClick={() => handleOpenAddSCDialog(kr.id)} sx={{ color: 'black', ml: 2 }} size="small" variant="outlined">+ Add Success Criteria</Button>
                  </Box>
                  <Box component="ul" sx={{ m: 0, pl: 0, width: '100%' }}>
                    {kr.successCriteria.map((sc: any, scIdx: number) => (
                      <li key={sc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid #888', borderRadius: 8, padding: '6px 12px', marginBottom: 6, background: '#fafafa', width: '100%', boxSizing: 'border-box' }}>
                        <span style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: 'black' }}>{sc.description}</span> <span style={{ color: 'black', marginLeft: 8 }}>(Threshold: {sc.threshold})</span>
                        </span>
                        <span style={{ display: 'flex', gap: 8, marginLeft: 'auto', alignItems: 'center' }}>
                          <IconButton sx={{ color: 'black', width: 32, height: 32 }} onClick={() => handleEditSuccessCriteria(kr.id, sc.id)} size="small"><EditIcon sx={{ color: 'black', fontSize: 20 }} /></IconButton>
                          <IconButton sx={{ color: 'black', width: 32, height: 32 }} onClick={() => handleDeleteSuccessCriteria(kr.id, sc.id)} size="small"><DeleteIcon sx={{ color: 'black', fontSize: 20 }} /></IconButton>
                        </span>
                      </li>
                    ))}
                  </Box>
                </ListItem>
              ))}
            </List>
            {/* Delete confirmation dialog */}
            <Dialog open={!!deleteDialog.type} onClose={() => setDeleteDialog({ type: null })}>
              <DialogTitle sx={{ color: 'black' }}>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography sx={{ color: 'black' }}>Are you sure you want to delete this {deleteDialog.type?.replace(/([A-Z])/g, ' $1').toLowerCase()}?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialog({ type: null })} sx={{ color: 'black' }}>Cancel</Button>
                <Button sx={{ color: 'black' }} onClick={handleConfirmDelete} autoFocus>Delete</Button>
              </DialogActions>
            </Dialog>
            {/* Edit dialog */}
            <Dialog open={!!editDialog} onClose={handleCloseEditDialog}>
              <DialogTitle sx={{ color: 'black' }}>Edit {editDialog?.type && editDialog.type.charAt(0).toUpperCase() + editDialog.type.slice(1)}</DialogTitle>
              <DialogContent>
                {editDialog?.type === 'objective' && (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                    <TextField label="Title" fullWidth margin="normal" value={editForm.title || ''} onChange={e => setEditForm((f: any) => ({ ...f, title: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <TextField label="Description" fullWidth margin="normal" value={editForm.description || ''} onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <DatePicker
                      label="Due Date"
                      value={editForm.dueDate ? new Date(editForm.dueDate) : null}
                      onChange={date => setEditForm((f: any) => ({ ...f, dueDate: date ? date.toISOString() : '' }))}
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { fullWidth: true, margin: 'normal', sx: { color: 'black' }, InputProps: { style: { color: 'black' } } }} }
                    />
                  </LocalizationProvider>
                )}
                {editDialog?.type === 'keyResult' && (
                  <>
                    <TextField label="Title" fullWidth margin="normal" value={editForm.title || ''} onChange={e => setEditForm((f: any) => ({ ...f, title: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <TextField label="Metric" fullWidth margin="normal" value={editForm.metric || ''} onChange={e => setEditForm((f: any) => ({ ...f, metric: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <TextField label="Target Value" fullWidth margin="normal" value={editForm.targetValue || ''} onChange={e => setEditForm((f: any) => ({ ...f, targetValue: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                  </>
                )}
                {editDialog?.type === 'successCriteria' && (
                  <>
                    <TextField label="Description" fullWidth margin="normal" value={editForm.description || ''} onChange={e => setEditForm((f: any) => ({ ...f, description: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <TextField label="Threshold" fullWidth margin="normal" value={editForm.threshold || ''} onChange={e => setEditForm((f: any) => ({ ...f, threshold: e.target.value }))} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                  </>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseEditDialog} sx={{ color: 'black' }}>Cancel</Button>
                <Button sx={{ color: 'black' }} onClick={handleSaveEdit} autoFocus>Save</Button>
              </DialogActions>
            </Dialog>
            {/* Add Key Result dialog */}
            <Dialog open={addKRDialogOpen} onClose={handleCloseAddKRDialog}>
              <DialogTitle sx={{ color: 'black' }}>Add Key Result</DialogTitle>
              <DialogContent>
                <TextField label="Title" fullWidth margin="normal" value={addKRForm.title} onChange={e => handleAddKRFormChange('title', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                <TextField label="Metric" fullWidth margin="normal" value={addKRForm.metric} onChange={e => handleAddKRFormChange('metric', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                <TextField label="Target Value" fullWidth margin="normal" value={addKRForm.targetValue} onChange={e => handleAddKRFormChange('targetValue', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                <Typography sx={{ color: 'black', mt: 2, mb: 1 }}><strong>Success Criteria</strong></Typography>
                {addKRForm.successCriteria.map((sc, idx) => (
                  <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                    <TextField label="Description" fullWidth value={sc.description} onChange={e => handleAddKRSuccessCriteriaChange(idx, 'description', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <TextField label="Threshold" value={sc.threshold} onChange={e => handleAddKRSuccessCriteriaChange(idx, 'threshold', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                    <IconButton sx={{ color: 'black' }} onClick={() => handleAddKRRemoveSuccessCriteria(idx)} disabled={addKRForm.successCriteria.length === 1} size="small"><DeleteIcon sx={{ color: 'black' }} fontSize="small" /></IconButton>
                  </Box>
                ))}
                <Button onClick={handleAddKRAddSuccessCriteria} sx={{ color: 'black', mt: 1 }} size="small">+ Add Success Criteria</Button>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAddKRDialog} sx={{ color: 'black' }}>Cancel</Button>
                <Button sx={{ color: 'black' }} onClick={handleAddKeyResult} autoFocus>Add</Button>
              </DialogActions>
            </Dialog>
            {/* Add Success Criteria dialog */}
            <Dialog open={addSCDialog.open} onClose={handleCloseAddSCDialog}>
              <DialogTitle sx={{ color: 'black' }}>Add Success Criteria</DialogTitle>
              <DialogContent>
                <TextField label="Description" fullWidth margin="normal" value={addSCForm.description} onChange={e => handleAddSCFormChange('description', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
                <TextField label="Threshold" fullWidth margin="normal" value={addSCForm.threshold} onChange={e => handleAddSCFormChange('threshold', e.target.value)} sx={{ color: 'black' }} InputProps={{ style: { color: 'black' } }} />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAddSCDialog} sx={{ color: 'black' }}>Cancel</Button>
                <Button sx={{ color: 'black' }} onClick={handleAddSuccessCriteria} autoFocus>Add</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default ObjectiveDetailsPage;
