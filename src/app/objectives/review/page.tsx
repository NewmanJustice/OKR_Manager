"use client";
import React, { useEffect, useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, List, ListItem, ListItemText, Button } from "@mui/material";

interface Objective {
  guid: string;
  title: string;
  dueDate: string;
  keyResults: KeyResult[];
  completed?: boolean;
}
interface KeyResult {
  id: number;
  title: string;
  metric: string;
  targetValue: string;
  successCriteria?: SuccessCriterion[];
}
interface SuccessCriterion {
  id: number;
  description: string;
  threshold?: string;
}

export default function OKRReviewPage() {
  const [sideNavOpen, setSideNavOpen] = React.useState(true);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);

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
                          {obj.keyResults.map((kr, krIdx) => (
                            <ListItem key={kr.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 1, width: '100%', border: '1.5px solid #888', borderRadius: 2, p: 1, background: '#fafafa' }}>
                              <Typography sx={{ color: 'black', fontWeight: 500 }}>{`KR ${krIdx + 1}: ${kr.title}`}</Typography>
                              <Typography sx={{ color: 'black', fontSize: 14, mb: 0.5 }}><strong>Metric:</strong> {kr.metric} | <strong>Target:</strong> {kr.targetValue}</Typography>
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
                          ))}
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
      </Box>
    </Box>
  );
}