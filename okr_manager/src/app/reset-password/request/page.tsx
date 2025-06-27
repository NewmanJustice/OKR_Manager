"use client";
import { useState } from "react";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";

export default function RequestResetPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("If an account exists, a reset link has been sent to your email.");
      } else {
        setStatus("There was a problem. Please try again later.");
      }
    } catch {
      setStatus("There was a problem. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <Sheet
        variant="outlined"
        sx={{
          width: 400,
          mx: "auto",
          my: 4,
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "md",
          boxShadow: "lg",
          backgroundColor: "background.body",
        }}
      >
        <Typography level="h4" sx={{ fontWeight: 700, fontSize: '1.875rem', color: '#222', textAlign: 'center', mb: 2 }}>
          Request Password Reset
        </Typography>
        <Divider sx={{ width: "100%", mb: 2 }} />
        <form onSubmit={handleSubmit} className="w-full mb-4" style={{ paddingTop: "1em" }}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
            autoComplete="email"
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="solid"
            size="md"
            sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#e8890c', color: '#fff' } }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        {status && <Typography level="body-sm" sx={{ mt: 2, textAlign: 'center' }}>{status}</Typography>}
      </Sheet>
    </main>
  );
}
