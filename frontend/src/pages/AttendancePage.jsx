import React, { useState } from "react";
import { Box, Typography, Stack, Container, Snackbar, Alert } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import AttendanceOverview from "../components/dashboard/AttendanceOverview";
import AttendanceHistoryTable from "../components/dashboard/AttendanceHistoryTable";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const handleAttendanceChange = () => {
    setAttendanceRefreshKey((prev) => prev + 1);
  };

  return (
    <AppLayout activeTabOverride="attendance">
      <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
        {/* Top Header */}
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px", mb: 0.5 }}>
            Attendance & Daily Logs
          </Typography>
          <Typography variant="body1" color="#64748B">
            Log your daily office arrival, view working hours, and inspect past check-in history.
          </Typography>
        </Box>

        <Stack spacing={3.5}>
          {/* Attendance Overview Widget */}
          <AttendanceOverview
            user={user}
            onAttendanceChange={handleAttendanceChange}
            showToast={showToast}
          />

          {/* Detailed Attendance History Table */}
          <AttendanceHistoryTable
            user={user}
            refreshTrigger={attendanceRefreshKey}
          />
        </Stack>

        {/* Feedback Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setToast({ ...toast, open: false })}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}
