"use client";
import React, { useState } from "react";
import { Box, Button, Link, TextField, Typography, Alert } from "@mui/material";
import NextLink from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        </Box>
      </Box>
    </>
  );
};

export default LoginForm;
