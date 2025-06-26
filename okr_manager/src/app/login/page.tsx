"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import Input from "@mui/joy/Input";
import Button from "@mui/joy/Button";
import Avatar from "@mui/joy/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Divider from "@mui/joy/Divider";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.isAdmin) {
        router.push("/admin");
      } else if (data.isLineManager) {
        router.push("/pdm");
      } else {
        router.push("/user"); // or "/" if you don't have a /user dashboard
      }
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
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
        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", paddingLeft: 32, paddingRight: 32, marginBottom: 8 }}>
          <Typography level="h4" sx={{ fontWeight: 700, fontSize: '1.875rem', color: '#222', textAlign: 'center', mb: 0, width: '100%' }}>
            OKR Manager
          </Typography>
          <div></div>
        </div>
        <Avatar variant="soft" color="neutral" size="md" sx={{ m: 1, bgcolor: "#000" }}>
          <LockOutlinedIcon fontSize="medium" />
        </Avatar>
        <Typography level="h2" sx={{ mb: 1, textAlign: "center" }}>
          The OKR Management System
        </Typography>
        <Typography level="body-sm" sx={{ mb: 2, textAlign: "center" }}>
          Track and manage OKR's
        </Typography>
        <Divider sx={{ width: "100%", mb: 2 }} />
        {error && (
          <Typography color="danger" sx={{ mb: 2 }}>
            {error}
          </Typography>
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
            sx={{ mb: 2 }}
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
            sx={{ mb: 2 }}
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth variant="solid" size="md" sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#e8890c', color: '#fff' } }}>
            Sign In
          </Button>
        </form>
      </Sheet>
    </main>
  );
}
