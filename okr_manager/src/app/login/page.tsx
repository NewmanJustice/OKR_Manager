"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import Link from "next/link";
import HCaptcha from "react-hcaptcha";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Warning about <img>: Consider replacing <img> with <Image /> from next/image for optimization.

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (showCaptcha && !captcha) {
      setError("Please complete the CAPTCHA.");
      return;
    }
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(showCaptcha ? { ...form, captcha } : form),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      setShowCaptcha(false);
      setCaptcha(null);
      setFailedAttempts(0);
      if (data.isAdmin) {
        router.push("/admin");
      } else if (data.isLineManager) {
        router.push("/pdm");
      } else {
        router.push("/user");
      }
    } else {
      setFailedAttempts((prev) => prev + 1);
      if (failedAttempts + 1 >= 3) {
        setShowCaptcha(true);
      }
      setCaptcha(null);
      const data = await res.json();
      if (res.status === 401 || res.status === 400) {
        setError("Incorrect details");
      } else {
        setError(data.error || "Login failed");
      }
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
          borderRadius: 3,
          boxShadow: "0 4px 24px 0 rgba(0,0,0,0.08)",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img src="/globe.svg" alt="OKR Manager Logo" width={48} height={48} style={{ marginBottom: 12 }} />
          <Typography level="h4" sx={{ fontWeight: 700, color: '#222', mb: 0.5, letterSpacing: 1 }}>
            OKR Manager
          </Typography>
          <Typography level="title-lg" sx={{ fontWeight: 600, color: '#222', mb: 2, letterSpacing: 0.5 }}>
            Login
          </Typography>
        </div>
        <Divider sx={{ width: "100%", mb: 2 }} />
        {error && (
          <Sheet variant="soft" color="danger" sx={{ mb: 2, p: 1.5, display: 'flex', alignItems: 'center', borderRadius: 2, backgroundColor: '#fff0f0' }}>
            <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
            <Typography level="body-sm" color="danger" sx={{ fontWeight: 500 }} aria-live="polite">
              {error}
            </Typography>
          </Sheet>
        )}
        <form onSubmit={handleSubmit} className="w-full mb-4" style={{ paddingTop: "1em" }}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            sx={{ mb: 2, borderRadius: 2, fontSize: '1.05em', background: '#f7fafd' }}
            autoComplete="email"
          />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 2, borderRadius: 2, fontSize: '1.05em', background: '#f7fafd' }}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth variant="solid" size="md" sx={{ mb: 2, backgroundColor: '#000', color: '#fff', fontWeight: 700, borderRadius: 0, fontSize: '1.08em', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)', '&:hover': { backgroundColor: '#e8890c', color: '#fff' } }}>
            Sign In
          </Button>
          {/* Only show captcha after 3 failed attempts */}
          {showCaptcha && (
            <div className="hcaptcha-box" style={{ width: '100%' }}>
              <HCaptcha
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                onVerify={setCaptcha}
              />
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <Link href="/reset-password/request" style={{ color: '#1976d2', textDecoration: 'underline', fontSize: '0.97em', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
        </form>
      </Sheet>
    </main>
  );
}
