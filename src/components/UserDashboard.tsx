"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideNav from "./SideNav";
import ObjectivesList from "./ObjectivesList"; // Import the ObjectivesList component

const DRAWER_WIDTH = 240;

const UserDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [sideNavOpen, setSideNavOpen] = useState(true);

  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 900px)').matches;
  React.useEffect(() => {
    if (isDesktop) setSideNavOpen(true);
  }, [isDesktop]);

  // Responsive hamburger for mobile/tablet
  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: sideNavOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: 'margin-left 0.3s',
          width: '100%',
        }}
      >
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
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
          <Typography variant="h4" mb={2} color="black">
            OKR Manager
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
