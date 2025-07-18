"use client";
import Typography from "@mui/joy/Typography";
import Card from "@mui/joy/Card";

export default function UserDashboard() {
  return (
    <Card sx={{ maxWidth: 600, margin: "2rem auto", padding: 3 }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        User Dashboard
      </Typography>
      <Typography>
        Welcome to your dashboard! This page will show your OKRs, reviews, and other user-specific features.
      </Typography>
    </Card>
  );
}
