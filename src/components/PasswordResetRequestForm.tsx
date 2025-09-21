import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";

const PasswordResetRequestForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!email.trim()) {
      setError("Email is required.");
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Invalid email address.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setSuccess("If your email is registered, you will receive a reset link.");
      setEmail("");
    } catch (err) {
      setError("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: 500, maxWidth: "100%", mx: "auto", mt: 8, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h5" mb={2} color="black">Reset Password</Typography>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          required
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        <Box sx={{ mt: 2, position: "relative" }}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>Send reset link</Button>
          {loading && <CircularProgress size={24} sx={{ position: "absolute", top: "50%", left: "50%", mt: -1.5, ml: -1.5 }} />}
        </Box>
      </form>
    </Box>
  );
};

export default PasswordResetRequestForm;
