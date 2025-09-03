"use client";
import React, { useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, Paper } from "@mui/material";
import TeamAssignCard from "@/components/TeamAssignCard";
import { useSession } from "next-auth/react";

export default function MyTeamPage() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const { data: session, status } = useSession();
  // Use explicit type assertion for session user
  const isLineManager = Boolean(session?.user && (session.user as { isLineManager?: boolean }).isLineManager);

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "black" }}>
        <Typography color="white">Loading...</Typography>
      </Box>
    );
  }
  if (status !== "authenticated" || !isLineManager) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", bgcolor: "black" }}>
        <Typography color="error">Access denied. You must be a line manager to view this page.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "black" }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "black", minHeight: "100vh" }}>
        <Paper elevation={2} sx={{ width: "fit-content", p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3, boxShadow: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            My Team
          </Typography>
        </Paper>
        {/* Team Management Card */}
        <Paper elevation={2} sx={{ width: "fit-content", p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3, boxShadow: 3, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 400 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Manage Team Members
          </Typography>
          {/* Search and assign section */}
          <TeamAssignCard />
        </Paper>
      </Box>
    </Box>
  );
}
