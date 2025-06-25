"use client";
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import { useState } from 'react';

export default function PDMDashboardDrawerClient() {
  const [open, setOpen] = useState(false);
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
          <h2 className="text-xl font-semibold mb-4">Role Description</h2>
          <p>Users role description will go here</p>
        </div>
      </Drawer>
    </>
  );
}
