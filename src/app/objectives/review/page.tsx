"use client";
import React, { useEffect, useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, List, ListItem, ListItemText, Button, Modal, Slider, TextField, IconButton, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import RateReviewIcon from "@mui/icons-material/RateReview";

interface Objective {
  guid: string;
  title: string;
  dueDate: string;
  createdAt?: string;
  keyResults: KeyResult[];
  completed?: boolean;
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

  // Open modal for KR
  function openReviewModal(kr: any, obj: any) {
    setReviewModal({ open: true, kr, obj });
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    const review = getReviewForMonth(kr, new Date().getMonth() + 1, new Date().getFullYear());
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
                  {objectives.map((obj, idx) => (
                    <ListItem key={obj.guid} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2, width: '100%', border: '2px solid black', borderRadius: 2, p: 2 }}>
                      <Typography variant="h6" sx={{ color: 'black', fontWeight: 600 }}>{`Objective ${idx + 1}: ${obj.title}`}</Typography>
                      <Typography sx={{ color: 'black', mb: 1 }}><strong>Due Date:</strong> {obj.dueDate ? new Date(obj.dueDate).toLocaleDateString('en-GB') : '-'}</Typography>
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
                                  <IconButton sx={{ color: 'black' }} onClick={() => openReviewModal(kr, obj)} size="small"><RateReviewIcon /></IconButton>
                                </Box>
                                <Typography sx={{ color: 'black', fontSize: 14, mb: 0.5 }}><strong>Metric:</strong> {kr.metric} | <strong>Target:</strong> {kr.targetValue}</Typography>
                                {/* Review summary table */}
                                <Box sx={{ width: '100%', mt: 1, mb: 1 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: 15, color: 'black', mb: 0.5 }}>Monthly Reviews:</Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {monthYearRange.map(({ month, year }) => {
                                      const review = kr.reviews?.find((r: any) => r.month === month && r.year === year);
                                      const label = `${months[month - 1].slice(0, 3)} ${year}`;
                                      return (
                                        <Box key={label} sx={{ minWidth: 80, p: 1, border: '1px solid #ccc', borderRadius: 1, background: review ? '#e0ffe0' : '#f5f5f5', textAlign: 'center' }}>
                                          <Typography sx={{ fontSize: 13, color: 'black' }}>{label}</Typography>
                                          <Typography sx={{ fontSize: 13, color: review ? 'green' : '#888' }}>{review ? `${review.progress}%` : '-'}</Typography>
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
                  ))}
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
      </Box>
    </Box>
  );
}