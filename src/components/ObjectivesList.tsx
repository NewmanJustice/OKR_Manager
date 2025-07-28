import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemText } from "@mui/material";
import Link from "next/link";

interface Objective {
  id: number;
  title: string;
  dueDate: string;
}

interface ObjectivesListProps {
  userEmail?: string | null;
}

const ObjectivesList: React.FC<ObjectivesListProps> = ({ userEmail }) => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    fetch("/api/objectives/user")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setObjectives(data.objectives || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch objectives.");
        setLoading(false);
      });
  }, [userEmail]);

  if (!userEmail) return null;
  if (loading) return <Box mt={4}><CircularProgress /></Box>;
  if (error) return <Typography color="error" mt={4}>{error}</Typography>;

  return (
    <Box mt={6}>
      <Typography variant="h6" mb={2} color="black">Your Objectives</Typography>
      {objectives.length === 0 ? (
        <Box>
          <Typography color="text.secondary" mb={2}>You have no objectives yet.</Typography>
          <Button component={Link} href="/objectives/create" variant="outlined" color="primary">Create Objective</Button>
        </Box>
      ) : (
        <List>
          {objectives.map(obj => (
            <ListItem key={obj.id} sx={{ borderBottom: '1px solid #eee' }}>
              <ListItemText
                primary={<span style={{ color: 'black', fontWeight: 500 }}>{obj.title}</span>}
                secondary={`Due: ${new Date(obj.dueDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ObjectivesList;
