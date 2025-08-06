"use client";
import React, { useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, Paper } from "@mui/material";

export default function ProfileLayout() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'black', minHeight: '100vh' }}>
        <Paper elevation={2} sx={{ width: '100%', maxWidth: 900, p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Profile Page
          </Typography>
          {/* Add more profile details here in the future */}
        </Paper>
      </Box>
    </Box>
  );
}
