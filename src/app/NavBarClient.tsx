"use client";
import * as React from "react";
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Avatar from "@mui/joy/Avatar";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sheet from '@mui/joy/Sheet';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/joy/styles';
import { useSession, signOut } from 'next-auth/react';

export default function NavBarClient() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const navLinks = session?.user ? (
    <>
      {typeof session.user.email === 'string' && (
        <Typography level="body-md" sx={{ mr: 2, color: '#666', display: 'inline-block' }}>{session.user.email}</Typography>
      )}
      <Button
        color="primary"
        variant="soft"
        size="sm"
        className="logout-btn"
        sx={{
          backgroundColor: '#000',
          color: '#fff',
          '&:hover': { backgroundColor: '#e8890c', color: '#fff' },
          borderRadius: 0,
        }}
        onClick={() => signOut({ callbackUrl: '/login' })}
      >
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button onClick={() => window.location.href = '/login'} color="primary" variant="soft" size="sm" sx={{ mr: 1, color: '#fff', '&:hover': { color: '#fff', backgroundColor: '#e8890c' }, borderRadius: 0 }}>Login</Button>
      <Button onClick={() => window.location.href = '/register'} color="neutral" variant="soft" size="sm" sx={{ color: '#fff', '&:hover': { color: '#fff', backgroundColor: '#e8890c' }, borderRadius: 0 }}>Register</Button>
    </>
  );

  return (
    <Card variant="outlined" sx={{ borderRadius: 0, boxShadow: 'sm', mb: 0, width: '100%', minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0 }}>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar variant="soft" color="neutral" size="md" sx={{ bgcolor: "#000", width: 40, height: 40, mr: 1 }}>
            <InsertChartOutlinedIcon fontSize="medium" style={{ color: '#fff' }} />
          </Avatar>
          <button
            onClick={() => window.location.href = '/'}
            style={{ fontWeight: 700, fontSize: 28, color: '#222', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >OKR Manager</button>
        </div>
        {isMobile ? (
          <>
            <IconButton variant="plain" color="neutral" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Sheet
              sx={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: 220,
                height: '100vh',
                zIndex: 1200,
                bgcolor: '#fff',
                boxShadow: 'lg',
                display: mobileOpen ? 'block' : 'none',
                transition: 'all 0.3s',
              }}
              onClick={() => setMobileOpen(false)}
            >
              <List sx={{ mt: 8 }}>
                <ListItem>
                  <ListItemButton onClick={() => { window.location.href = '/'; setMobileOpen(false); }}>
                    Home
                  </ListItemButton>
                </ListItem>
                {!session?.user && (
                  <>
                    <ListItem>
                      <ListItemButton onClick={() => { window.location.href = '/login'; setMobileOpen(false); }}>
                        Login
                      </ListItemButton>
                    </ListItem>
                    <ListItem>
                      <ListItemButton onClick={() => { window.location.href = '/register'; setMobileOpen(false); }}>
                        Register
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
                {session?.user && (
                  <>
                    <ListItem>
                      <ListItemButton disabled>
                        {typeof session.user.email === 'string' ? session.user.email : 'User'}
                      </ListItemButton>
                    </ListItem>
                    <ListItem>
                      <ListItemButton onClick={() => { signOut({ callbackUrl: '/login' }); setMobileOpen(false); }}>
                        Logout
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            </Sheet>
          </>
        ) : (
          <div>{navLinks}</div>
        )}
      </div>
    </Card>
  );
}
