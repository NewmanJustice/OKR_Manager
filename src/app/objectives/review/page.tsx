"use client";
import React, { useEffect, useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, List, ListItem, ListItemText, Button, Modal, Slider, TextField, IconButton, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";

interface SuccessCriterion {
  id: number;
  description: string;
  threshold?: string;
}

interface Review {
  id: number;
  month: number;
  year: number;
  progress: number;
  notes: string;
}

interface KeyResult {
  id: number;
  title: string;
  metric: string;
  targetValue: string;
  createdAt?: string;
  successCriteria?: SuccessCriterion[];
  reviews?: Review[];
}

interface QuarterlyReview {
  id: number;
  quarter: number;
  year: number;
  grading: number;
  lessonsLearned: string;
  strategicAdjustment: string;
  nextQuarterPlanning: string;
  engagement: string;
  actionCompletion: string;
  strategicAlignment: string;
  feedbackQuality: string;
}

interface Objective {
  guid: string;
  title: string;
  dueDate: string;
  createdAt?: string;
  keyResults: KeyResult[];
  completed?: boolean;
  quarterlyReviews?: QuarterlyReview[];
}

export default function OKRReviewPage() {
  const [sideNavOpen, setSideNavOpen] = React.useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{ open: boolean, kr?: any, obj?: any }>({ open: false });
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [reviewProgress, setReviewProgress] = useState<number>(0);
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [reviewId, setReviewId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [quarterlyModal, setQuarterlyModal] = useState<{ open: boolean, obj?: any, review?: any, quarter?: number, year?: number }>({ open: false });
  const [quarterlyFields, setQuarterlyFields] = useState({
    grading: 0,
    lessonsLearned: '',
    strategicAdjustment: '',
    nextQuarterPlanning: '',
    engagement: '',
    actionCompletion: '',
    strategicAlignment: '',
    feedbackQuality: '',
  });
  const [quarterlyReviewId, setQuarterlyReviewId] = useState<number | null>(null);
  const [quarterlyModalLoading, setQuarterlyModalLoading] = useState(false);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    setLoading(true);
    fetch("/api/objectives/user")
      .then(res => res.json())
      .then(data => {
        setObjectives(Array.isArray(data?.objectives) ? data.objectives : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Helper: get review for month/year
  function getReviewForMonth(kr: any, month: number, year: number) {
    return kr.reviews?.find((r: any) => r.month === month && r.year === year);
  }

  // Open modal for KR (optionally for a specific month/year)
  function openReviewModal(kr: any, obj: any, month?: number, year?: number) {
    setReviewModal({ open: true, kr, obj });
    const selMonth = month ?? (new Date().getMonth() + 1);
    const selYear = year ?? (new Date().getFullYear());
    setSelectedMonth(selMonth);
    setSelectedYear(selYear);
    const review = getReviewForMonth(kr, selMonth, selYear);
    setReviewProgress(review?.progress ?? 0);
    setReviewNotes(review?.notes ?? "");
    setReviewId(review?.id ?? null);
  }

  // When month/year changes in modal
  function handleMonthYearChange(month: number, year: number) {
    setSelectedMonth(month);
    setSelectedYear(year);
    if (reviewModal.kr) {
      const review = getReviewForMonth(reviewModal.kr, month, year);
      setReviewProgress(review?.progress ?? 0);
      setReviewNotes(review?.notes ?? "");
      setReviewId(review?.id ?? null);
    }
  }

  // Save review
  async function handleSaveReview() {
    if (!reviewModal.kr) return;
    setModalLoading(true);
    await fetch(`/api/objectives/${reviewModal.obj.guid}/keyResults/${reviewModal.kr.id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: selectedMonth,
        year: selectedYear,
        progress: reviewProgress,
        notes: reviewNotes,
      }),
    });
    setModalLoading(false);
    setReviewModal({ open: false });
    // Refresh objectives
    setLoading(true);
    fetch("/api/objectives/user")
      .then(res => res.json())
      .then(data => {
        setObjectives(Array.isArray(data?.objectives) ? data.objectives : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  // Delete review
  async function handleDeleteReview() {
    if (!reviewModal.kr) return;
    setModalLoading(true);
    await fetch(`/api/objectives/${reviewModal.obj.guid}/keyResults/${reviewModal.kr.id}/reviews`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month: selectedMonth,
        year: selectedYear,
      }),
    });
    setModalLoading(false);
    setReviewModal({ open: false });
    setLoading(true);
    fetch("/api/objectives/user")
      .then(res => res.json())
      .then(data => {
        setObjectives(Array.isArray(data?.objectives) ? data.objectives : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  // Get month/year range between two dates
  function getMonthYearRange(start: Date, end: Date) {
    const result: { month: number; year: number }[] = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= last) {
      result.push({ month: current.getMonth() + 1, year: current.getFullYear() });
      current.setMonth(current.getMonth() + 1);
    }
    return result;
  }

  // Helper: get month/year range for modal (for selected KR)
  function getModalMonthYearRange() {
    if (!reviewModal.kr || !reviewModal.obj) return [];
    const krCreated = reviewModal.kr.createdAt ? new Date(reviewModal.kr.createdAt) : (reviewModal.obj.createdAt ? new Date(reviewModal.obj.createdAt) : new Date());
    const objDue = new Date(reviewModal.obj.dueDate);
    return getMonthYearRange(krCreated, objDue);
  }

  // Helper: get quarterly review for quarter/year
  function getQuarterlyReview(obj: any, quarter: number, year: number) {
    return obj.quarterlyReviews?.find((r: any) => r.quarter === quarter && r.year === year);
  }

  // Open quarterly review modal
  function openQuarterlyModal(obj: any, quarter: number, year: number) {
    const review = getQuarterlyReview(obj, quarter, year);
    setQuarterlyModal({ open: true, obj, review, quarter, year });
    setQuarterlyFields({
      grading: review?.grading ?? 0,
      lessonsLearned: review?.lessonsLearned ?? '',
      strategicAdjustment: review?.strategicAdjustment ?? '',
      nextQuarterPlanning: review?.nextQuarterPlanning ?? '',
      engagement: review?.engagement ?? '',
      actionCompletion: review?.actionCompletion ?? '',
      strategicAlignment: review?.strategicAlignment ?? '',
      feedbackQuality: review?.feedbackQuality ?? '',
    });
    setQuarterlyReviewId(review?.id ?? null);
  }

  // Save quarterly review
  async function handleSaveQuarterlyReview() {
    if (!quarterlyModal.obj || !quarterlyModal.quarter || !quarterlyModal.year) return;
    setQuarterlyModalLoading(true);
    await fetch(`/api/objectives/${quarterlyModal.obj.guid}/quarterly-reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quarter: quarterlyModal.quarter,
        year: quarterlyModal.year,
        ...quarterlyFields,
      }),
    });
    setQuarterlyModalLoading(false);
    setQuarterlyModal({ open: false });
    setLoading(true);
    fetch('/api/objectives/user')
      .then(res => res.json())
      .then(data => {
        setObjectives(Array.isArray(data?.objectives) ? data.objectives : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  // Delete quarterly review
  async function handleDeleteQuarterlyReview() {
    if (!quarterlyReviewId || !quarterlyModal.obj) return;
    setQuarterlyModalLoading(true);
    await fetch(`/api/objectives/${quarterlyModal.obj.guid}/quarterly-reviews/${quarterlyReviewId}`, {
      method: 'DELETE',
    });
    setQuarterlyModalLoading(false);
    setQuarterlyModal({ open: false });
    setLoading(true);
    fetch('/api/objectives/user')
      .then(res => res.json())
      .then(data => {
        setObjectives(Array.isArray(data?.objectives) ? data.objectives : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  // Helper: get all quarters between two dates (inclusive)
  function getQuarterRange(start: Date, end: Date) {
    const result: { quarter: number; year: number }[] = [];
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= last) {
      const year = current.getFullYear();
      const quarter = Math.floor(current.getMonth() / 3) + 1;
      // Only add if not already present (avoid duplicate quarters in same year)
      if (!result.some(q => q.quarter === quarter && q.year === year)) {
        result.push({ quarter, year });
      }
      // Move to next quarter
      current.setMonth(current.getMonth() + 3 - (current.getMonth() % 3));
    }
    return result;
  }

  return (
    <Box display="flex">
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box flex={1}>
        <Box mt={6} maxWidth={700} mx="auto">
          <Box sx={{ p: 4, mb: 4, background: '#fff', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="h4" sx={{ color: 'black' }} mb={3} fontWeight={600} textAlign="center">
              Review your OKRs
            </Typography>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              objectives.length === 0 ? (
                <Typography>No objectives found.</Typography>
              ) : (
                <List>
                  {objectives.map((obj, idx) => {
                    // Determine quarter range for the objective
                    const objCreated = obj.createdAt ? new Date(obj.createdAt) : new Date();
                    const objDue = new Date(obj.dueDate);
                    const quarterRange = getQuarterRange(objCreated, objDue);
                    return (
                      <ListItem key={obj.guid} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, width: '100%', border: '2px solid black', borderRadius: 2, p: 2 }}>
                        <Typography variant="h6" sx={{ color: 'black', fontWeight: 600 }}>{`Objective ${idx + 1}: ${obj.title}`}</Typography>
                        <Typography sx={{ color: 'black', mb: 1 }}><strong>Due Date:</strong> {obj.dueDate ? new Date(obj.dueDate).toLocaleDateString('en-GB') : '-'}</Typography>
                        {/* Quarterly Reviews Row (dynamic) */}
                        <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                          <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'black', mb: 0.5 }}>Quarterly Reviews:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {quarterRange.map(({ quarter, year }) => {
                              const review = obj.quarterlyReviews?.find((r) => r.quarter === quarter && r.year === year);
                              const now = new Date();
                              const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
                              const currentYear = now.getFullYear();
                              let bgColor = '#f5f5f5'; // default grey
                              if (review) {
                                bgColor = '#e0ffe0'; // green
                              } else if (year < currentYear || (year === currentYear && quarter < currentQuarter)) {
                                bgColor = '#ffe0e0'; // red
                              } else if (year === currentYear && quarter === currentQuarter) {
                                bgColor = '#fff8e1'; // amber
                              }
                              return (
                                <Box
                                  key={`Q${quarter}-${year}`}
                                  sx={{ minWidth: 90, p: 1, border: '1px solid #ccc', borderRadius: 1, background: bgColor, textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3, background: '#e3f2fd' } }}
                                  onClick={() => openQuarterlyModal(obj, quarter, year)}
                                  aria-label={`Edit or create quarterly review for Q${quarter} ${year}`}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      openQuarterlyModal(obj, quarter, year);
                                    }
                                  }}
                                >
                                  <Typography sx={{ fontSize: 13, color: 'black' }}>{`Q${quarter} ${year}`}</Typography>
                                  <Typography sx={{ fontSize: 13, color: review ? 'green' : (bgColor === '#ffe0e0' ? 'red' : (bgColor === '#fff8e1' ? '#ff9800' : '#888')) }}>{review ? `${Math.round((review.grading ?? 0) * 100) / 100}` : '-'}</Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                        <Typography variant="subtitle1" sx={{ color: 'black' }} mb={1}>Key Results</Typography>
                        {Array.isArray(obj.keyResults) && obj.keyResults.length > 0 ? (
                          <List sx={{ width: '100%' }}>
                            {obj.keyResults.map((kr, krIdx) => {
                              // Determine start and end dates
                              const krCreated = kr.createdAt ? new Date(kr.createdAt) : (obj.createdAt ? new Date(obj.createdAt) : new Date());
                              const objDue = new Date(obj.dueDate);
                              const monthYearRange = getMonthYearRange(krCreated, objDue);
                              return (
                                <ListItem key={kr.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 1, width: '100%', border: '1.5px solid #888', borderRadius: 2, p: 1, background: '#fafafa' }}>
                                  <Box display="flex" alignItems="center" width="100%">
                                    <Typography sx={{ color: 'black', fontWeight: 500, flex: 1 }}>{`KR ${krIdx + 1}: ${kr.title}`}</Typography>
                                    <Button
                                      onClick={() => openReviewModal(kr, obj)}
                                      size="small"
                                      sx={{ color: 'black', display: 'flex', alignItems: 'center', textTransform: 'none', minWidth: 0, ml: 1 }}
                                      aria-label="Create monthly review"
                                    >
                                      <RateReviewIcon sx={{ mr: 1 }} />
                                      <span style={{ fontSize: 14 }}>Create monthly review</span>
                                    </Button>
                                  </Box>
                                  <Typography sx={{ color: 'black', fontSize: 14, mb: 0.5 }}><strong>Metric:</strong> {kr.metric} | <strong>Target:</strong> {kr.targetValue}</Typography>
                                  {/* Review summary table */}
                                  <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'black', mb: 0.5 }}>Monthly Reviews:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      {monthYearRange.map(({ month, year }) => {
                                        const review = kr.reviews?.find((r: any) => r.month === month && r.year === year);
                                        const label = `${months[month - 1].slice(0, 3)} ${year}`;
                                        // Color logic
                                        const now = new Date();
                                        const currentMonth = now.getMonth() + 1;
                                        const currentYear = now.getFullYear();
                                        let bgColor = '#f5f5f5'; // default grey
                                        if (review) {
                                          bgColor = '#e0ffe0'; // green
                                        } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                                          bgColor = '#ffe0e0'; // red
                                        } else if (year === currentYear && month === currentMonth) {
                                          bgColor = '#fff8e1'; // amber
                                        }
                                        return (
                                          <Box
                                            key={label}
                                            sx={{ minWidth: 80, p: 1, border: '1px solid #ccc', borderRadius: 1, background: bgColor, textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 3, background: '#e3f2fd' } }}
                                            onClick={() => {
                                              openReviewModal(kr, obj, month, year);
                                            }}
                                            aria-label={`Edit or create review for ${label}`}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={e => {
                                              if (e.key === 'Enter' || e.key === ' ') {
                                                openReviewModal(kr, obj, month, year);
                                              }
                                            }}
                                          >
                                            <Typography sx={{ fontSize: 13, color: 'black' }}>{label}</Typography>
                                            <Typography sx={{ fontSize: 13, color: review ? 'green' : (bgColor === '#ffe0e0' ? 'red' : (bgColor === '#fff8e1' ? '#ff9800' : '#888')) }}>{review ? `${review.progress}%` : '-'}</Typography>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  </Box>
                                  <Typography sx={{ color: 'black', fontWeight: 600, mt: 1 }}>Success Criteria:</Typography>
                                  {Array.isArray(kr.successCriteria) && kr.successCriteria.length > 0 ? (
                                    <ul style={{ margin: 0, paddingLeft: 20, width: '100%' }}>
                                      {kr.successCriteria.map((sc: any, scIdx: number) => (
                                        <li key={sc.id} style={{ color: 'black', marginBottom: 4, fontSize: 14 }}>
                                          <span>{sc.description}</span>
                                          {sc.threshold && (
                                            <span style={{ color: '#666', marginLeft: 8 }}>(Threshold: {sc.threshold})</span>
                                          )}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <Typography sx={{ color: '#888', margin: 0 }}>No success criteria.</Typography>
                                  )}
                                </ListItem>
                              );
                            })}
                          </List>
                        ) : (
                          <Typography sx={{ color: '#888', margin: 0 }}>No key results.</Typography>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              )
            )}
          </Box>
        </Box>
        {/* Review Modal */}
        <Modal open={reviewModal.open} onClose={() => setReviewModal({ open: false })}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2, color: 'black' }}>
            <Typography variant="h6" mb={2} sx={{ color: 'black' }}>Review Key Result</Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="month-label" sx={{ color: 'black' }}>Month</InputLabel>
              <Select
                labelId="month-label"
                value={selectedMonth}
                label="Month"
                onChange={e => handleMonthYearChange(Number(e.target.value), selectedYear)}
                sx={{ color: 'black' }}
                inputProps={{ style: { color: 'black' } }}
              >
                {getModalMonthYearRange().filter((v, i, arr) => arr.findIndex(x => x.month === v.month && x.year === v.year) === i && v.year === selectedYear).map(({ month }) => (
                  <MenuItem key={month} value={month} sx={{ color: 'black' }}>{months[month - 1]}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="year-label" sx={{ color: 'black' }}>Year</InputLabel>
              <Select
                labelId="year-label"
                value={selectedYear}
                label="Year"
                onChange={e => handleMonthYearChange(selectedMonth, Number(e.target.value))}
                sx={{ color: 'black' }}
                inputProps={{ style: { color: 'black' } }}
              >
                {[...new Set(getModalMonthYearRange().map(({ year }) => year))].map(year => (
                  <MenuItem key={year} value={year} sx={{ color: 'black' }}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography gutterBottom sx={{ color: 'black' }}>Progress: {reviewProgress}%</Typography>
            <Slider
              value={reviewProgress}
              onChange={(_, v) => setReviewProgress(Number(v))}
              min={0}
              max={100}
              step={1}
              valueLabelDisplay="auto"
              sx={{ mb: 2, color: 'black' }}
            />
            <TextField
              label="Notes"
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="text" onClick={() => setReviewModal({ open: false })} disabled={modalLoading} sx={{ color: 'black' }}>
                Cancel
              </Button>
              {reviewId && (
                <Button variant="outlined" color="error" onClick={handleDeleteReview} disabled={modalLoading} sx={{ color: 'black', borderColor: 'black', '&:hover': { backgroundColor: '#f5c6cb' } }}>
                  Delete Review
                </Button>
              )}
              <Button variant="contained" color="primary" onClick={handleSaveReview} disabled={modalLoading} sx={{ color: '#fff', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
        {/* Quarterly Review Modal */}
        <Modal open={quarterlyModal.open} onClose={() => setQuarterlyModal({ open: false })}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95vw', sm: 600, md: 650 },
            maxWidth: '98vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            color: 'black',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <Typography variant="h6" mb={2} sx={{ color: 'black' }}>Quarterly Review</Typography>
            <Typography sx={{ mb: 2, color: 'black' }}>
              Quarter: <b>{quarterlyModal.quarter}</b> &nbsp; Year: <b>{quarterlyModal.year}</b>
            </Typography>
            <Typography gutterBottom sx={{ color: 'black' }}>OKR Grading (0.0 - 1.0): {quarterlyFields.grading}</Typography>
            <Slider
              value={quarterlyFields.grading}
              onChange={(_, v) => setQuarterlyFields(f => ({ ...f, grading: typeof v === 'number' ? v : 0 }))}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              sx={{ mb: 2, color: 'black' }}
            />
            <TextField
              label="Lessons Learned"
              value={quarterlyFields.lessonsLearned}
              onChange={e => setQuarterlyFields(f => ({ ...f, lessonsLearned: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <TextField
              label="Strategic Adjustment"
              value={quarterlyFields.strategicAdjustment}
              onChange={e => setQuarterlyFields(f => ({ ...f, strategicAdjustment: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <TextField
              label="Next Quarter Planning"
              value={quarterlyFields.nextQuarterPlanning}
              onChange={e => setQuarterlyFields(f => ({ ...f, nextQuarterPlanning: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <TextField
              label="Engagement Levels"
              value={quarterlyFields.engagement}
              onChange={e => setQuarterlyFields(f => ({ ...f, engagement: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <TextField
              label="Action Item Completion"
              value={quarterlyFields.actionCompletion}
              onChange={e => setQuarterlyFields(f => ({ ...f, actionCompletion: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <TextField
              label="Strategic Alignment"
              value={quarterlyFields.strategicAlignment}
              onChange={e => setQuarterlyFields(f => ({ ...f, strategicAlignment: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <TextField
              label="Feedback Quality"
              value={quarterlyFields.feedbackQuality}
              onChange={e => setQuarterlyFields(f => ({ ...f, feedbackQuality: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 2, color: 'black' }}
              InputLabelProps={{ style: { color: 'black' } }}
              InputProps={{ style: { color: 'black' } }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="text" onClick={() => setQuarterlyModal({ open: false })} disabled={quarterlyModalLoading} sx={{ color: 'black' }}>
                Cancel
              </Button>
              {quarterlyReviewId && (
                <Button variant="outlined" color="error" onClick={handleDeleteQuarterlyReview} disabled={quarterlyModalLoading} sx={{ color: 'black', borderColor: 'black', '&:hover': { backgroundColor: '#f5c6cb' } }}>
                  Delete Review
                </Button>
              )}
              <Button variant="contained" color="primary" onClick={handleSaveQuarterlyReview} disabled={quarterlyModalLoading} sx={{ color: '#fff', backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#1565c0' } }}>
                Save
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}