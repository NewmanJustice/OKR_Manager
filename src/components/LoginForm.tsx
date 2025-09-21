"use client";
import React, { useState } from "react";
import { Box, Button, Link, TextField, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import NextLink from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) {
      // Remove surrounding quotes from error message if present
      let errorMsg = res.error;
      if (errorMsg.startsWith('"') && errorMsg.endsWith('"')) {
        errorMsg = errorMsg.slice(1, -1);
      }
      setError(errorMsg);
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <Typography variant="h4" align="center" mt={6} mb={2} color="white">
        Welcome to OKR Manager
      </Typography>
      <Box sx={{ maxWidth: 400, mx: "auto", mt: 2, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Typography variant="h5" mb={2} color="black">Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Email" fullWidth margin="normal" variant="outlined" color="primary" InputLabelProps={{ style: { color: '#333' } }} value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="normal" variant="outlined" color="primary" InputLabelProps={{ style: { color: '#333' } }} value={password} onChange={e => setPassword(e.target.value)} />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Box mt={2} textAlign="center">
          <Link component={NextLink} href="/register" underline="hover">
            Don't have an account? Register
          </Link>
          <br />
          <Button variant="text" color="primary" sx={{ mt: 1 }} onClick={() => setForgotOpen(true)}>
            Forgot password?
          </Button>
        </Box>
      </Box>
      <Dialog open={forgotOpen} onClose={() => { setForgotOpen(false); setForgotMsg(""); setForgotEmail(""); }} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            disabled={forgotLoading}
          />
          {forgotMsg && <Alert severity={forgotMsg.startsWith("Password reset link sent") ? "success" : "error"} sx={{ mt: 2 }}>{forgotMsg}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setForgotOpen(false); setForgotMsg(""); setForgotEmail(""); }} disabled={forgotLoading}>Cancel</Button>
          <Button
            onClick={async () => {
              setForgotLoading(true);
              setForgotMsg("");
              try {
                const res = await fetch("/api/password-reset", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: forgotEmail })
                });
                const data = await res.json();
                if (res.ok) {
                  setForgotMsg("Password reset link sent to your email (if registered). Please check your inbox.");
                } else {
                  setForgotMsg(data.error || "Failed to send reset link.");
                }
              } catch {
                setForgotMsg("Network error. Please try again.");
              } finally {
                setForgotLoading(false);
              }
            }}
            disabled={!forgotEmail || forgotLoading}
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LoginForm;
