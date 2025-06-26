"use client";
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import { useState, useEffect } from 'react';
import CircularProgress from '@mui/joy/CircularProgress';
import Markdown from 'react-markdown';

export default function PDMDashboardDrawerClient() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user role when drawer opens
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    // Fetch session/user info (assume /api/session returns { user: { role: string } })
    fetch('/api/session')
      .then(async res => {
        const data = await res.json();
        const userRole = data?.user?.roleName;
        if (userRole) {
          fetch(`/api/role-description?role=${encodeURIComponent(userRole)}`)
            .then(async res2 => {
              const data2 = await res2.json();
              setDescription(data2.description || "No description available.");
              setLoading(false);
            })
            .catch(() => {
              setDescription("");
              setLoading(false);
              setError("Failed to load role description");
            });
        } else {
          setDescription("");
          setLoading(false);
          setError("No user role found");
        }
      })
      .catch(() => {
        setDescription("");
        setLoading(false);
        setError("Failed to load user session");
      });
  }, [open]);

  return (
    <>
      <Button variant="outlined" color="neutral" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Show Role Description
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} anchor="right" size="lg" sx={{
        '--Drawer-width': '75vw !important',
        width: '75vw',
        maxWidth: '100vw',
        '& .MuiDrawer-paper': {
          width: '75vw',
          maxWidth: '100vw',
        },
      }}>
        <div style={{ padding: 32, width: '100%' }}>
          {/* Remove the Role Description heading */}
          {/* <h2 className="text-xl font-semibold mb-4">Role Description</h2> */}
          {!mounted ? null : loading ? (
            <CircularProgress />
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <Markdown>{description || "No description available."}</Markdown>
          )}
        </div>
      </Drawer>
    </>
  );
}
