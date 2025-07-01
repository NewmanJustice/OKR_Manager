"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import zxcvbn from "zxcvbn";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Image from 'next/image';
import HCaptcha from "react-hcaptcha";

export default function ResetPasswordPageInner() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    const result = zxcvbn(val);
    setPasswordScore(result.score);
    setPasswordFeedback(result.feedback.suggestions[0] || "");
  };

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
    if (!captcha) {
      setError("Please complete the captcha.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, captcha }),
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <Image src="/globe.svg" alt="OKR Manager Logo" width={48} height={48} style={{ marginBottom: 8 }} />
          <Typography level="h4" sx={{ fontWeight: 700, fontSize: '1.875rem', color: '#222', textAlign: 'center', mb: 1 }}>
            OKR Manager
          </Typography>
        </div>
        <Typography level="title-lg" sx={{ fontWeight: 600, color: '#222', textAlign: 'center', mb: 2 }}>
          Reset Password
        </Typography>
        <Divider sx={{ width: "100%", mb: 2 }} />
        {error && (
          <Sheet variant="soft" color="danger" sx={{ mb: 2, p: 1, display: 'flex', alignItems: 'center', borderRadius: 'sm', backgroundColor: '#fff0f0' }}>
            <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
            <Typography level="body-sm" color="danger" sx={{ fontWeight: 500 }} aria-live="polite">
              {error}
            </Typography>
          </Sheet>
        )}
        {success && (
          <Sheet variant="soft" color="success" sx={{ mb: 2, p: 1, display: 'flex', alignItems: 'center', borderRadius: 'sm', backgroundColor: '#f0fff0' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography level="body-sm" color="success" sx={{ fontWeight: 500 }} aria-live="polite">
              {success}
            </Typography>
          </Sheet>
        )}
        <form onSubmit={handleSubmit} className="w-full mb-4" style={{ paddingTop: "1em" }}>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={handlePasswordChange}
            required
            sx={{ mb: 1 }}
            autoComplete="new-password"
          />
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden', marginBottom: 2 }}>
              <div style={{ width: `${(passwordScore + 1) * 20}%`, height: '100%', background: ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#27ae60"][passwordScore], transition: 'width 0.3s' }} />
            </div>
            <Typography level="body-xs" sx={{ color: passwordScore < 3 ? '#e74c3c' : '#2ecc71' }}>
              {password ? (passwordScore < 3 ? "Password is weak" : "Password is strong") : ""}
              {passwordFeedback && <span style={{ marginLeft: 8 }}>{passwordFeedback}</span>}
            </Typography>
          </div>
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
          <Button type="submit" fullWidth variant="solid" size="md" sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#e8890c', color: '#fff' }, borderRadius: 0 }} disabled={Boolean(loading || (password && passwordScore < 3))}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
        <div style={{ marginTop: 16, display: captchaReady ? 'block' : 'none' }}>
          <HCaptcha
            sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
            onVerify={setCaptcha}
            style={{ width: '100%' }}
          />
        </div>
      </Sheet>
    </main>
  );
}
