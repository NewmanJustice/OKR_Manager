"use client";
import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Divider, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import CreateIcon from "@mui/icons-material/Create";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import GroupIcon from "@mui/icons-material/Group";
import { useTheme, useMediaQuery } from "@mui/material";
import NextLink from "next/link";
import { signOut, useSession } from "next-auth/react";

const navLinks = [
  { text: "Profile", icon: <PersonIcon />, href: "/profile" },
  { text: "Dashboard", icon: <DashboardIcon />, href: "/" },
  { text: "Create Objective", icon: <CreateIcon />, href: "/objectives/create" },
  { text: "Review OKR's", icon: <RateReviewIcon />, href: "/objectives/review" },
  { text: "Logout", icon: <LogoutIcon />, href: "/logout" },
];

interface SideNavProps {
  open: boolean;
  onClose: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { data: session } = useSession();
  const isLineManager = !!(session?.user && (session.user as any).isLineManager);

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={isMobile ? open : true} // Always open on desktop/tablet
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        width: 240,
        flexShrink: 0,
        display: { xs: 'block', md: 'block' },
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          position: isMobile ? undefined : 'relative',
          height: '100vh',
          top: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
        <Box sx={{ fontWeight: 'bold', fontSize: 20 }}>OKR Manager</Box>
        {isMobile && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', px: 2, pt: 2, pb: 1 }}>
        Menu
      </Typography>
      <List>
        {navLinks.map((link) => {
          if (link.text === "Logout") {
            return (
              <ListItem key={link.text} sx={{ cursor: 'pointer' }} onClick={() => { signOut({ callbackUrl: window.location.origin }); onClose(); }}>
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.text} />
              </ListItem>
            );
          }
          return (
            <ListItem key={link.text} component={NextLink} href={link.href} onClick={onClose} sx={{ cursor: 'pointer' }}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.text} />
            </ListItem>
          );
        })}
        {isLineManager && <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', px: 2, pt: 2, pb: 1 }}>
            Manage my team
          </Typography>
          <ListItem component={NextLink} href="/line-manager" onClick={onClose} sx={{ cursor: 'pointer' } }>
            <ListItemIcon><MailOutlineIcon /></ListItemIcon>
            <ListItemText primary="Invites" />
          </ListItem>
          <ListItem component={NextLink} href="/line-manager/my-team" onClick={onClose} sx={{ cursor: 'pointer' } }>
            <ListItemIcon><GroupIcon /></ListItemIcon>
            <ListItemText primary="My Team" />
          </ListItem>
        </>}
      </List>
    </Drawer>
  );
};

export default SideNav;
