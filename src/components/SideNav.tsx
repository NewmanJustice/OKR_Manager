"use client";
import React, { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme, useMediaQuery } from "@mui/material";
import NextLink from "next/link";

const navLinks = [
  { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  { text: "Profile", icon: <PersonIcon />, href: "/profile" },
  { text: "Settings", icon: <SettingsIcon />, href: "/settings" },
  { text: "Logout", icon: <LogoutIcon />, href: "/logout" },
];

interface SideNavProps {
  open: boolean;
  onClose: () => void;
}

const SideNav: React.FC<SideNavProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={open}
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
          height: '100vh', // Make the drawer full height
          top: 0,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
        <Box sx={{ fontWeight: 'bold', fontSize: 20 }}>Menu</Box>
        <IconButton onClick={onClose} sx={{ display: { xs: 'block', md: 'none' } }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem key={link.text} component={NextLink} href={link.href} onClick={onClose} sx={{ cursor: 'pointer' }}>
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SideNav;
