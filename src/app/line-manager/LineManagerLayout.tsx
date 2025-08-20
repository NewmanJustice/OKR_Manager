"use client";
import React, { useState } from "react";
import SideNav from "@/components/SideNav";
import { Box, Typography, Paper, TextField, Button, Alert, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip, Link as MuiLink, Chip } from "@mui/material";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSession } from "next-auth/react";
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorIcon from '@mui/icons-material/Error';
import AutorenewIcon from '@mui/icons-material/Autorenew';

export default function LineManagerLayout() {
  const [sideNavOpen, setSideNavOpen] = useState(true);
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [inviteeName, setInviteeName] = useState("");
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [actionLoading, setActionLoading] = useState<{ [key: number]: boolean }>({});
  const [refreshInvites, setRefreshInvites] = useState(0);

  // Fetch invites on mount
  React.useEffect(() => {
    async function fetchInvites() {
      const res = await fetch("/api/invite");
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites);
      }
    }
    fetchInvites();
  }, [refreshInvites]);

  const validateEmail = (email: string) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  };

  const isDuplicateInvite = (email: string) => {
    return invites.some((invite: any) => invite.email.toLowerCase() === email.toLowerCase() && ["pending", "resent"].includes(invite.status));
  };

  const handleDeleteClick = (inviteId: number) => {
    setInviteToDelete(inviteId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (inviteToDelete == null) return;
    setActionLoading((prev) => ({ ...prev, [inviteToDelete]: true }));
    setDeleteDialogOpen(false);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/invite/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId: inviteToDelete }),
      });
      if (!res.ok) {
        let data = {};
        try { data = await res.json(); } catch {}
        let errorMsg = "Failed to delete invite. Please try again.";
        if (typeof data === "object" && data && "error" in data && typeof data.error === "string") {
          errorMsg = data.error;
        }
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        setActionLoading((prev) => ({ ...prev, [inviteToDelete]: false }));
        return;
      }
      setSnackbar({ open: true, message: "Invite deleted successfully", severity: 'success' });
      setRefreshInvites((v) => v + 1);
    } catch (err) {
      setSnackbar({ open: true, message: "Network error. Please check your connection and try again.", severity: 'error' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [inviteToDelete]: false }));
      setInviteToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setInviteToDelete(null);
  };

  const handleResend = async (inviteId: number) => {
    setActionLoading((prev) => ({ ...prev, [inviteId]: true }));
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/invite/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteId }),
      });
      if (!res.ok) {
        let data = {};
        try { data = await res.json(); } catch {}
        let errorMsg = "Failed to resend invite. Please try again.";
        if (typeof data === "object" && data && "error" in data && typeof data.error === "string") {
          errorMsg = data.error;
        }
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        setActionLoading((prev) => ({ ...prev, [inviteId]: false }));
        return;
      }
      setSnackbar({ open: true, message: "Invite resent successfully", severity: 'success' });
      setRefreshInvites((v) => v + 1);
    } catch (err) {
      setSnackbar({ open: true, message: "Network error. Please check your connection and try again.", severity: 'error' });
    } finally {
      setActionLoading((prev) => ({ ...prev, [inviteId]: false }));
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/register?invite=${token}`;
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, message: "Invite link copied to clipboard", severity: 'success' });
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!inviteeName.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (isDuplicateInvite(email)) {
      setError("An active invite has already been sent to this email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, inviteeName }),
      });
      if (!res.ok) {
        let data = {};
        try { data = await res.json(); } catch {}
        let errorMsg = "Failed to send invite. Please try again.";
        if (typeof data === "object" && data && "error" in data && typeof data.error === "string") {
          errorMsg = data.error;
        }
        setSnackbar({ open: true, message: errorMsg, severity: 'error' });
        setLoading(false);
        return;
      }
      setSnackbar({ open: true, message: "Invite sent successfully", severity: 'success' });
      setEmail("");
      setInviteeName("");
      setRefreshInvites((v) => v + 1);
    } catch (err) {
      setSnackbar({ open: true, message: "Network error. Please check your connection and try again.", severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'black' }}>
      <SideNav open={sideNavOpen} onClose={() => setSideNavOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'black', minHeight: '100vh' }}>
        <Paper elevation={2} sx={{ width: 'fit-content', p: { xs: 2, md: 4 }, mt: 4, borderRadius: 3, boxShadow: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Line Manager Dashboard
          </Typography>
          <Box component="form" onSubmit={handleSendInvite} sx={{ mt: 3, width: 400 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <TextField
              label="Invitee's Name"
              value={inviteeName}
              onChange={e => setInviteeName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Invitee's Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              fullWidth
              margin="normal"
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Send Invite"}
            </Button>
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 4 }}>
            Sent Invites
          </Typography>
          <Table sx={{ mt: 2, minWidth: 400 }}>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Date Sent</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Expiry</TableCell>
                <TableCell>Date Used</TableCell>
                <TableCell>Link</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invites.map((invite: any) => {
                // Color mapping for status
                const statusColor: Record<string, "primary" | "success" | "warning" | "error" | "info"> = {
                  pending: "primary",
                  used: "success",
                  expired: "warning",
                  invalidated: "error",
                  resent: "info",
                };
                return (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email}</TableCell>
                    <TableCell>{new Date(invite.dateSent).toLocaleString()}</TableCell>
                    <TableCell>
                      {(() => {
                        let chipProps: any = { label: invite.status, size: 'small' };
                        switch (invite.status) {
                          case 'pending':
                            chipProps = { ...chipProps, icon: <HourglassEmptyIcon fontSize="small" sx={{ color: 'white' }} />, sx: { bgcolor: 'primary.main', color: 'white' } };
                            break;
                          case 'used':
                            chipProps = { ...chipProps, icon: <CheckCircleIcon fontSize="small" sx={{ color: 'white' }} />, sx: { bgcolor: 'success.main', color: 'white' } };
                            break;
                          case 'expired':
                            chipProps = { ...chipProps, icon: <CancelIcon fontSize="small" sx={{ color: 'white' }} />, sx: { bgcolor: 'warning.main', color: 'black' } };
                            break;
                          case 'invalidated':
                            chipProps = { ...chipProps, icon: <ErrorIcon fontSize="small" sx={{ color: 'white' }} />, sx: { bgcolor: 'error.main', color: 'white' } };
                            break;
                          case 'resent':
                            chipProps = { ...chipProps, icon: <AutorenewIcon fontSize="small" sx={{ color: 'white' }} />, sx: { bgcolor: 'info.main', color: 'white' } };
                            break;
                          default:
                            chipProps = { ...chipProps, sx: { bgcolor: 'grey.300', color: 'black' } };
                        }
                        return <Chip {...chipProps} />;
                      })()}
                    </TableCell>
                    <TableCell>{invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : "-"}</TableCell>
                    <TableCell>{invite.dateUsed ? new Date(invite.dateUsed).toLocaleString() : "-"}</TableCell>
                    <TableCell>
                      <Tooltip title="Copy invite link">
                        <IconButton onClick={() => handleCopyLink(invite.token)} disabled={invite.status === "expired" || invite.status === "invalidated"}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <MuiLink href={`/register?invite=${invite.token}`} target="_blank" rel="noopener" sx={{ ml: 1 }}>
                        Open
                      </MuiLink>
                    </TableCell>
                    <TableCell>
                      <ButtonGroup variant="outlined" size="small">
                        <Tooltip title="Resend invite">
                          <span>
                            <Button
                              onClick={() => handleResend(invite.id)}
                              disabled={loading || actionLoading[invite.id] || ["used", "expired", "invalidated"].includes(invite.status)}
                              startIcon={actionLoading[invite.id] ? <CircularProgress size={18} /> : <RefreshIcon />}
                              sx={{ minWidth: 90 }}
                            >
                              Resend
                            </Button>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete invite">
                          <span>
                            <Button
                              color="error"
                              onClick={() => handleDeleteClick(invite.id)}
                              disabled={loading || actionLoading[invite.id] || ["used", "expired", "invalidated"].includes(invite.status)}
                              startIcon={actionLoading[invite.id] ? <CircularProgress size={18} /> : <DeleteIcon />}
                              sx={{ minWidth: 90 }}
                            >
                              Delete
                            </Button>
                          </span>
                        </Tooltip>
                      </ButtonGroup>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </Box>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Invite</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this invite? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ sx: { bgcolor: snackbar.severity === 'success' ? 'success.main' : 'error.main', color: 'white' } }}
      />
    </Box>
  );
}
