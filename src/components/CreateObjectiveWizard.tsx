"use client";
import React, { useState } from "react";
import {
  Box, Button, Stepper, Step, StepLabel, Typography, TextField, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useRouter } from "next/navigation";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { enGB } from "date-fns/locale/en-GB";

// Types for KR and SC
interface SuccessCriteria {
  description: string;
  threshold: string;
}
interface KeyResult {
  title: string;
  description?: string;
  metric: string;
  targetValue: string;
  successCriteria: SuccessCriteria[];
}

const steps = ["Objective Details", "Key Results", "Success Criteria", "Review & Submit"];

export default function CreateObjectiveWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [objective, setObjective] = useState({ title: "", description: "", dueDate: "" });
  const [keyResults, setKeyResults] = useState<KeyResult[]>([
    { title: "", description: "", metric: "", targetValue: "", successCriteria: [{ description: "", threshold: "" }] }
  ]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Validation helpers
  const validateObjective = () => objective.title && objective.dueDate;
  const validateKeyResults = () => keyResults.length > 0 && keyResults.every(kr => kr.title && kr.metric && kr.targetValue && kr.successCriteria.length > 0);
  const validateSuccessCriteria = () => keyResults.every(kr => kr.successCriteria.every(sc => sc.description && sc.threshold));

  const handleNext = () => {
    setError("");
    if (activeStep === 0 && !validateObjective()) {
      setError("Please fill in the objective title and due date.");
      return;
    }
    if (activeStep === 1 && !validateKeyResults()) {
      setError("Each key result must have a title, metric, target value, and at least one success criteria.");
      return;
    }
    if (activeStep === 2 && !validateSuccessCriteria()) {
      setError("Each success criteria must have a description and threshold.");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  const handleCancel = () => {
    setConfirmCancel(true);
  };

  const confirmCancelAction = () => {
    setConfirmCancel(false);
    router.push("/"); // Redirect to root
  };

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setObjective({ ...objective, [e.target.name]: e.target.value });
  };

  const handleKRChange = (idx: number, field: keyof Omit<KeyResult, 'successCriteria'>, value: string) => {
    const newKRs = [...keyResults];
    newKRs[idx][field] = value;
    setKeyResults(newKRs);
  };

  const handleAddKR = () => {
    setKeyResults([...keyResults, { title: "", description: "", metric: "", targetValue: "", successCriteria: [{ description: "", threshold: "" }] }]);
  };

  const handleRemoveKR = (idx: number) => {
    if (keyResults.length === 1) return;
    setKeyResults(keyResults.filter((_, i) => i !== idx));
  };

  const handleAddSC = (krIdx: number) => {
    const newKRs = [...keyResults];
    newKRs[krIdx].successCriteria.push({ description: "", threshold: "" });
    setKeyResults(newKRs);
  };

  const handleRemoveSC = (krIdx: number, scIdx: number) => {
    const newKRs = [...keyResults];
    if (newKRs[krIdx].successCriteria.length === 1) return;
    newKRs[krIdx].successCriteria = newKRs[krIdx].successCriteria.filter((_, i) => i !== scIdx);
    setKeyResults(newKRs);
  };

  const handleSCChange = (krIdx: number, scIdx: number, field: keyof SuccessCriteria, value: string) => {
    const newKRs = [...keyResults];
    newKRs[krIdx].successCriteria[scIdx][field] = value;
    setKeyResults(newKRs);
  };

  const handleSubmit = async () => {
    setError("");
    try {
      const res = await fetch("/api/objectives/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...objective, keyResults }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create objective.");
        return;
      }
      router.push("/"); // Redirect to root after submit
    } catch (e) {
      setError("Failed to create objective.");
    }
  };

  return (
    <Paper sx={{ maxWidth: 800, mx: "auto", mt: 6, p: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box mt={4}>
        {error && <Typography color="error" mb={2}>{error}</Typography>}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" mb={2}>Enter Objective Details</Typography>
            <TextField label="Title" name="title" value={objective.title} onChange={handleObjectiveChange} fullWidth margin="normal" required />
            <TextField label="Description" name="description" value={objective.description} onChange={handleObjectiveChange} fullWidth margin="normal" multiline rows={2} />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
              <DatePicker
                label="Due Date"
                value={objective.dueDate ? new Date(objective.dueDate) : null}
                onChange={(date: Date | null) => {
                  if (date && date < new Date(new Date().toISOString().slice(0, 10))) {
                    setError("Due date cannot be in the past.");
                    return;
                  }
                  setObjective({ ...objective, dueDate: date ? date.toISOString().slice(0, 10) : "" });
                }}
                minDate={new Date(new Date().toISOString().slice(0, 10))}
                format="dd/MM/yyyy"
                slotProps={{ textField: { fullWidth: true, margin: "normal", required: true } }}
              />
            </LocalizationProvider>
          </Box>
        )}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" mb={2}>Add Key Results</Typography>
            {keyResults.map((kr, idx) => (
              <Paper key={idx} sx={{ p: 2, mb: 2, position: 'relative' }} variant="outlined">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flex: '1 1 100%' }}>
                    <TextField label="Title" value={kr.title} onChange={e => handleKRChange(idx, "title", e.target.value)} fullWidth required />
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <TextField label="Description (optional)" value={kr.description || ""} onChange={e => handleKRChange(idx, "description", e.target.value)} fullWidth multiline rows={2} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2 }}>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
                    <TextField label="Metric" value={kr.metric} onChange={e => handleKRChange(idx, "metric", e.target.value)} fullWidth required />
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
                    <TextField label="Target Value" value={kr.targetValue} onChange={e => handleKRChange(idx, "targetValue", e.target.value)} fullWidth required />
                  </Box>
                  <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' }, display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleRemoveKR(idx)} disabled={keyResults.length === 1} color="error"><RemoveIcon /></IconButton>
                    <IconButton onClick={handleAddKR} color="primary"><AddIcon /></IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" mb={2}>Add Success Criteria for Each Key Result</Typography>
            {keyResults.map((kr, krIdx) => (
              <Paper key={krIdx} sx={{ p: 2, mb: 2 }} variant="outlined">
                <Typography fontWeight="bold" mb={1}>Key Result: {kr.title || `#${krIdx + 1}`}</Typography>
                {kr.successCriteria.map((sc, scIdx) => (
                  <Box key={scIdx} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 1 }}>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 41.666%' } }}>
                      <TextField label="Description" value={sc.description} onChange={e => handleSCChange(krIdx, scIdx, "description", e.target.value)} fullWidth required />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 41.666%' } }}>
                      <TextField label="Threshold" value={sc.threshold} onChange={e => handleSCChange(krIdx, scIdx, "threshold", e.target.value)} fullWidth required />
                    </Box>
                    <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 16.666%' }, display: 'flex', gap: 1 }}>
                      <IconButton onClick={() => handleRemoveSC(krIdx, scIdx)} disabled={kr.successCriteria.length === 1} color="error"><RemoveIcon /></IconButton>
                      <IconButton onClick={() => handleAddSC(krIdx)} color="primary"><AddIcon /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Paper>
            ))}
          </Box>
        )}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" mb={2}>Review & Submit</Typography>
            <Paper sx={{ p: 3, mb: 2, border: '1px solid', borderColor: 'black', borderRadius: 2, bgcolor: 'background.paper' }} elevation={0}>
              <Typography fontWeight="bold" variant="subtitle1" mb={1} color="primary.main" sx={{ color: 'black' }}>Objective</Typography>
              <Box mb={2}>
                <Typography variant="body1" sx={{ color: 'black' }}><strong>Title:</strong> {objective.title}</Typography>
                <Typography variant="body1" sx={{ color: 'black' }}><strong>Description:</strong> {objective.description || <em>No description</em>}</Typography>
                <Typography variant="body1" sx={{ color: 'black' }}><strong>Due Date:</strong> {objective.dueDate}</Typography>
              </Box>
              <Typography fontWeight="bold" variant="subtitle1" mb={1} color="primary.main" sx={{ color: 'black' }}>Key Results</Typography>
              {keyResults.map((kr, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'black', borderRadius: 1 }} elevation={0}>
                  <Typography variant="body1" fontWeight="bold" color="secondary.main" sx={{ color: 'black' }}>KR {idx + 1}: {kr.title}</Typography>
                  <Typography variant="body2" mb={1} sx={{ color: 'black' }}>
                    <strong>Metric:</strong> {kr.metric} &nbsp; | &nbsp; <strong>Target:</strong> {kr.targetValue}
                  </Typography>
                  {kr.description && (
                    <Typography variant="body2" mb={1} sx={{ color: 'black' }}><strong>Description:</strong> {kr.description}</Typography>
                  )}
                  <Box ml={2}>
                    <Typography variant="body2" fontWeight="bold" color="text.secondary" mb={0.5}>Success Criteria:</Typography>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {kr.successCriteria.map((sc, scIdx) => (
                        <li key={scIdx} style={{ marginBottom: 4 }}>
                          <span><strong style={{ color: 'black' }}>{sc.description}</strong> <span style={{ color: '#888' }}>(Threshold: {sc.threshold})</span></span>
                        </li>
                      ))}
                    </ul>
                  </Box>
                </Paper>
              ))}
            </Paper>
          </Box>
        )}
      </Box>
      <Box mt={4} display="flex" justifyContent="space-between">
        <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
        <Button color="error" onClick={handleCancel}>Cancel</Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>Next</Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
        )}
      </Box>
      <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
        <DialogTitle>Cancel Objective Creation?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel? All unsaved data will be lost.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancel(false)}>No</Button>
          <Button color="error" onClick={confirmCancelAction}>Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
