"use client";
import React, { useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, Paper } from "@mui/material";

export default function LineManagerLayout() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'black', minHeight: '100vh' }}>
        <Paper elevation={2} sx={{ width: 'fit-content', p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3, boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Line Manager Dashboard
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
