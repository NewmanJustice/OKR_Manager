"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Box, Typography, CircularProgress, Paper, List, ListItem, ListItemText } from "@mui/material";

const ObjectiveDetailsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const guid = params?.guid as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [objective, setObjective] = useState<any>(null);

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

  return (
    <Box mt={6} maxWidth={700} mx="auto">
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" mb={2} color="black">Objective Details</Typography>
        <Typography variant="h6" color="black">{objective.title}</Typography>
        <Typography color="text.secondary" mb={2}>{objective.description}</Typography>
        <Typography color="black" mb={2}><strong>Due Date:</strong> {new Date(objective.dueDate).toLocaleDateString('en-GB')}</Typography>
        <Typography variant="subtitle1" color="black" mb={1}>Key Results</Typography>
        <List>
          {objective.keyResults.map((kr: any, idx: number) => (
            <ListItem key={kr.id} alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'flex-start', mb: 2 }}>
              <ListItemText
                primary={<span style={{ color: 'black', fontWeight: 500 }}>{`KR ${idx + 1}: ${kr.title}`}</span>}
                secondary={
                  <div>
                    <span><strong>Metric:</strong> {kr.metric} | <strong>Target:</strong> {kr.targetValue}</span>
                    <div><strong>Success Criteria:</strong></div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {kr.successCriteria.map((sc: any, scIdx: number) => (
                        <li key={sc.id}><span style={{ color: 'black' }}>{sc.description}</span> <span style={{ color: '#888' }}>(Threshold: {sc.threshold})</span></li>
                      ))}
                    </ul>
                  </div>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ObjectiveDetailsPage;
