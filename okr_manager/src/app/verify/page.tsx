"use client";
import { useEffect, useState } from "react";
import { Box, Typography, Button, Alert } from "@mui/joy";
import { useRouter } from "next/navigation";
import Sheet from "@mui/joy/Sheet";

export default function VerifyPage() {
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  // Get token from URL (client-side only)
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = new URLSearchParams(window.location.search).get("token");
      setToken(t);
    }
  }, []);

  // Automatically verify on mount if token is present
  useEffect(() => {
    if (token && status === "idle") {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleVerify = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    setStatus("verifying");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Account verified successfully. You may now log in.");
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed.");
      }
    } catch {
      setStatus("error");
      setMessage("Verification failed. Please try again later.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <Sheet
        variant="outlined"
        sx={{
          width: 400,
          mx: "auto",
          my: 8,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "md",
          boxShadow: "lg",
          backgroundColor: "background.body",
        }}
      >
        <Typography level="h4" sx={{ mb: 2, fontWeight: 700, color: '#222' }}>
          Email Verification
        </Typography>
        {status === "verifying" && <Alert color="primary">Verifying...</Alert>}
        {status === "success" && (
          <>
            <Alert color="success" sx={{ mb: 2 }}>Thank you for verifying your email address!</Alert>
            <Typography level="body-md" sx={{ mb: 2 }}>{message}</Typography>
            <Button
              fullWidth
              variant="solid"
              color="primary"
              onClick={() => router.push('/login')}
              sx={{ borderRadius: 0 }}
            >
              Go to Login
            </Button>
          </>
        )}
        {status === "error" && <Alert color="danger">{message}</Alert>}
        {status === "idle" && <Alert color="neutral">Preparing verification...</Alert>}
      </Sheet>
    </main>
  );
}
