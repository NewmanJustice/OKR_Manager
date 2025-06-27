"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess("Your password has been reset. You can now log in.");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to reset password.");
    }
  };

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
          Reset Password
        </Typography>
        <Divider sx={{ width: "100%", mb: 2 }} />
        {error && (
          <Typography level="body-sm" color="danger" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {success && (
          <Typography level="body-sm" color="success" sx={{ mb: 2 }}>
            {success}
          </Typography>
        )}
        <form onSubmit={handleSubmit} className="w-full mb-4" style={{ paddingTop: "1em" }}>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
            autoComplete="new-password"
          />
          <Button type="submit" fullWidth variant="solid" size="md" sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#e8890c', color: '#fff' } }} disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Sheet>
    </main>
  );
}
