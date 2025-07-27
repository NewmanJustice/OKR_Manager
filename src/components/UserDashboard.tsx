"use client";
import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SideNav from "./SideNav";

const DRAWER_WIDTH = 240;

const UserDashboard: React.FC = () => {
  const { data: session } = useSession();
  const [sideNavOpen, setSideNavOpen] = useState(true);

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
            left: 16,
            zIndex: 1201,
            display: { xs: 'block', md: sideNavOpen ? 'none' : 'block' },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: "background.paper" }}>
          <Typography variant="h4" mb={2} color="black">
            User Dashboard
          </Typography>
          <Typography variant="body1" mb={4} color="black">
            Welcome, {session?.user?.name || session?.user?.email || "User"}!
          </Typography>
          <Button variant="contained" color="primary" onClick={() => signOut({ callbackUrl: "/" })}>
            Logout
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UserDashboard;
