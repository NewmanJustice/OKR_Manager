"use client";
import * as React from "react";
import Link from "next/link";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';

export default function NavBarClient() {
  const [user, setUser] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  React.useEffect(() => {
    const fetchUser = () => {
      fetch("/api/user/me", { cache: 'no-store' })
        .then(async res => {
          if (res.ok) {
            const user = await res.json();
            // Defensive: only set if id exists
            if (user && user.id) setUser(user);
            else setUser(null);
          } else setUser(null);
        })
        .catch(() => setUser(null));
    };
    fetchUser();
    // Listen for storage events to update user state on logout/login in other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === "okr_session") fetchUser();
    };
    window.addEventListener("storage", onStorage);
    // Also re-check user after navigation
    const onFocus = () => fetchUser();
    window.addEventListener("focus", onFocus);
    // Listen for route changes to force user state refresh
    const onPopState = () => fetchUser();
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  if (!mounted) return <div style={{ minHeight: 80 }} />;

  return (
    <Card variant="outlined" sx={{ borderRadius: 0, boxShadow: 'sm', mb: 0, width: '100%', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0 }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 32, paddingRight: 32 }}>
        <button
          onClick={() => window.location.href = '/'}
          style={{ fontWeight: 700, fontSize: 28, color: '#222', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
        >OKR Manager</button>
        <div>
          {user ? (
            <>
              {user.email && (
                <Typography level="body-md" sx={{ mr: 2, color: '#666', display: 'inline-block' }}>{user.email}</Typography>
              )}
              <Link href="/logout">
                <Button
                  color="primary"
                  variant="soft"
                  size="sm"
                  className="logout-btn"
                  sx={{
                    backgroundColor: '#000',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#e8890c',
                      color: '#fff',
                    },
                  }}
                >
                  Logout
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button onClick={() => window.location.href = '/login'} color="primary" variant="soft" size="sm" sx={{ mr: 1, color: '#fff', '&:hover': { color: '#fff', backgroundColor: '#e8890c' } }}>Login</Button>
              <Button onClick={() => window.location.href = '/register'} color="neutral" variant="soft" size="sm" sx={{ color: '#fff', '&:hover': { color: '#fff', backgroundColor: '#e8890c' } }}>Register</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
