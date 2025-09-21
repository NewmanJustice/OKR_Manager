"use client";

import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";

const PasswordResetForm: React.FC = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams ? searchParams.get("token") : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("Invalid or missing token.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/password-reset/rest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      setSuccess("Your password has been reset successfully.");
      setPassword("");
    } catch (err: any) {
      setError(err?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h5" mb={2} color="black">Set New Password</Typography>
      <form onSubmit={handleSubmit} noValidate autoComplete="off">
        <TextField
          label="New Password"
          name="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
          inputProps={{ maxLength: 100 }}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" color="primary" fullWidth onClick={() => router.push("/")}>Go to Login</Button>
            </Box>
          </Alert>
        )}
        <Box sx={{ mt: 2, position: "relative" }}>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading || !!success}>Reset Password</Button>
          {loading && <CircularProgress size={24} sx={{ position: "absolute", top: "50%", left: "50%", mt: -1.5, ml: -1.5 }} />}
        </Box>
      </form>
    </Box>
  );
};

export default PasswordResetForm;
