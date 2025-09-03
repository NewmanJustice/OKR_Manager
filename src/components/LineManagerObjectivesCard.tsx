import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Collapse, Paper, CircularProgress } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

export default function LineManagerObjectivesCard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [objectives, setObjectives] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lineManagerName, setLineManagerName] = useState<string>("");

  // Fetch line manager name on mount
  useEffect(() => {
    async function fetchName() {
      try {
        const res = await fetch("/api/objectives/line-manager");
        const data = await res.json();
        if (res.ok && data.lineManagerName) {
          setLineManagerName(data.lineManagerName);
        }
      } catch {}
    }
    fetchName();
  }, []);

  const handleToggle = async () => {
    if (!open && objectives.length === 0) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/objectives/line-manager");
        const data = await res.json();
        if (res.ok) {
          setObjectives(data.objectives || []);
          setLineManagerName(data.lineManagerName && data.lineManagerName.trim() ? data.lineManagerName : "Line Manager");
        } else {
          setError(data.error || "Failed to fetch objectives");
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch objectives");
      }
      setLoading(false);
    }
    setOpen((prev) => !prev);
  };

  return (
    <Paper sx={{ maxWidth: 600, mx: "auto", mt: 6, p: 4}}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" noWrap>
          {lineManagerName ? `${lineManagerName}'s Objectives` : "Line Manager's Objectives"}
        </Typography>
        <IconButton onClick={handleToggle} aria-label={open ? "Hide" : "Show"} size="small">
          {open ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error" sx={{ py: 2 }}>{error}</Typography>
        ) : objectives.length === 0 ? (
          <Typography sx={{ py: 2 }}>No objectives found for your line manager.</Typography>
        ) : (
          <Box>
            {objectives.map((obj) => (
              <Box key={obj.id} sx={{ mb: 3, p: 2, border: '1px solid #eee', borderRadius: 1, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle1" fontWeight="bold">{obj.title}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{obj.description}</Typography>
                {obj.keyResults?.length > 0 && (
                  <Box sx={{ ml: 2, mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">Key Results:</Typography>
                    {obj.keyResults.map((kr: any) => (
                      <Box key={kr.id} sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="bold">- {kr.title}</Typography>
                        <Typography variant="body2" sx={{ ml: 2 }}>Metric: {kr.metric}, Target: {kr.targetValue}</Typography>
                        {kr.successCriteria?.length > 0 && (
                          <Box sx={{ ml: 4 }}>
                            <Typography variant="caption" fontWeight="bold">Success Criteria:</Typography>
                            {kr.successCriteria.map((sc: any) => (
                              <Typography key={sc.id} variant="caption" sx={{ ml: 2, display: 'block' }}>- {sc.description} (Threshold: {sc.threshold})</Typography>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Collapse>
    </Paper>
  );
}
