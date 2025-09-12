"use client";
import { Box, Typography, Paper } from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SideNav from "@/components/SideNav";

export default function MyJobRolePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [desc, setDesc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user) {
      router.replace("/api/auth/signin");
      return;
    }
    async function fetchDesc() {
      setLoading(true);
      const res = await fetch("/api/my-job-role-description");
      if (res.ok) {
        const data = await res.json();
        setDesc(data.description);
      } else {
        setDesc(null);
      }
      setLoading(false);
    }
    fetchDesc();
  }, [session, status, router]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <SideNav open={true} onClose={() => {}} />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
        <Paper elevation={2} sx={{ maxWidth: 600, width: '100%', p: 4, textAlign: "left", bgcolor: 'white', mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <WorkOutlineIcon sx={{ fontSize: 48, mb: 2, color: "primary.main" }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              My Job Role
            </Typography>
          </Box>
          {loading ? (
            <Typography sx={{ mt: 4 }}>Loading...</Typography>
          ) : desc ? (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ color: 'black', mb: 2 }}>
                {desc.jobRole?.name || "Job Role"} Description
              </Typography>
              <Box
                sx={{
                  wordBreak: 'break-word',
                  color: 'black',
                  // Add spacing between headings and paragraphs
                  '& h1, & h2, & h3, & h4': { mt: 2, mb: 1 },
                  '& p': { mb: 2 },
                  '& blockquote': { mb: 2 },
                  '& ul, & ol': { mb: 2 },
                  '& code': { mb: 2 },
                }}
                dangerouslySetInnerHTML={{ __html: desc.content }}
              />
            </Box>
          ) : (
            <Typography sx={{ mt: 4, color: 'black' }}>No job role description found for your role and manager.</Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
