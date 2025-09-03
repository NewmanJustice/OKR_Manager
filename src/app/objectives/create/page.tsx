"use client";
import React, { useState } from "react";
import CreateObjectiveWizard from "@/components/CreateObjectiveWizard";
import SideNav from "@/components/SideNav";
import { useSession } from "next-auth/react";
import { Alert, Button, Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import LineManagerObjectivesCard from "@/components/LineManagerObjectivesCard";

export default function CreateObjectivePage() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const { data: session, status } = useSession();
  const missingJobRole = !session?.user || !(session.user as any).jobRoleId;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Grid container spacing={2} sx={{ flex: 1, position: 'relative', mt: 1, width: '100%', alignItems: 'flex-start' }}>
        <Grid sx={{ gridColumn: { xs: 'span 0', md: 'span 1' }}}>
        </Grid>
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 8' }, minWidth: 0, alignSelf: 'flex-start' }}>
          <Box sx={{ pointerEvents: missingJobRole ? 'none' : 'auto', opacity: missingJobRole ? 0.5 : 1 }}>
            <CreateObjectiveWizard disableAll={missingJobRole} />
          </Box>
        </Grid>
        <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 4' }, minWidth: 0, alignSelf: 'flex-start' }}>
          <LineManagerObjectivesCard />
        </Grid>
      </Grid>
    </div>
  );
}
