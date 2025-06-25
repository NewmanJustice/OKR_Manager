"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Slider from '@mui/joy/Slider';
import { Card, Chip, Accordion, AccordionGroup, AccordionDetails, AccordionSummary } from '@mui/joy';

export default function ObjectiveKeyResultsClient({ keyResults }: any) {
  const router = useRouter();
  const [progress, setProgress] = React.useState<Record<number, string>>({});
  const [status, setStatus] = React.useState<Record<number, string>>({});
  const [evidence, setEvidence] = React.useState<Record<number, string>>({});
  const [blockers, setBlockers] = React.useState<Record<number, string>>({});
  const [resources, setResources] = React.useState<Record<number, string>>({});
  const [comments, setComments] = React.useState<Record<number, string>>({});
  const [saving, setSaving] = React.useState<Record<number, boolean>>({});
  const [savedProgress, setSavedProgress] = React.useState<Record<number, any>>({});
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Fetch saved progress for all key results for this objective
    const allKeyResultIds = keyResults.map((kr: any) => kr.id);
    if (allKeyResultIds.length > 0) {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      fetch(`/api/pdm/progress?keyResultIds=${allKeyResultIds.join(",")}&month=${month}&year=${year}`)
        .then(async res2 => {
          if (res2.ok) {
            const progressArr = await res2.json();
            const progressMap: Record<number, any> = {};
            const statusMap: Record<number, string> = {};
            const metricMap: Record<number, string> = {};
            progressArr.forEach((p: any) => {
              progressMap[p.key_result_id] = p;
              statusMap[p.key_result_id] = p.status || "Not Started";
              if (typeof p.metric_value === 'number') {
                metricMap[p.key_result_id] = String(p.metric_value);
              }
            });
            setSavedProgress(progressMap);
            // Always set status from backend (or Not Started)
            const newStatus: Record<number, string> = {};
            allKeyResultIds.forEach((id: number) => {
              newStatus[id] = statusMap[id] || "Not Started";
            });
            setStatus(newStatus);
            // Set progress (slider) from backend
            setProgress(prev => {
              const newProgress = { ...prev };
              allKeyResultIds.forEach((id: number) => {
                if (metricMap[id] !== undefined) {
                  newProgress[id] = metricMap[id];
                }
              });
              return newProgress;
            });
          } else {
            // If no progress, set default status
            const newStatus: Record<number, string> = {};
            allKeyResultIds.forEach((id: number) => {
              newStatus[id] = "Not Started";
            });
            setStatus(newStatus);
          }
        });
    }
  }, [keyResults]);

  // Sync status state with savedProgress or key result status when it changes
  React.useEffect(() => {
    const allKeyResultIds = keyResults.map((kr: any) => kr.id);
    setStatus(prev => {
      const newStatus = { ...prev };
      allKeyResultIds.forEach((id: number) => {
        const kr = keyResults.find((k: any) => k.id === id);
        if (savedProgress[id] && (prev[id] === undefined || prev[id] === "Not Started" || prev[id] === "")) {
          newStatus[id] = savedProgress[id].status || (kr?.status ?? "Not Started");
        } else if (!savedProgress[id] && (prev[id] === undefined || prev[id] === "")) {
          newStatus[id] = kr?.status ?? "Not Started";
        }
      });
      return newStatus;
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
    else if (field === 'blockers') setBlockers(prev => ({ ...prev, [krId]: value }));
    else if (field === 'resources') setResources(prev => ({ ...prev, [krId]: value }));
    else if (field === 'comments') setComments(prev => ({ ...prev, [krId]: value }));
  };

  const handleSave = async (krId: number, month: number, year: number) => {
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
      const kr = keyResults.find((k: any) => k.id === krId);
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
        month,
        year,
      };
      console.log('Saving progress payload:', payload);
      const res = await fetch('/api/pdm/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedProgress(prev => {
          const prevArr = prev[krId] || [];
          return { ...prev, [krId]: [saved, ...prevArr] };
        });
        setProgress(prev => ({ ...prev, [krId]: '' }));
        setEvidence(prev => ({ ...prev, [krId]: '' }));
        setBlockers(prev => ({ ...prev, [krId]: '' }));
        setResources(prev => ({ ...prev, [krId]: '' }));
        setComments(prev => ({ ...prev, [krId]: '' }));
        // Redirect to dashboard after save
        router.push('/pdm');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save progress');
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
    setSaving(prev => ({ ...prev, [krId]: false }));
  };

  React.useEffect(() => {
    // Fetch all progress history for all key results for this objective
    const allKeyResultIds = keyResults.map((kr: any) => kr.id);
    if (allKeyResultIds.length > 0) {
      fetch(`/api/pdm/progress?keyResultIds=${allKeyResultIds.join(",")}`)
        .then(async res2 => {
          if (res2.ok) {
            const progressArr = await res2.json();
            // Group by key_result_id
            const historyMap: Record<number, any[]> = {};
            progressArr.forEach((p: any) => {
              if (!historyMap[p.key_result_id]) historyMap[p.key_result_id] = [];
              historyMap[p.key_result_id].push(p);
            });
            setSavedProgress(historyMap);
          }
        });
    }
  }, [keyResults]);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  return (
    <div className="mt-8">
      {error && <Typography color="danger" sx={{ mb: 2 }}>{error}</Typography>}
      <ul className="space-y-6" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {keyResults.map((kr: any) => {
          const history = savedProgress[kr.id] || [];
          return (
            <li key={kr.id} style={{ border: 'none', boxShadow: 'none', padding: '1rem', background: 'white' }}>
              <div className="font-bold mb-4" style={{ fontSize: '1.25em', color: '#1a237e', letterSpacing: '0.5px', paddingBottom: '0.5em' }}>{kr.title}</div>
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
                <Input
                  placeholder="Evidence"
                  value={evidence[kr.id] || ''}
                  onChange={e => handleChange('evidence', kr.id, e.target.value)}
                  disabled={saving[kr.id]}
                />
              </FormControl>
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Blockers</FormLabel>
                <Input
                  placeholder="Blockers"
                  value={blockers[kr.id] || ''}
                  onChange={e => handleChange('blockers', kr.id, e.target.value)}
                  disabled={saving[kr.id]}
                />
              </FormControl>
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Resources needed</FormLabel>
                <Input
                  placeholder="Resources needed"
                  value={resources[kr.id] || ''}
                  onChange={e => handleChange('resources', kr.id, e.target.value)}
                  disabled={saving[kr.id]}
                />
              </FormControl>
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Comments</FormLabel>
                <Input
                  placeholder="Comments"
                  value={comments[kr.id] || ''}
                  onChange={e => handleChange('comments', kr.id, e.target.value)}
                  disabled={saving[kr.id]}
                />
              </FormControl>
              <div className="mb-2" style={{ marginBottom: '2.5rem' }}>
                <Button size="sm" color="primary" onClick={() => handleSave(kr.id, month, year)} disabled={saving[kr.id]}>Save</Button>
              </div>
              {history.length > 0 && (
                <div className="mt-4">
                  <Typography level="body-sm" sx={{ fontWeight: 'bold', mb: 1 }}>Monthly Review History</Typography>
                  <AccordionGroup sx={{ width: '100%' }}>
                    {history.sort((a: any, b: any) => (b.year - a.year) || (b.month - a.month) || (b.id - a.id)).map((entry: any, idx: number) => (
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
    </div>
  );
}
