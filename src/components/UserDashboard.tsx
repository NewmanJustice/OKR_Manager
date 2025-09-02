"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Box, Typography, Button, IconButton, Alert } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideNav from "./SideNav";
import ObjectivesList from "./ObjectivesList"; // Import the ObjectivesList component

const DRAWER_WIDTH = 240;

const UserDashboard: React.FC = () => {
  const { data: session, update: updateSession, status } = useSession();
  const [sideNavOpen, setSideNavOpen] = useState(true);

  // Helper: check if jobRole is missing
  const missingJobRole = status === 'authenticated' && (!session?.user || !(session.user as any).jobRoleId);

  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
  React.useEffect(() => {
    if (isDesktop) setSideNavOpen(true);
  }, [isDesktop]);

  // Remove automatic session refresh on mount to prevent flicker and backend polling
  // React.useEffect(() => {
  //   updateSession && updateSession();
  // }, []);

  // Show loading spinner while session is loading
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  // Responsive hamburger for mobile/tablet
  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: `${DRAWER_WIDTH}px` },
          transition: 'margin-left 0.3s',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: { xs: 4, md: 10 }, // Match review page top padding
          minHeight: '100vh',
        }}
      >
        {missingJobRole && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 2 }}>
            <Alert severity="info" sx={{ maxWidth: 600, width: '100%', borderRadius: 2, py: 2, px: 4, display: 'flex', alignItems: 'center' }}>
              <span>Please update your profile and select your job role.</span>
            </Alert>
          </Box>
        )}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={() => setSideNavOpen(true)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16, // Move to right
            left: 'auto', // Remove left positioning
            zIndex: 1201,
            display: { xs: 'block', md: sideNavOpen ? 'none' : 'block' },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ maxWidth: 600, width: '100%', p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper", mt: 0 }}>
          <Typography variant="h4" sx={{ color: 'black' }} mb={3} fontWeight={600} textAlign="left">
            Dashboard
          </Typography>
          <Typography variant="body1" mb={4} color="black">
            Welcome, {session?.user?.name || session?.user?.email || "User"}!
          </Typography>
          {/* Objectives Section */}
          <ObjectivesList userId={session?.user && (session.user as any).id} />
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
