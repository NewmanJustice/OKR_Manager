"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import HCaptchaWidget from "@/components/HCaptchaWidget";
import zxcvbn from "zxcvbn";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Avatar from "@mui/joy/Avatar";
import Box from "@mui/joy/Box";
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", name: "", roleId: "" });
  const [roles, setRoles] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data: { id: number; name: string; description?: string }[]) => setRoles(data.filter((r) => r.name !== 'Admin')));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleRoleChange = (_: unknown, value: string | null) => {
    setForm({ ...form, roleId: value || "" });
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    const val = e.target.value;
    const result = zxcvbn(val);
    setPasswordScore(result.score);
    setPasswordFeedback(result.feedback.suggestions[0] || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!captcha) {
      setError("Please complete the CAPTCHA.");
      return;
    }
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, captcha }),
    });
    if (res.ok) {
      setSuccess(true);
      // Removed automatic redirect. User must click the button to navigate away.
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "#000" }}>
            <InsertChartOutlinedIcon sx={{ color: '#fff' }} />
          </Avatar>
          <Typography component="h3" level="h3" sx={{ fontWeight: 700, color: '#222', mb: 0.5, letterSpacing: 1 }}>
            OKR Manager
          </Typography>
          <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}>
            Track and manage OKRs
          </Typography>
          <Typography level="title-lg" sx={{ fontWeight: 600, color: '#222', mb: 2, letterSpacing: 0.5 }}>
            Register
          </Typography>
        </Box>
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
          <Sheet variant="soft" color="success" sx={{ mb: 2, p: 1, display: 'flex', alignItems: 'center', borderRadius: 'sm', backgroundColor: '#f0fff0', flexDirection: 'column' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography level="body-sm" color="success" sx={{ fontWeight: 500, mb: 1 }} aria-live="polite">
              Registration successful! Please check your email to verify your account before logging in.
            </Typography>
            <Button
              variant="solid"
              color="primary"
              fullWidth
              onClick={() => router.push('/login')}
              sx={{ mt: 1, borderRadius: 0 }}
            >
              Go to Login
            </Button>
          </Sheet>
        )}
        {!success && (
          <form onSubmit={handleSubmit} className="w-full mb-4" style={{ paddingTop: "1em" }}>
            <FormControl sx={{ mb: 2 }} required>
              <FormLabel>Name</FormLabel>
              <Input name="name" value={form.name} onChange={handleChange} autoComplete="name" />
            </FormControl>
            <FormControl sx={{ mb: 2 }} required>
              <FormLabel>Email</FormLabel>
              <Input name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
            </FormControl>
            <FormControl sx={{ mb: 2 }} required>
              <FormLabel>Password</FormLabel>
              <Input name="password" type="password" value={form.password} onChange={handlePasswordChange} autoComplete="new-password" />
              <div style={{ marginTop: 4, marginBottom: 4 }}>
                <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden', marginBottom: 2 }}>
                  <div style={{ width: `${(passwordScore + 1) * 20}%`, height: '100%', background: ["#e74c3c","#e67e22","#f1c40f","#2ecc71","#27ae60"][passwordScore], transition: 'width 0.3s' }} />
                </div>
                <Typography level="body-xs" sx={{ color: passwordScore < 3 ? '#e74c3c' : '#2ecc71' }}>
                  {form.password ? (passwordScore < 3 ? "Password is weak" : "Password is strong") : ""}
                  {passwordFeedback && <span style={{ marginLeft: 8 }}>{passwordFeedback}</span>}
                </Typography>
              </div>
              <Typography level="body-xs" sx={{ mt: 0.5, color: '#888' }}>
                Password must be at least 8 characters long.
              </Typography>
            </FormControl>
            <FormControl sx={{ mb: 3 }} required>
              <FormLabel>Role</FormLabel>
              <Select value={form.roleId} onChange={handleRoleChange} name="roleId" required>
                {roles.map((role) => (
                  <Option key={role.id} value={role.id.toString()}>{role.name}</Option>
                ))}
              </Select>
            </FormControl>
            <div className="hcaptcha-box" style={{ width: '100%' }}>
              <HCaptchaWidget
                sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
                onVerify={setCaptcha}
              />
            </div>
            <Button
              type="submit"
              fullWidth
              variant="solid"
              size="md"
              sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#e8890c', color: '#fff' }, borderRadius: 0 }}
              disabled={
                form.password.length > 0 && (form.password.length < 8 || passwordScore < 3) || !captcha
              }
            >
              Register
            </Button>
          </form>
        )}
      </Sheet>
    </main>
  );
}
