"use client";
import * as React from "react";
// Removed unused useRouter import
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Slider from '@mui/joy/Slider';
import { Chip, Accordion, AccordionGroup, AccordionDetails, AccordionSummary } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Box from '@mui/joy/Box';
import Textarea from '@mui/joy/Textarea';

export interface KeyResult {
  id: number;
  title: string;
  status?: string;
  created_by_id?: number;
  // Add other fields as needed
}

// Define ProgressEntry interface for history entries
export interface ProgressEntry {
  id: number;
  year: number;
  month: number;
  key_result_id: number;
  status?: string;
  metric_value?: number;
  evidence?: string;
  comments?: string;
  blockers?: string;
  resources_needed?: string;
}

export interface SuccessCriteria {
  id: number;
  text: string;
}

interface ObjectiveKeyResultsClientProps {
  keyResults: KeyResult[];
}

export default function ObjectiveKeyResultsClient({ keyResults, objectiveTitle }: ObjectiveKeyResultsClientProps & { objectiveTitle?: string }) {
  const [progress, setProgress] = React.useState<Record<number, string>>({});
  const [status, setStatus] = React.useState<Record<number, string>>({});
  const [evidence, setEvidence] = React.useState<Record<number, string>>({});
  const [blockers, setBlockers] = React.useState<Record<number, string>>({});
  const [resources, setResources] = React.useState<Record<number, string>>({});
  const [comments, setComments] = React.useState<Record<number, string>>({});
  const [saving, setSaving] = React.useState<Record<number, boolean>>({});
  const [savedProgress, setSavedProgress] = React.useState<Record<number, ProgressEntry[]>>({});
  const [error, setError] = React.useState<string | null>(null);
  const [successCriteria, setSuccessCriteria] = React.useState<Record<number, SuccessCriteria[]>>({});
  const [newCriteria, setNewCriteria] = React.useState<Record<number, string>>({});
  const [editingCriteriaId, setEditingCriteriaId] = React.useState<Record<number, number | null>>({});
  const [editingCriteriaText, setEditingCriteriaText] = React.useState<Record<number, string>>({});
  const [userId, setUserId] = React.useState<number | null>(null);
  const [month, setMonth] = React.useState<number | null>(null);
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    // Fetch user role and user id for permissions
    fetch('/api/user/me').then(async res => {
      if (res.ok) {
        const data = await res.json();
        setUserId(data.id || null);
      }
    });
    // Fetch success criteria for all key results
    keyResults.forEach((kr: KeyResult) => {
      fetch(`/api/key-result/${kr.id}/success-criteria`).then(async res => {
        if (res.ok) {
          const data = await res.json();
          setSuccessCriteria(prev => ({ ...prev, [kr.id]: data.success_criteria || [] }));
        }
      });
    });
  }, [keyResults]);

  React.useEffect(() => {
    // Fetch all progress history for all key results for this objective
    const allKeyResultIds = keyResults.map((kr: KeyResult) => kr.id);
    if (allKeyResultIds.length > 0) {
      fetch(`/api/user/progress?keyResultIds=${allKeyResultIds.join(",")}`)
        .then(async res2 => {
          if (res2.ok) {
            const progressArr = await res2.json();
            // Group by key_result_id
            const historyMap: Record<number, ProgressEntry[]> = {};
            progressArr.forEach((p: ProgressEntry) => {
              if (!historyMap[p.key_result_id]) historyMap[p.key_result_id] = [];
              historyMap[p.key_result_id].push(p);
            });
            setSavedProgress(historyMap);
          }
        });
    }
  }, [keyResults]);

  // Sync status and progress state from the latest entry in the history array
  React.useEffect(() => {
    const allKeyResultIds = keyResults.map((kr: KeyResult) => kr.id);
    setStatus(prev => {
      const newStatus = { ...prev };
      allKeyResultIds.forEach((id: number) => {
        const history = savedProgress[id] || [];
        if (history.length > 0) {
          newStatus[id] = history[history.length - 1].status || "Not Started";
        } else {
          const kr = keyResults.find((k: KeyResult) => k.id === id);
          newStatus[id] = kr?.status ?? "Not Started";
        }
      });
      return newStatus;
    });
    setProgress(prev => {
      const newProgress = { ...prev };
      allKeyResultIds.forEach((id: number) => {
        const history = savedProgress[id] || [];
        if (history.length > 0 && typeof history[history.length - 1].metric_value === 'number') {
          newProgress[id] = String(history[history.length - 1].metric_value);
        }
      });
      return newProgress;
    });
  }, [savedProgress, keyResults]);

  const handleChange = (field: string, krId: number, value: string) => {
    // Enforce: Not Started cannot have progress
    if (field === 'status') {
      if (value === 'Not Started') {
        setProgress(prev => ({ ...prev, [krId]: '' })); // Clear progress
      }
      setStatus(prev => ({ ...prev, [krId]: value }));
    } else if (field === 'progress') {
      // Prevent setting progress if status is Not Started
      if (status[krId] === 'Not Started') return;
      setProgress(prev => ({ ...prev, [krId]: value }));
    } else if (field === 'evidence') setEvidence(prev => ({ ...prev, [krId]: value }));
    else if (field === 'blockers' ) setBlockers(prev => ({ ...prev, [krId]: value }));
    else if (field === 'resources') setResources(prev => ({ ...prev, [krId]: value }));
    else if (field === 'comments') setComments(prev => ({ ...prev, [krId]: value }));
  };

  const handleSave = async (krId: number, saveMonth: number | null, saveYear: number | null) => {
    if (saveMonth == null || saveYear == null) return;
    setSaving(prev => ({ ...prev, [krId]: true }));
    setError(null);
    const statusValue = status[krId] || "Not Started";
    // Enforce: Not Started cannot have progress, Done must have progress 1.0
    if (statusValue === 'Not Started' && progress[krId] && progress[krId] !== '' && Number(progress[krId]) !== 0) {
      setError('Cannot set progress for Not Started status.');
      setSaving(prev => ({ ...prev, [krId]: false }));
      return;
    }
    if (statusValue === 'Done' && (progress[krId] !== '1' && progress[krId] !== '1.0')) {
      setError('Progress must be 1.0 to mark as Done. Please complete the key result before setting status to Done.');
      setSaving(prev => ({ ...prev, [krId]: false }));
      return;
    }
    // Only require metric if status is Done
    if (statusValue === 'Done' && (!progress[krId] || isNaN(Number(progress[krId])))) {
      setError('Progress value must be a number when status is Done.');
      setSaving(prev => ({ ...prev, [krId]: false }));
      return;
    }
    try {
      const kr = keyResults.find((k: KeyResult) => k.id === krId);
      if (!kr) throw new Error('Key result not found');
      const metric_value = progress[krId] ? parseFloat(progress[krId]) : null;
      const payload = {
        key_result_id: krId,
        status: statusValue,
        metric_value,
        evidence: evidence[krId] || '',
        comments: comments[krId] || '',
        blockers: blockers[krId] || '',
        resources_needed: resources[krId] || '',
        month: saveMonth,
        year: saveYear,
      };
      const res = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedProgress(prev => {
          const prevArr = Array.isArray(prev[krId]) ? prev[krId] : [];
          return { ...prev, [krId]: [saved, ...prevArr] };
        });
        setProgress(prev => ({ ...prev, [krId]: '' }));
        setEvidence(prev => ({ ...prev, [krId]: '' }));
        setBlockers(prev => ({ ...prev, [krId]: '' }));
        setResources(prev => ({ ...prev, [krId]: '' }));
        setComments(prev => ({ ...prev, [krId]: '' }));
        // After save, re-fetch all progress history for this objective (no redirect)
        const allKeyResultIds = keyResults.map((kr: KeyResult) => kr.id);
        if (allKeyResultIds.length > 0) {
          fetch(`/api/user/progress?keyResultIds=${allKeyResultIds.join(",")}`)
            .then(async res2 => {
              if (res2.ok) {
                const progressArr = await res2.json();
                // Group by key_result_id
                const historyMap: Record<number, ProgressEntry[]> = {};
                progressArr.forEach((p: ProgressEntry) => {
                  if (!historyMap[p.key_result_id]) historyMap[p.key_result_id] = [];
                  historyMap[p.key_result_id].push(p);
                });
                setSavedProgress(historyMap);
              }
            });
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save progress');
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || 'Unknown error');
      } else {
        setError('Unknown error');
      }
    }
    setSaving(prev => ({ ...prev, [krId]: false }));
  };

  const handleAddCriteria = async (krId: number) => {
    if (!newCriteria[krId]) return;
    try {
      const res = await fetch(`/api/key-result/${krId}/success-criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newCriteria[krId] }),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessCriteria(prev => ({ ...prev, [krId]: [...(prev[krId] || []), data] }));
        setNewCriteria(prev => ({ ...prev, [krId]: '' }));
      }
    } catch {}
  };
  const handleEditCriteria = (krId: number, criteria: SuccessCriteria) => {
    setEditingCriteriaId(prev => ({ ...prev, [krId]: criteria.id }));
    setEditingCriteriaText(prev => ({ ...prev, [krId]: criteria.text }));
  };
  const handleSaveEditCriteria = async (krId: number) => {
    const criteriaId = editingCriteriaId[krId];
    if (!criteriaId) return;
    try {
      const res = await fetch(`/api/key-result/${krId}/success-criteria`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: criteriaId, text: editingCriteriaText[krId] })
      });
      if (res.ok) {
        setSuccessCriteria(prev => ({
          ...prev,
          [krId]: prev[krId].map(c => c.id === criteriaId ? { ...c, text: editingCriteriaText[krId] } : c)
        }));
        setEditingCriteriaId(prev => ({ ...prev, [krId]: null }));
        setEditingCriteriaText(prev => ({ ...prev, [krId]: '' }));
      }
    } catch {}
  };
  const handleDeleteCriteria = async (krId: number, criteriaId: number) => {
    try {
      const res = await fetch(`/api/key-result/${krId}/success-criteria`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: criteriaId })
      });
      if (res.ok) {
        setSuccessCriteria(prev => ({
          ...prev,
          [krId]: prev[krId].filter(c => c.id !== criteriaId)
        }));
      }
    } catch {}
  };

  React.useEffect(() => {
    // Set month and year on client only to avoid hydration mismatch
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', background: '#000' }}>
      <Typography level="h3" sx={{ color: 'white', mt: 6, mb: 2, fontWeight: 'bold', letterSpacing: 1 }}>
        Key results for {objectiveTitle || ''}
      </Typography>
      <Card sx={{ width: '100%', maxWidth: 700, mx: 'auto', boxShadow: 'lg', borderRadius: 3 }}>
        <CardContent>
          {error && <Typography color="danger" sx={{ mb: 2 }}>{error}</Typography>}
          <ul className="space-y-6" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {keyResults.map((kr: KeyResult) => {
              const history = savedProgress[kr.id] || [];
              const canEditSuccessCriteria = userId && Number(kr.created_by_id) === Number(userId);
              return (
                <li key={kr.id} style={{ border: 'none', boxShadow: 'none', padding: '1rem', background: 'white', borderRadius: 8, marginBottom: '2rem' }}>
                  <div className="font-bold mb-4" style={{ fontSize: '1.25em', color: '#1a237e', letterSpacing: '0.5px', paddingBottom: '0.5em' }}>{kr.title}</div>
                  <div className="mb-2">
                    <Typography level="body-md" sx={{ fontWeight: 'bold', mb: 1 }}>Success Criteria</Typography>
                    <ul style={{ paddingLeft: 0 }}>
                      {(successCriteria[kr.id] || []).map((criteria: SuccessCriteria) => (
                        <li key={criteria.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          {editingCriteriaId[kr.id] === criteria.id ? (
                            <>
                              <Input
                                value={editingCriteriaText[kr.id] || ''}
                                onChange={e => setEditingCriteriaText(prev => ({ ...prev, [kr.id]: e.target.value }))}
                                sx={{ flex: 1 }}
                              />
                              <Button size="sm" color="success" onClick={() => handleSaveEditCriteria(kr.id)}><SaveIcon fontSize="small" /></Button>
                              <Button size="sm" color="neutral" onClick={() => setEditingCriteriaId(prev => ({ ...prev, [kr.id]: null }))}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Typography level="body-sm" sx={{ mr: 1 }}>{criteria.text}</Typography>
                              {canEditSuccessCriteria && (
                                <>
                                  <Button size="sm" variant="plain" color="primary" onClick={() => handleEditCriteria(kr.id, criteria)}><EditIcon fontSize="small" /></Button>
                                  <Button size="sm" color="danger" onClick={() => handleDeleteCriteria(kr.id, criteria.id)}><DeleteIcon fontSize="small" /></Button>
                                </>
                              )}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                    {canEditSuccessCriteria && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <Input
                          value={newCriteria[kr.id] || ''}
                          onChange={e => setNewCriteria(prev => ({ ...prev, [kr.id]: e.target.value }))}
                          placeholder="Add new success criteria"
                          sx={{ flex: 1 }}
                        />
                        <Button size="sm" color="primary" onClick={() => handleAddCriteria(kr.id)}>Add</Button>
                      </div>
                    )}
                  </div>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Status</FormLabel>
                    <RadioGroup
                      orientation="horizontal"
                      name={`status-${kr.id}`}
                      value={status[kr.id] || "Not Started"}
                      onChange={e => handleChange('status', kr.id, e.target.value)}
                    >
                      <Radio value="Not Started" label="Not Started" />
                      <Radio value="In Progress" label="In Progress" />
                      <Radio value="Done" label="Done" />
                    </RadioGroup>
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Progress</FormLabel>
                    <Slider
                      min={0}
                      max={1}
                      step={0.01}
                      value={progress[kr.id] !== undefined && progress[kr.id] !== '' ? Number(progress[kr.id]) : 0}
                      onChange={(_, value) => handleChange('progress', kr.id, String(value))}
                      valueLabelDisplay="auto"
                      marks={[{ value: 0, label: '0.0' }, { value: 1, label: '1.0' }]}
                    />
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Evidence</FormLabel>
                    <Textarea
                      placeholder="Evidence"
                      value={evidence[kr.id] || ''}
                      onChange={e => handleChange('evidence', kr.id, e.target.value)}
                      disabled={saving[kr.id]}
                      minRows={2}
                      sx={{ width: '100%' }}
                    />
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Blockers</FormLabel>
                    <Textarea
                      placeholder="Blockers"
                      value={blockers[kr.id] || ''}
                      onChange={e => handleChange('blockers', kr.id, e.target.value)}
                      disabled={saving[kr.id]}
                      minRows={2}
                      sx={{ width: '100%' }}
                    />
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Resources needed</FormLabel>
                    <Textarea
                      placeholder="Resources needed"
                      value={resources[kr.id] || ''}
                      onChange={e => handleChange('resources', kr.id, e.target.value)}
                      disabled={saving[kr.id]}
                      minRows={2}
                      sx={{ width: '100%' }}
                    />
                  </FormControl>
                  <FormControl sx={{ mb: 2 }}>
                    <FormLabel>Comments</FormLabel>
                    <Textarea
                      placeholder="Comments"
                      value={comments[kr.id] || ''}
                      onChange={e => handleChange('comments', kr.id, e.target.value)}
                      disabled={saving[kr.id]}
                      minRows={2}
                      sx={{ width: '100%' }}
                    />
                  </FormControl>
                  <div className="mb-2" style={{ marginBottom: '2.5rem' }}>
                    <Button size="sm" color="primary" onClick={() => handleSave(kr.id, month, year)} disabled={saving[kr.id] || month == null || year == null}>Save</Button>
                  </div>
                  {history.length > 0 && (
                    <div className="mt-4">
                      <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>Monthly Review History</Typography>
                      <AccordionGroup sx={{ width: '100%' }}>
                        {history.sort((a: ProgressEntry, b: ProgressEntry) => (b.year - a.year) || (b.month - a.month) || (b.id - a.id)).map((entry: ProgressEntry, idx: number) => (
                          <Accordion key={entry.id || idx} sx={{ mb: 1 }}>
                            <AccordionSummary>
                              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <Typography level="title-sm" sx={{ mr: 2 }}><b>{entry.month}/{entry.year}</b></Typography>
                                {entry.status === 'Done' && <Chip color="success" size="sm" variant="soft" sx={{ ml: 1 }}>Done</Chip>}
                                {entry.status === 'In Progress' && <Chip color="primary" size="sm" variant="soft" sx={{ ml: 1 }}>In Progress</Chip>}
                                {entry.status === 'Not Started' && <Chip color="neutral" size="sm" variant="soft" sx={{ ml: 1 }}>Not Started</Chip>}
                              </div>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Typography level="body-sm" sx={{ mb: 0.5 }}><b>Progress:</b> {entry.metric_value !== null && entry.metric_value !== undefined ? entry.metric_value : '-'}</Typography>
                              <Typography level="body-sm" sx={{ mb: 0.5 }}><b>Evidence:</b> {entry.evidence || '-'}</Typography>
                              <Typography level="body-sm" sx={{ mb: 0.5 }}><b>Comments:</b> {entry.comments || '-'}</Typography>
                              <Typography level="body-sm" sx={{ mb: 0.5 }}><b>Blockers:</b> {entry.blockers || '-'}</Typography>
                              <Typography level="body-sm"><b>Resources Needed:</b> {entry.resources_needed || '-'}</Typography>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </AccordionGroup>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </Box>
  );
}
