"use client";
import * as React from "react";
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Link from 'next/link';

export default function PDMObjectivesTable() {
  const [objectives, setObjectives] = React.useState<any[]>([]);
  const [progress, setProgress] = React.useState<Record<number, string>>({});
  const [evidence, setEvidence] = React.useState<Record<number, string>>({});
  const [blockers, setBlockers] = React.useState<Record<number, string>>({});
  const [resources, setResources] = React.useState<Record<number, string>>({});
  const [expandedId, setExpandedId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<Record<number, boolean>>({});
  const [savedProgress, setSavedProgress] = React.useState<Record<number, any>>({});

  React.useEffect(() => {
    setLoading(true);
    fetch('/api/user/objectives').then(async res => {
      if (res.ok) {
        const data = await res.json();
        setObjectives(data);
        // Fetch saved progress for all key results
        const allKeyResultIds = data.flatMap((obj: any) => obj.key_results.map((kr: any) => kr.id));
        if (allKeyResultIds.length > 0) {
          const now = new Date();
          const month = now.getMonth() + 1;
          const year = now.getFullYear();
          fetch(`/api/pdm/progress?keyResultIds=${allKeyResultIds.join(",")}&month=${month}&year=${year}`)
            .then(async res2 => {
              if (res2.ok) {
                const progressArr = await res2.json();
                const progressMap: Record<number, any> = {};
                progressArr.forEach((p: any) => { progressMap[p.key_result_id] = p; });
                setSavedProgress(progressMap);
              }
            });
        }
      } else {
        setError('Failed to load objectives');
      }
      setLoading(false);
    });
  }, []);

  const handleProgressChange = (krId: number, value: string) => {
    setProgress(prev => ({ ...prev, [krId]: value }));
  };
  const handleEvidenceChange = (krId: number, value: string) => {
    setEvidence(prev => ({ ...prev, [krId]: value }));
  };
  const handleBlockersChange = (krId: number, value: string) => {
    setBlockers(prev => ({ ...prev, [krId]: value }));
  };
  const handleResourcesChange = (krId: number, value: string) => {
    setResources(prev => ({ ...prev, [krId]: value }));
  };

  const handleSave = async (krId: number, month: number, year: number) => {
    setSaving(prev => ({ ...prev, [krId]: true }));
    setError(null);
    // Input validation
    if (!progress[krId] || isNaN(Number(progress[krId]))) {
      setError('Progress value must be a number.');
      setSaving(prev => ({ ...prev, [krId]: false }));
      return;
    }
    try {
      const kr = objectives.flatMap(obj => obj.key_results).find((k: any) => k.id === krId);
      if (!kr) throw new Error('Key result not found');
      const status = kr.status || "In Progress";
      const metric_value = parseFloat(progress[krId]);
      const res = await fetch('/api/pdm/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key_result_id: krId,
          status,
          metric_value,
          evidence: evidence[krId] || '',
          comments: '',
          blockers: blockers[krId] || '',
          resources_needed: resources[krId] || '',
          month,
          year,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setSavedProgress(prev => ({ ...prev, [krId]: saved }));
        setProgress(prev => ({ ...prev, [krId]: '' }));
        setEvidence(prev => ({ ...prev, [krId]: '' }));
        setBlockers(prev => ({ ...prev, [krId]: '' }));
        setResources(prev => ({ ...prev, [krId]: '' }));
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save progress');
      }
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
    setSaving(prev => ({ ...prev, [krId]: false }));
  };

  if (loading) return <div>Loading...</div>;
  return (
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 1200, minWidth: 320, p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 'auto' }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        {(() => {
          const now = new Date();
          const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
          const currentYear = now.getFullYear();
          return (
            <Link
              href={`/pdm/quarterly-reviews?quarter=${currentQuarter}&year=${currentYear}`}
              className="text-blue-700 hover:underline mb-4 inline-block"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 18, marginRight: 4, fontWeight: 600 }}>&rarr;</span> Quarterly Reviews
              </span>
            </Link>
          );
        })()}
      </div>
      <Typography level="h4" sx={{ mb: 2, textAlign: 'center' }}>My OKRs</Typography>
      {error && <Typography color="danger" sx={{ mb: 2 }}>{error}</Typography>}
      <Table variant="outlined" sx={{ width: '100%', background: 'white', boxShadow: 'sm' }}>
        <thead>
        <tr>
            <th>Objective</th>
            <th>Quarter</th>
            <th>Year</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {objectives.map(obj => (
            <React.Fragment key={obj.id}>
            <tr>
                <td>{obj.title}</td>
                <td>{obj.quarter}</td>
                <td>{obj.year}</td>
                <td>
                <Link href={`/pdm/objective/${obj.id}`} style={{ color: '#1976d2', textDecoration: 'underline', fontSize: '0.95em' }}>
                    View
                </Link>
                </td>
            </tr>
            {expandedId === obj.id && (
                <tr>
                <td colSpan={4}>
                    <Table size="sm" variant="soft" sx={{ mt: 2, mb: 2 }}>
                    <thead>
                        <tr>
                        <th>Key Result</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Evidence/Comments</th>
                        <th>Blockers</th>
                        <th>Resources Needed</th>
                        <th>Saved Progress</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {obj.key_results.map((kr: any) => {
                        const now = new Date();
                        const month = now.getMonth() + 1;
                        const year = now.getFullYear();
                        const saved = savedProgress[kr.id];
                        return (
                            <tr key={kr.id}>
                            <td>{kr.title}</td>
                            <td>{kr.status}</td>
                            <td>
                                <input
                                type="text"
                                placeholder="Metric/Value"
                                style={{ width: 100 }}
                                value={progress[kr.id] || ''}
                                onChange={e => handleProgressChange(kr.id, e.target.value)}
                                disabled={saving[kr.id]}
                                />
                            </td>
                            <td>
                                <input
                                type="text"
                                placeholder="Evidence or comments"
                                style={{ width: 180 }}
                                value={evidence[kr.id] || ''}
                                onChange={e => handleEvidenceChange(kr.id, e.target.value)}
                                disabled={saving[kr.id]}
                                />
                            </td>
                            <td>
                                <input
                                type="text"
                                placeholder="Blockers"
                                style={{ width: 120 }}
                                value={blockers[kr.id] || ''}
                                onChange={e => handleBlockersChange(kr.id, e.target.value)}
                                disabled={saving[kr.id]}
                                />
                            </td>
                            <td>
                                <input
                                type="text"
                                placeholder="Resources needed"
                                style={{ width: 120 }}
                                value={resources[kr.id] || ''}
                                onChange={e => handleResourcesChange(kr.id, e.target.value)}
                                disabled={saving[kr.id]}
                                />
                            </td>
                            <td style={{ fontSize: 12 }}>
                                {saved ? (
                                <div>
                                    <div><b>Value:</b> {saved.metric_value ?? ''}</div>
                                    <div><b>Evidence:</b> {saved.evidence ?? ''}</div>
                                    <div><b>Blockers:</b> {saved.blockers ?? ''}</div>
                                    <div><b>Resources:</b> {saved.resources_needed ?? ''}</div>
                                </div>
                                ) : <span style={{ color: '#888' }}>No progress</span>}
                            </td>
                            <td>
                                <Button size="sm" color="primary" onClick={() => handleSave(kr.id, month, year)} disabled={saving[kr.id]}>Save</Button>
                            </td>
                            </tr>
                        );
                        })}
                    </tbody>
                    </Table>
                </td>
                </tr>
            )}
            </React.Fragment>
        ))}
        </tbody>
    </Table>
    </Card>
  );
}
