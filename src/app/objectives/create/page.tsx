"use client";
import React, { useState } from "react";
import CreateObjectiveWizard from "@/components/CreateObjectiveWizard";
import SideNav from "@/components/SideNav";
import { useSession } from "next-auth/react";
import { Alert, Button, Box, Typography } from "@mui/material";

export default function CreateObjectivePage() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const { data: session, status } = useSession();
  const missingJobRole = !session?.user || !(session.user as any).jobRoleId;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <div style={{ flex: 1, position: 'relative' }}>
        {missingJobRole && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 4 }}>
            <Alert severity="info" sx={{ width: 'auto', borderRadius: 2, py: 2, px: 4, display: 'flex', alignItems: 'center', flexDirection: 'row', flexWrap: 'nowrap', gap: 4 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography noWrap>
                  You must update your profile and select a job role before creating an objective.
                </Typography>
              </Box>
              <Button variant="contained" color="info" size="small" href="/profile" sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                Go to Profile
              </Button>
            </Alert>
          </Box>
        )}
        <div style={{ flex: 1, pointerEvents: missingJobRole ? 'none' : 'auto', opacity: missingJobRole ? 0.5 : 1 }}>
          <CreateObjectiveWizard disableAll={missingJobRole} />
        </div>
      </div>
    </div>
  );
}
