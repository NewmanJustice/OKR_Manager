"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRouter, useSearchParams } from "next/navigation";

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const isValidInviteToken = !inviteToken || /^[0-9a-fA-F-]{36}$/.test(inviteToken);

  React.useEffect(() => {
    if (inviteToken && !isValidInviteToken) {
      setError("Invalid invite link format.");
      return;
    }
    if (inviteToken && isValidInviteToken) {
      setInviteLoading(true);
      fetch(`/api/invite-by-token?token=${inviteToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.invite) {
            setInviteStatus(data.invite.status);
            setInviteEmail(data.invite.email);
          } else {
            setInviteStatus("invalid");
          }
        })
        .finally(() => setInviteLoading(false));
    }
  }, [inviteToken, isValidInviteToken]);

  React.useEffect(() => {
    if (inviteToken && inviteEmail) {
      setForm((f) => ({ ...f, email: inviteEmail }));
    }
  }, [inviteToken, inviteEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCaptcha = (token: string) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    // Block registration if invite is used
    if (inviteToken && inviteStatus === "used") {
      setError("This invite link has already been used.");
      setLoading(false);
      return;
    }
    // Client-side validation
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Invalid email address.");
      setLoading(false);
      return;
    }
    if (
      form.password.length < 8 ||
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password) ||
      !/[^A-Za-z0-9]/.test(form.password)
    ) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
      );
      setLoading(false);
      return;
    }
    if (!captchaToken) {
      setError("Please complete the CAPTCHA.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: "user", captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess(
        "Registration successful! Please check your email to verify your account."
      );
      setForm({ name: "", email: "", password: "" });
      setCaptchaToken("");
      // Mark invite as used
      if (inviteToken) {
        await fetch("/api/invite/use", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: inviteToken }),
        });
      }
      // Redirect to home after short delay
      setTimeout(() => {
        router.push("/"); // Redirect to home page
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
      // Optionally log error to console for debugging
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 8,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h5" mb={2} color="black">
        Register
      </Typography>
      {inviteToken && inviteLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading invite details...
        </Alert>
      )}
      {inviteToken && !inviteLoading && inviteStatus === "used" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          This invite link has already been used.
        </Alert>
      )}
      {(!inviteToken || !inviteLoading) && (
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={inviteToken ? inviteEmail : form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            fullWidth
            required
            margin="normal"
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            inputProps={{ maxLength: 100 }}
          />
          <Box sx={{ mt: 2 }}>
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ""}
              onVerify={handleCaptcha}
            />
          </Box>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
          <Box sx={{ mt: 2, position: "relative" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
            >
              Register
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  mt: -1.5,
                  ml: -1.5,
                }}
              />
            )}
          </Box>
        </form>
      )}
    </Box>
  );
};

export default RegisterPage;
