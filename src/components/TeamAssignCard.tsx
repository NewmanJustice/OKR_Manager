import React, { useState, useEffect } from "react";
import { Box, Typography, Autocomplete, TextField, Button, List, ListItem, ListItemText, IconButton, CircularProgress, Alert, Chip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

interface UserOption {
  id: number;
  name: string;
  email: string;
  jobRole?: { name: string };
}

interface TeamMember {
  id: number;
  assignedAt: string;
  user: UserOption;
}

const TeamAssignCard: React.FC = () => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch team members
  useEffect(() => {
    async function fetchTeam() {
      setTeamLoading(true);
      setError("");
      try {
        const res = await fetch("/api/team/list");
        const data = await res.json();
        setTeam(data.team || []);
      } catch {
        setError("Failed to load team members.");
      } finally {
        setTeamLoading(false);
      }
    }
    fetchTeam();
  }, []);

  // Search users
  useEffect(() => {
    let active = true;
    if (search.length < 2) {
      setOptions([]);
      return;
    }
    async function fetchOptions() {
      const res = await fetch(`/api/team/search-users?query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (active) setOptions(data.users || []);
    }
    fetchOptions();
    return () => { active = false; };
  }, [search]);

  // Assign user
  const handleAssign = async () => {
    if (!selectedUser) return;
    setAssignLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/team/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUser.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to assign user.");
      } else {
        setSuccess("User assigned to your team.");
        setSelectedUser(null);
        // Refresh team list
        const res2 = await fetch("/api/team/list");
        const data2 = await res2.json();
        setTeam(data2.team || []);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAssignLoading(false);
    }
  };

  // Remove user
  const handleRemove = async (userId: number) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/team/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to remove user.");
      } else {
        setSuccess("User removed from your team.");
        setTeam(team.filter(t => t.user.id !== userId));
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <Box sx={{ width: 400 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Autocomplete
        options={options}
        getOptionLabel={opt => `${opt.name} (${opt.email})${opt.jobRole?.name ? ' - ' + opt.jobRole.name : ''}`}
        value={selectedUser}
        onChange={(_e, val) => setSelectedUser(val)}
        onInputChange={(_e, val) => setSearch(val)}
        loading={search.length >= 2 && options.length === 0}
        renderInput={params => (
          <TextField {...params} label="Search active users" variant="outlined" fullWidth margin="normal" />
        )}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" color="primary" fullWidth disabled={!selectedUser || assignLoading} onClick={handleAssign} sx={{ mb: 2 }}>
        {assignLoading ? <CircularProgress size={20} /> : "Assign to My Team"}
      </Button>
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
        Team Members
      </Typography>
      {teamLoading ? <CircularProgress /> : (
        <List>
          {team.length === 0 && <ListItem><ListItemText primary="No team members assigned." /></ListItem>}
          {team.map(member => (
            <ListItem key={member.id} secondaryAction={
              <IconButton edge="end" aria-label="remove" onClick={() => handleRemove(member.user.id)}>
                <DeleteIcon />
              </IconButton>
            }>
              <ListItemText
                primary={member.user.name}
                secondary={
                  <span>
                    {member.user.email}
                    {member.user.jobRole?.name && <span> &mdash; {member.user.jobRole.name}</span>}
                    <span style={{ marginLeft: 8, display: 'inline-block', verticalAlign: 'middle' }}>
                      <Chip label={`Assigned: ${new Date(member.assignedAt).toLocaleDateString()}`} size="small" />
                    </span>
                  </span>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default TeamAssignCard;
