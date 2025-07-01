"use client";
import * as React from "react";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import Textarea from '@mui/joy/Textarea';
import Box from '@mui/joy/Box';
import CircularProgress from '@mui/joy/CircularProgress';
import Markdown from 'react-markdown';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Divider from '@mui/joy/Divider';

// Add type for role descriptions
interface RoleDescription {
  roleName: string;
  description: string;
}

const ROLES = [
  "Principal Development Manager",
  "Admin",
  "User"
];

export default function RoleDescriptionsAdmin() {
  const [role, setRole] = React.useState(ROLES[0]);
  const [description, setDescription] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");
  const [roleDescriptions, setRoleDescriptions] = React.useState<RoleDescription[]>([]);
  const [listLoading, setListLoading] = React.useState(true);

  // Fetch all role descriptions for the list
  React.useEffect(() => {
    setListLoading(true);
    fetch('/api/role-description')
      .then(async res => {
        const data = await res.json();
        setRoleDescriptions(data.roleDescriptions || []);
        setListLoading(false);
      })
      .catch(() => setListLoading(false));
  }, []);

  // Fetch description for selected role
  React.useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/role-description?role=${encodeURIComponent(role)}`)
      .then(async res => {
        const data = await res.json();
        setDescription(data.description || "");
        setLoading(false);
      })
      .catch(() => {
        setDescription("");
        setLoading(false);
        setError("Failed to load description");
      });
  }, [role]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/role-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleName: role, description }),
    });
    if (res.ok) {
      setSuccess(true);
      // Refresh the list after save
      fetch('/api/role-description')
        .then(async res => {
          const data = await res.json();
          setRoleDescriptions(data.roleDescriptions || []);
        });
    } else {
      setError("Failed to save description");
    }
    setSaving(false);
  };

  // Helper: get preview for a role from the list
  const getPreview = (desc: string) => {
    if (!desc) return "_No description_";
    return desc.split("\n")[0].slice(0, 60) + (desc.length > 60 ? "..." : "");
  };

  return (
    <Box sx={{ width: '90vw', maxWidth: 1500, mx: "auto", mt: 4, display: 'flex', gap: 4 }}>
      <Card variant="outlined" sx={{ minWidth: 320, maxWidth: 350, p: 2, boxShadow: 'md', flex: '0 0 350px', height: 'fit-content' }}>
        <Typography level="h4" sx={{ mb: 2 }}>All Role Descriptions</Typography>
        {listLoading ? <CircularProgress /> : (
          <List>
            {roleDescriptions.length === 0 && <Typography level="body-sm">No role descriptions found.</Typography>}
            {roleDescriptions.map(rd => (
              <ListItem key={rd.roleName}>
                <ListItemButton selected={role === rd.roleName} onClick={() => setRole(rd.roleName)}>
                  <Box>
                    <Typography level="body-md" fontWeight={600}>{rd.roleName}</Typography>
                    <Typography level="body-sm" color="neutral" sx={{ fontStyle: 'italic' }}>{getPreview(rd.description)}</Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {/* Show roles that don't have a description yet */}
            {ROLES.filter(r => !roleDescriptions.some(rd => rd.roleName === r)).map(r => (
              <ListItem key={r}>
                <ListItemButton selected={role === r} onClick={() => setRole(r)}>
                  <Box>
                    <Typography level="body-md" fontWeight={600}>{r}</Typography>
                    <Typography level="body-sm" color="neutral" sx={{ fontStyle: 'italic' }}>_No description_</Typography>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Card>
      <Box sx={{ flex: 1 }}>
        <Card variant="outlined" sx={{ p: 4, boxShadow: 'lg' }}>
          <Typography level="h3" sx={{ mb: 2 }}>Role Descriptions</Typography>
          <Typography level="body-md" sx={{ mb: 2 }}>
            Select a role from the list and edit its Markdown description. This will be shown in the sidebar for users of that role.
          </Typography>
          <Select value={role} onChange={(_, v) => v && setRole(v)} sx={{ mb: 2, minWidth: 320 }}>
            {ROLES.map(r => (
              <Option key={r} value={r}>{r}</Option>
            ))}
          </Select>
          {loading ? <CircularProgress /> : (
            <Box>
              <Textarea
                minRows={8}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter Markdown description for this role..."
                sx={{ mb: 2, fontFamily: 'monospace', fontSize: 16 }}
              />
              <Button onClick={handleSave} loading={saving} sx={{ mb: 2, background: '#000', color: '#fff', '&:hover': { background: '#e8890c', color: '#fff' } }}>
                Save
              </Button>
              {success && <Typography color="success" sx={{ mb: 1 }}>Saved!</Typography>}
              {error && <Typography color="danger" sx={{ mb: 1 }}>{error}</Typography>}
              <Typography level="body-sm" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Preview:</Typography>
              <Card variant="soft" sx={{ p: 2, background: '#f9f9f9' }}>
                <Markdown>{description || "_No description yet_"}</Markdown>
              </Card>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
