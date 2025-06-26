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
import Avatar from "@mui/joy/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Divider from "@mui/joy/Divider";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", name: "", roleId: "" });
  const [roles, setRoles] = useState<{ id: number; name: string; description?: string }[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/roles")
      .then((res) => res.json())
      .then((data) => setRoles(data.filter((r: any) => r.name !== 'Admin')));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleRoleChange = (_: any, value: string | null) => {
    setForm({ ...form, roleId: value || "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/pdm");
      }, 1200);
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
        {success && (
          <Typography color="success" sx={{ mb: 2 }}>
            Registration successful! Redirecting to your dashboard...
          </Typography>
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
              <Input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
            </FormControl>
            <FormControl sx={{ mb: 3 }} required>
              <FormLabel>Role</FormLabel>
              <Select value={form.roleId} onChange={handleRoleChange} name="roleId" required>
                {roles.map((role) => (
                  <Option key={role.id} value={role.id.toString()}>{role.name}</Option>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" fullWidth variant="solid" size="md" sx={{ mb: 2, backgroundColor: '#000', color: '#fff', '&:hover': { backgroundColor: '#e8890c', color: '#fff' } }}>
              Register
            </Button>
          </form>
        )}
      </Sheet>
    </main>
  );
}
