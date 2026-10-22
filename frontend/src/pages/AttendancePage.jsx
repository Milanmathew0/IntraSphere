import React, { useState } from "react";
import { Box, Typography, Stack, Container, Snackbar, Alert, Button, CircularProgress } from "@mui/material";
import TableViewIcon from "@mui/icons-material/TableView";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import AttendanceOverview from "../components/dashboard/AttendanceOverview";
import AttendanceHistoryTable from "../components/dashboard/AttendanceHistoryTable";
import { exportAttendanceReport } from "../utils/reportExport";

export default function AttendancePage() {
  const { user } = useAuth();
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const [exporting, setExporting] = useState(null);

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

  const handleExport = async (format) => {
    setExporting(format);
    try {
      showToast(`Generating Attendance Report (${format.toUpperCase()})...`, "info");
      await exportAttendanceReport({
        format,
        search: user?.email || user?.employee_code || undefined,
      });
      showToast(`Attendance Report (${format.toUpperCase()}) downloaded successfully!`, "success");
    } catch (e) {
      showToast(e?.message || "Failed to export attendance report.", "error");
    } finally {
      setExporting(null);
    }
  };

  return (
    <AppLayout activeTabOverride="attendance">
      <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
        {/* Top Header */}
        <Box sx={{ mb: 3.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px", mb: 0.5 }}>
              Attendance & Daily Logs
            </Typography>
            <Typography variant="body1" color="#64748B">
              Log your daily office arrival, view working hours, and inspect past check-in history.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              size="small"
              startIcon={exporting === "excel" ? <CircularProgress size={16} color="inherit" /> : <TableViewIcon />}
              onClick={() => handleExport("excel")}
              disabled={!!exporting}
              sx={{
                bgcolor: "#16A34A",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: "10px",
                textTransform: "none",
                px: 2,
                py: 0.9,
                "&:hover": { bgcolor: "#15803D" },
              }}
            >
              {exporting === "excel" ? "Exporting..." : "Export Excel"}
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={exporting === "pdf" ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />}
              onClick={() => handleExport("pdf")}
              disabled={!!exporting}
              sx={{
                bgcolor: "#DC2626",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: "10px",
                textTransform: "none",
                px: 2,
                py: 0.9,
                "&:hover": { bgcolor: "#B91C1C" },
              }}
            >
              {exporting === "pdf" ? "Exporting..." : "Export PDF"}
            </Button>
          </Stack>
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
