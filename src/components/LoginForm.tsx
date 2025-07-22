"use client";
import React from "react";
import { Box, Button, Link, TextField, Typography } from "@mui/material";
import NextLink from "next/link";

const LoginForm: React.FC = () => (
  <>
    <Typography variant="h4" align="center" mt={6} mb={2} color="white">
      Welcome to OKR Manager
    </Typography>
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 2, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h5" mb={2} color="black">Login</Typography>
      <TextField label="Email" fullWidth margin="normal" variant="outlined" color="primary" InputLabelProps={{ style: { color: '#333' } }} />
      <TextField label="Password" type="password" fullWidth margin="normal" variant="outlined" color="primary" InputLabelProps={{ style: { color: '#333' } }} />
      <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Login</Button>
      <Box mt={2} textAlign="center">
        <Link component={NextLink} href="/register" underline="hover">
          Don't have an account? Register
        </Link>
      </Box>
    </Box>
  </>
);

export default LoginForm;
