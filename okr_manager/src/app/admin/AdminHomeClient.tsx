"use client";
import * as React from "react";
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Link from 'next/link';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';

export default function AdminHomeClient() {
  const [user, setUser] = React.useState<{email: string} | null>(null);
  React.useEffect(() => {
    fetch('/api/auth/me').then(async res => {
      if (res.ok) {
        setUser(await res.json());
      }
    });
  }, []);

  if (!user) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 pt-4">
      <Typography level="h2" sx={{ mb: 2, color: 'white', pt: 2, pb: 0 }} className="pt-4 pb-0">Admin Home</Typography>
      <Card variant="outlined" sx={{ width: 500, maxWidth: '95vw', p: 4, mb: 6, boxShadow: 'lg', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <List size="lg" variant="outlined" sx={{ width: 'calc(500px - 1em)', maxWidth: 'calc(95vw - 1em)', borderRadius: 'md', boxShadow: 'sm', ml: '0.25em', mr: '0.25em',
          '& .MuiListItemButton-root:hover': {
            backgroundColor: 'black',
            color: 'white',
          },
          '& .MuiListItemButton-root:hover .MuiListItemDecorator-root': {
            color: 'white',
          },
        }}>
          <ListItem>
            <ListItemButton component={Link} href="/admin/dashboard">
              <ListItemDecorator>
                <DashboardIcon />
              </ListItemDecorator>
              Admin Dashboard
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton component={Link} href="/admin/objectives">
              <ListItemDecorator>
                <AssignmentIcon />
              </ListItemDecorator>
              Create OKRs
            </ListItemButton>
          </ListItem>
          {/* Add more admin feature links here as needed */}
        </List>
      </Card>
    </div>
  );
}
