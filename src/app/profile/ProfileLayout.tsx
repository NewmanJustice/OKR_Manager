"use client";
import React, { useState, useEffect } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, Paper, TextField, Button, Checkbox, FormControlLabel, Alert, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from "@mui/material";
import { useSession } from "next-auth/react";

export default function ProfileLayout() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const { data: session, update: updateSession } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    isLineManager: false,
    jobRoleId: ""
  });
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJobRoles() {
      const res = await fetch("/api/job-roles");
      if (res.ok) {
        const data = await res.json();
        setJobRoles(data.jobRoles || []);
      }
    }
    fetchJobRoles();
  }, []);

  useEffect(() => {
    if (session?.user) {
      setForm(f => ({
        ...f,
        name: session.user?.name || "",
        email: session.user?.email || "",
        isLineManager: (session.user as any).isLineManager || false,
        jobRoleId: (session.user as any).jobRoleId || ""
      }));
    }
  }, [session]);

  // Fetch isLineManager and jobRoleId on mount (for up-to-date value)
  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, isLineManager: data.user.isLineManager, jobRoleId: data.user.jobRoleId || "" }));
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    // Always fetch latest profile after session update
    async function fetchProfile() {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({
          ...f,
          name: data.user.name,
          email: data.user.email,
          isLineManager: data.user.isLineManager,
          jobRoleId: data.user.jobRoleId || ""
        }));
      }
    }
    fetchProfile();
  }, [session, success]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm(f => ({ ...f, [name!]: type === "checkbox" ? checked : value }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setForm(f => ({ ...f, jobRoleId: e.target.value as string }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!form.jobRoleId) {
      setError("Job role is required.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    setSuccess("Profile updated successfully");
    // Always update session after profile change
    await updateSession();
    setForm(f => ({ ...f, currentPassword: "", newPassword: "" }));
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'black', minHeight: '100vh' }}>
        <Paper elevation={2} sx={{ width: 'fit-content', p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3, boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Profile Page
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, width: 400 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            {/* Personal Details Section */}
            <Box sx={{ pt: 2, borderTop: '2px solid #eee', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Personal Details</Typography>
              <TextField
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                fullWidth
                margin="normal"
                required
              />
            </Box>
            {/* Password Section */}
            <Box sx={{ pt: 2, borderTop: '2px solid #eee', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Password</Typography>
              <TextField
                label="Current Password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                type="password"
                fullWidth
                margin="normal"
                required
              />
              <TextField
                label="New Password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                type="password"
                fullWidth
                margin="normal"
                helperText="Leave blank to keep current password"
              />
            </Box>
            {/* Role & Manager Section */}
            <Box sx={{ pt: 2, borderTop: '2px solid #eee', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Role & Manager Status</Typography>
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="job-role-label">Job Role</InputLabel>
                <Select
                  labelId="job-role-label"
                  id="jobRoleId"
                  name="jobRoleId"
                  value={form.jobRoleId}
                  label="Job Role"
                  onChange={handleSelectChange}
                  required
                  renderValue={selected => {
                    if (!selected) {
                      return <span style={{ color: '#888' }}>Select job role</span>;
                    }
                    const role = jobRoles.find((r: any) => r.id === selected);
                    return role && typeof role.name === 'string' ? role.name : '';
                  }}
                >
                  <MenuItem value="">
                    <em>Select job role</em>
                  </MenuItem>
                  {jobRoles.map((role: any) => (
                    <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={<Checkbox checked={form.isLineManager} onChange={handleChange} name="isLineManager" color="primary" />}
                label="I am a line manager"
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
