"use client";
import { useSession, signOut } from "next-auth/react";
import { Box, Typography, Button } from "@mui/material";

const UserDashboard: React.FC = () => {
  const { data: session } = useSession();
  return (
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
  );
};

export default UserDashboard;
