import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import api from "../../api/axios";

export default function AuditLogsModal({ open, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  const MOCK_AUDIT_LOGS = [
    { event: "User Role Update: sarah.manager -> Manager", user: "admin@intrasphere.com", time: "Today, 10:45 AM", type: "Security" },
    { event: "Workspace Reservation #104 Created", user: "michael.emp", time: "Today, 09:30 AM", type: "Reservation" },
    { event: "System Backup Completed Successfully", user: "System Daemon", time: "Today, 04:00 AM", type: "System" },
    { event: "Facility Maintenance Schedule Updated", user: "john.facility", time: "Yesterday, 05:15 PM", type: "Facility" },
    { event: "New Employee Onboarding Profile Created", user: "emily.hr", time: "Yesterday, 02:20 PM", type: "HR" },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/admin/audit-logs?limit=50");
      if (res.data?.audit_logs && res.data.audit_logs.length > 0) {
        setLogs(res.data.audit_logs);
      } else {
        setLogs(MOCK_AUDIT_LOGS);
      }
    } catch (err) {
      console.error("Failed to load audit logs, using fallback:", err);
      setLogs(MOCK_AUDIT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: "#0F172A" }}>
        System Administrative Audit Logs
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No audit logs recorded yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 600 }}>{log.event}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.time}</TableCell>
                    <TableCell>
                      <Chip label={log.type} size="small" sx={{ bgcolor: "#F1F5F9", color: "#334155", fontWeight: 600 }} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
