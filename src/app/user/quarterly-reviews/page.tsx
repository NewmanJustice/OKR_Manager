"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import Link from 'next/link';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';

export interface KeyResult {
  id: number;
  text?: string;
  title?: string;
}
export interface Objective {
  id: number;
  title: string;
  description: string;
  quarter: number;
  year: number;
  key_results: KeyResult[];
}
export interface QuarterlyReview {
  id: string | number;
  quarter: number;
  year: number;
  okr_grading?: Record<string, unknown>;
  submitted_at?: string | null;
  isMissing?: boolean;
}
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

function QuarterlyReviewPageInner() {
  const searchParams = useSearchParams();
  const quarter = Number(searchParams.get("quarter"));
  const year = Number(searchParams.get("year"));
  const [objectives, setObjectives] = React.useState<Objective[]>([]);
  const [okrGrading, setOkrGrading] = React.useState<Record<number, number>>({});
  const [lessons, setLessons] = React.useState("");
  const [adjustments, setAdjustments] = React.useState("");
  const [nextPlan, setNextPlan] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [pastReviews, setPastReviews] = React.useState<QuarterlyReview[]>([]);

  const fetchPastReviews = React.useCallback(() => {
    fetch(`/api/user/quarterly-review?year=${year}`)
      .then(async res => {
        if (res.ok) {
          let reviews = await res.json();
          const now = new Date();
          const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
          const missing: QuarterlyReview[] = [];
          for (let q = 1; q < currentQuarter; q++) {
            if (!reviews.some((r: QuarterlyReview) => r && r.quarter === q && r.year === year)) {
              missing.push({
                id: `missing-${q}`,
                quarter: q,
                year,
                okr_grading: {},
                submitted_at: null,
                isMissing: true
              });
            }
          }
          reviews = [...reviews, ...missing].sort((a: QuarterlyReview, b: QuarterlyReview) => a.quarter - b.quarter);
          setPastReviews(reviews.filter((r: QuarterlyReview) => r && r.year === year));
        }
      });
  }, [year]);

  React.useEffect(() => {
    setLoading(true);
    // Fetch objectives for the year
    fetch(`/api/user/objectives?year=${year}`)
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setObjectives(data);
        }
      })
      .finally(() => setLoading(false));
    // Fetch existing review if any
    fetch(`/api/user/quarterly-review?quarter=${quarter}&year=${year}`)
      .then(async res => {
        if (res.ok) {
          const review = await res.json();
          if (review && Object.keys(review).length > 0) {
            setOkrGrading(review.okr_grading || {});
            setLessons(review.lessons_learned || "");
            setAdjustments(review.strategic_adjustments || "");
            setNextPlan(review.next_quarter_planning || "");
          } else {
            setOkrGrading({});
            setLessons("");
            setAdjustments("");
            setNextPlan("");
          }
        } else {
          setOkrGrading({});
          setLessons("");
          setAdjustments("");
          setNextPlan("");
        }
      });
    // Fetch all reviews for the year
    fetchPastReviews();
  }, [quarter, year, fetchPastReviews]);

  // Auto-calculate OKR grading from latest KR progress for the quarter
  React.useEffect(() => {
    if (!objectives.length) return;
    // For each objective, fetch latest KR progress for the quarter
    Promise.all(
      objectives.map(async (obj: Objective) => {
        const krIds = obj.key_results.map((kr: KeyResult) => kr.id);
        if (!krIds.length) return [obj.id, 0];
        const res = await fetch(`/api/user/progress?keyResultIds=${krIds.join(",")}&quarter=${quarter}&year=${year}`);
        if (!res.ok) return [obj.id, 0];
        const progressArr: ProgressEntry[] = await res.json();
        // For each KR, get the latest metric_value for the quarter
        const values = progressArr.map((p: ProgressEntry) => typeof p.metric_value === 'number' ? p.metric_value : 0);
        const avg = values.length ? values.reduce((a: number, b: number) => a + b, 0) / values.length : 0;
        // Clamp to 0.0-1.0
        return [obj.id, Math.max(0, Math.min(1, avg))];
      })
    ).then(pairs => {
      setOkrGrading(Object.fromEntries(pairs));
    });
  }, [objectives, quarter, year]);

  // Calculate average objective score for this review
  const avgObjectiveScore =
    Object.values(okrGrading).length > 0
      ? (
          Object.values(okrGrading).reduce((a: number, b: number) => a + (typeof b === 'number' ? b : 0), 0) /
          Object.values(okrGrading).length
        )
      : 0;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('/api/user/quarterly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quarter,
          year,
          okr_grading: okrGrading,
          lessons_learned: lessons,
          strategic_adjustments: adjustments,
          next_quarter_planning: nextPlan,
        }),
      });
      if (res.ok) {
        setSuccess(true);
        fetchPastReviews(); // Refresh past reviews after save
      } else setError('Failed to save review');
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message || 'Unknown error');
      } else {
        setError('Unknown error');
      }
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;
  return (
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 900, minWidth: 320, p: 4, mb: 6, boxShadow: 'lg', mx: 'auto' }}>
      <div style={{ marginBottom: 16 }}>
        <Link href="/user" className="text-blue-700 hover:underline mb-4 inline-block" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <KeyboardArrowLeft sx={{ mr: 0.5 }} /> Back to Dashboard
        </Link>
      </div>
      <Typography level="h3" sx={{ mb: 2 }}>Quarterly Review: Q{quarter} {year}</Typography>
      {error && <Typography color="danger" sx={{ mb: 2 }}>{error}</Typography>}
      {success && <Typography color="success" sx={{ mb: 2 }}>Review saved!</Typography>}
      <Typography level="h4" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
        OKR Grading
        <span style={{ fontWeight: 500, fontSize: 18, marginLeft: 16, color: '#1976d2' }}>
          Avg: {avgObjectiveScore.toFixed(2)}
        </span>
      </Typography>
      <Table size="sm" variant="soft" sx={{ mb: 3 }}>
        <thead>
          <tr>
            <th>Objective</th>
            <th>Score (0.0–1.0)</th>
          </tr>
        </thead>
        <tbody>
          {objectives.map(obj => (
            <tr key={obj.id}>
              <td>{obj.title}</td>
              <td>{okrGrading[obj.id]?.toFixed(2) ?? '0.00'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>Lessons Learned</Typography>
      <Textarea minRows={3} value={lessons} onChange={e => setLessons(e.target.value)} sx={{ mb: 3 }} />
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>Strategic Adjustment</Typography>
      <Textarea minRows={2} value={adjustments} onChange={e => setAdjustments(e.target.value)} sx={{ mb: 3 }} />
      <Typography level="h4" sx={{ mt: 2, mb: 1 }}>Next Quarter Planning</Typography>
      <Textarea minRows={2} value={nextPlan} onChange={e => setNextPlan(e.target.value)} sx={{ mb: 3 }} />
      <Button color="primary" onClick={handleSave} loading={saving} sx={{ mt: 2 }}>Save Review</Button>

      <Typography level="h4" sx={{ mt: 4, mb: 2 }}>Past Quarterly Reviews ({year})</Typography>
      <Table size="sm" variant="plain" sx={{ mb: 3 }}>
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Saved At</th>
            <th>Avg Score</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pastReviews.length === 0 && (
            <tr><td colSpan={4} style={{ color: '#888' }}>No reviews yet</td></tr>
          )}
          {pastReviews.map((r: QuarterlyReview) => {
            const grades = Object.values(r.okr_grading || {});
            const avg = grades.length ? grades.reduce((a: number, b: unknown) => a + (typeof b === 'number' ? b : 0), 0) / grades.length : 0;
            const isMissing = r.isMissing || !r.submitted_at;
            return (
              <tr key={r.id} style={isMissing ? { background: '#ffe6a1' } : {}}>
                <td>Q{r.quarter}</td>
                <td>{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : ''}</td>
                <td>{avg.toFixed(2)}</td>
                <td>
                  <Link href={`/user/quarterly-reviews?quarter=${r.quarter}&year=${r.year}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>
                    View/Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Card>
  );
}

export default function QuarterlyReviewPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <QuarterlyReviewPageInner />
    </React.Suspense>
  );
}
