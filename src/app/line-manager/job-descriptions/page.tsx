"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Box, Typography, Paper } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import SideNav from "@/components/SideNav";
import JobRoleDescriptionsManager from "@/components/JobRoleDescriptionsManager";

export default function JobDescriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not a line manager or not logged in
  if (status === "loading") return null;
  if (!session?.user || !(session.user as any).isLineManager) {
    router.replace("/");
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <SideNav open={true} onClose={() => {}} />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <Paper elevation={2} sx={{ maxWidth: 600, width: '100%', p: 4, textAlign: "center", bgcolor: 'white', mb: 4 }}>
          <WorkOutlineIcon sx={{ fontSize: 48, mb: 2, color: "primary.main" }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Job Descriptions
          </Typography>
        </Paper>
        <Box sx={{ width: '100%', maxWidth: 800 }}>
          <JobRoleDescriptionsManager />
        </Box>
      </Box>
    </Box>
  );
}
