"use client";
import * as React from "react";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Link from "next/link";
import Box from "@mui/joy/Box";
import Divider from "@mui/joy/Divider";
import Avatar from "@mui/joy/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [tab, setTab] = React.useState<'login' | 'register'>('login');
  // Login state
  const [loginForm, setLoginForm] = React.useState({ email: "", password: "" });
  const [loginError, setLoginError] = React.useState("");
  // Register state
  const [registerForm, setRegisterForm] = React.useState({ email: "", password: "", name: "", role: "PDM" });
  const [registerError, setRegisterError] = React.useState("");
  const router = useRouter();

  // Handlers for login
  const handleLoginEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(f => ({ ...f, email: e.target.value }));
  };
  const handleLoginPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm(f => ({ ...f, password: e.target.value }));
  };
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    });
    console.log('Login response status:', res.status);
    if (res.ok) {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error('Error parsing login success response:', err);
        router.push("/");
        return;
      }
      if (data && data.role === 'PDM') {
        router.push("/pdm");
      } else if (data && data.role === 'ADMIN') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } else {
      let data;
      try {
        data = await res.json();
      } catch (err) {
        console.error('Error parsing login error response:', err);
        setLoginError("Login failed (invalid response)");
        return;
      }
      console.error('Login error:', data);
      setLoginError(data.error || "Login failed");
    }
  };

  // Handlers for register
  const handleRegisterNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm(f => ({ ...f, name: e.target.value }));
  };
  const handleRegisterEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm(f => ({ ...f, email: e.target.value }));
  };
  const handleRegisterPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm(f => ({ ...f, password: e.target.value }));
  };
  const handleRegisterRoleChange = (_: any, value: string | null) => {
    setRegisterForm(f => ({ ...f, role: value || "PDM" }));
  };
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerForm),
    });
    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setRegisterError(data.error || "Registration failed");
    }
  };

  return (
    <Box className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
      <Sheet
        variant="outlined"
        sx={{
          width: 400,
          mx: "auto",
          my: 4,
          py: 4,
          px: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderRadius: "md",
          boxShadow: "lg",
          bgcolor: "background.body",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.500" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography level="h2" component="h1" sx={{ mb: 1 }}>
          OKR Management System
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, color: 'text.secondary', textAlign: 'center' }}>
          Track and manage Principal Development Manager OKRs for HMCTS CFT.
        </Typography>
        <Divider sx={{ my: 2, width: '100%' }} />
        <div className="flex w-full mb-4">
          <Button onClick={() => setTab('login')} variant={tab === 'login' ? 'solid' : 'soft'} className="flex-1 rounded-r-none">Sign In</Button>
          <Button onClick={() => setTab('register')} variant={tab === 'register' ? 'solid' : 'soft'} className="flex-1 rounded-l-none">Register</Button>
        </div>
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="w-full">
            {loginError && <Typography color="danger" level="body-sm" sx={{ mb: 2 }}>{loginError}</Typography>}
            <Input
              placeholder="Email Address"
              type="email"
              value={loginForm.email}
              onChange={handleLoginEmailChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              name="email"
              autoComplete="email"
            />
            <Input
              placeholder="Password"
              type="password"
              value={loginForm.password}
              onChange={handleLoginPasswordChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              name="password"
              autoComplete="current-password"
            />
            <Button fullWidth variant="solid" color="primary" sx={{ mt: 1, mb: 2 }} type="submit">
              Sign In
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="w-full">
            {registerError && <Typography color="danger" level="body-sm" sx={{ mb: 2 }}>{registerError}</Typography>}
            <Input
              placeholder="Name"
              value={registerForm.name}
              onChange={handleRegisterNameChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              name="name"
              autoComplete="name"
            />
            <Input
              placeholder="Email Address"
              type="email"
              value={registerForm.email}
              onChange={handleRegisterEmailChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              name="email"
              autoComplete="email"
            />
            <Input
              placeholder="Password"
              type="password"
              value={registerForm.password}
              onChange={handleRegisterPasswordChange}
              fullWidth
              sx={{ mb: 2 }}
              required
              name="password"
              autoComplete="new-password"
            />
            <Select
              placeholder="Role"
              name="role"
              value={registerForm.role}
              onChange={handleRegisterRoleChange}
              sx={{ mb: 2 }}
              required
            >
              <Option value="PDM">Principal Development Manager</Option>
            </Select>
            <Button fullWidth variant="solid" color="primary" sx={{ mt: 1, mb: 2 }} type="submit">
              Register
            </Button>
          </form>
        )}
      </Sheet>
    </Box>
  );
}
