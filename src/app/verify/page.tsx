"use client";
import React from "react";
import { Box, Typography, Alert, CircularProgress, Button } from "@mui/material";
import Link from "next/link";

const VerifyPage: React.FC = () => {
  const [status, setStatus] = React.useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = React.useState("");
  const [showResend, setShowResend] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendError, setResendError] = React.useState("");
  const [resendSuccess, setResendSuccess] = React.useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
    if (!t) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }
    fetch(`/api/verify?token=${t}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Your account has been verified. You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
          if (data.message && data.message.toLowerCase().includes("expired")) {
            setShowResend(true);
          }
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      });
  }, []);

  const handleResend = async () => {
    setResendLoading(true);
    setResendError("");
    setResendSuccess("");
    try {
      const res = await fetch("/api/verify/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend email");
      setResendSuccess("A new verification email has been sent. Please check your inbox.");
    } catch (err: any) {
      setResendError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h5" mb={2} color="black">Account Verification</Typography>
      {status === "pending" && <CircularProgress sx={{ mt: 2 }} />}
      {status === "success" && (
        <>
          <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>
          <Box sx={{ mt: 2 }}>
            <Link href="/" passHref>
              <Button variant="contained" color="primary" fullWidth>Go to Login</Button>
            </Link>
          </Box>
        </>
      )}
      {status === "error" && (
        <>
          <Alert severity="error" sx={{ mt: 2 }}>{message}</Alert>
          {showResend && (
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" color="primary" fullWidth onClick={handleResend} disabled={resendLoading}>
                {resendLoading ? "Resending..." : "Resend Verification Email"}
              </Button>
              {resendError && <Alert severity="error" sx={{ mt: 2 }}>{resendError}</Alert>}
              {resendSuccess && <Alert severity="success" sx={{ mt: 2 }}>{resendSuccess}</Alert>}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default VerifyPage;
