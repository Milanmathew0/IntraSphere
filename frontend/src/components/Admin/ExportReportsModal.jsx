import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import TableViewIcon from "@mui/icons-material/TableView";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { exportAttendanceReport, exportLeaveReport } from "../../utils/reportExport";

export default function ExportReportsModal({ open, onClose, defaultType = "attendance", onShowToast }) {
  const [reportType, setReportType] = useState(defaultType); // 'attendance' or 'leave'
  const [format, setFormat] = useState("excel"); // 'excel' or 'pdf'

  // Date Range state (default last 30 days)
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  // Filters
  const [department, setDepartment] = useState("All");
  const [leaveStatus, setLeaveStatus] = useState("All");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quick preset handler
  const handlePreset = (preset) => {
    const now = new Date();
    let start = new Date();

    if (preset === "today") {
      start = now;
    } else if (preset === "week") {
      start.setDate(now.getDate() - 7);
    } else if (preset === "month") {
      start.setMonth(now.getMonth() - 1);
    } else if (preset === "quarter") {
      start.setMonth(now.getMonth() - 3);
    } else if (preset === "year") {
      start.setFullYear(now.getFullYear() - 1);
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      if (reportType === "attendance") {
        await exportAttendanceReport({
          format,
          startDate,
          endDate,
          department,
          search,
        });
        if (onShowToast) {
          onShowToast(
            `Attendance Report successfully exported in ${format.toUpperCase()} format!`,
            "success"
          );
        }
      } else {
        await exportLeaveReport({
          format,
          startDate,
          endDate,
          department,
          status: leaveStatus,
        });
        if (onShowToast) {
          onShowToast(
            `Leave Report successfully exported in ${format.toUpperCase()} format!`,
            "success"
          );
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate and export report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          border: "1px solid #E2E8F0",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)",
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          p: 3,
          bgcolor: "#0F172A",
          color: "#FFFFFF",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: "rgba(249, 115, 22, 0.15)",
              color: "#F97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AssessmentIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#FFFFFF" letterSpacing={-0.3}>
              HR Administrator – Export Reports
            </Typography>
            <Typography variant="caption" sx={{ color: "#94A3B8" }}>
              Export official employee attendance, punctuality, and leave registers in Excel or PDF format
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} sx={{ color: "#94A3B8", "&:hover": { color: "#FFFFFF" } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5, bgcolor: "#FAFAFA" }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* STEP 1: SELECT REPORT TYPE */}
        <Typography variant="subtitle2" fontWeight={800} color="#334155" mb={1.5}>
          1. Select Report Type
        </Typography>

        <Grid container spacing={2} mb={3.5}>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => setReportType("attendance")}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: "pointer",
                border: "2px solid",
                borderColor: reportType === "attendance" ? "#F97316" : "#E2E8F0",
                bgcolor: reportType === "attendance" ? "#FFF7ED" : "#FFFFFF",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#F97316" },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: reportType === "attendance" ? "#F97316" : "#F1F5F9",
                    color: reportType === "attendance" ? "#FFFFFF" : "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EventAvailableIcon />
                </Box>
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                    Attendance & Punctuality Report
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Present days, arrival times, late arrivals, working hours & grades
                  </Typography>
                </Box>
                {reportType === "attendance" && (
                  <CheckCircleIcon sx={{ color: "#F97316" }} />
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => setReportType("leave")}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: "pointer",
                border: "2px solid",
                borderColor: reportType === "leave" ? "#F97316" : "#E2E8F0",
                bgcolor: reportType === "leave" ? "#FFF7ED" : "#FFFFFF",
                transition: "all 0.2s ease",
                "&:hover": { borderColor: "#F97316" },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: reportType === "leave" ? "#F97316" : "#F1F5F9",
                    color: reportType === "leave" ? "#FFFFFF" : "#64748B",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FlightTakeoffIcon />
                </Box>
                <Box flexGrow={1}>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                    Leave Management Report
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Leave register, approval logs, quota balances & absence reasons
                  </Typography>
                </Box>
                {reportType === "leave" && (
                  <CheckCircleIcon sx={{ color: "#F97316" }} />
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* STEP 2: SELECT FORMAT */}
        <Typography variant="subtitle2" fontWeight={800} color="#334155" mb={1.5}>
          2. Select File Format
        </Typography>

        <Grid container spacing={2} mb={3.5}>
          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => setFormat("excel")}
              sx={{
                p: 2,
                borderRadius: 2.5,
                cursor: "pointer",
                border: "2px solid",
                borderColor: format === "excel" ? "#16A34A" : "#E2E8F0",
                bgcolor: format === "excel" ? "#F0FDF4" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "all 0.2s ease",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#DCFCE7",
                  color: "#16A34A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TableViewIcon />
              </Box>
              <Box flexGrow={1}>
                <Typography variant="body1" fontWeight={700} color="#0F172A">
                  Microsoft Excel (.xlsx)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Multi-sheet workbook with styled tables, formulas & logs
                </Typography>
              </Box>
              <Chip label="Recommended" size="small" sx={{ bgcolor: "#DCFCE7", color: "#16A34A", fontWeight: 700 }} />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Paper
              elevation={0}
              onClick={() => setFormat("pdf")}
              sx={{
                p: 2,
                borderRadius: 2.5,
                cursor: "pointer",
                border: "2px solid",
                borderColor: format === "pdf" ? "#DC2626" : "#E2E8F0",
                bgcolor: format === "pdf" ? "#FEF2F2" : "#FFFFFF",
                display: "flex",
                alignItems: "center",
                gap: 2,
                transition: "all 0.2s ease",
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#FEE2E2",
                  color: "#DC2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PictureAsPdfIcon />
              </Box>
              <Box flexGrow={1}>
                <Typography variant="body1" fontWeight={700} color="#0F172A">
                  Adobe PDF (.pdf)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Ready-to-print executive summary with pagination & headers
                </Typography>
              </Box>
              <Chip label="Formal / Print" size="small" sx={{ bgcolor: "#FEE2E2", color: "#DC2626", fontWeight: 700 }} />
            </Paper>
          </Grid>
        </Grid>

        {/* STEP 3: FILTER CRITERIA */}
        <Typography variant="subtitle2" fontWeight={800} color="#334155" mb={1.5}>
          3. Date Range & Report Filters
        </Typography>

        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 2 }}>
          {/* Preset Buttons */}
          <Stack direction="row" spacing={1} mb={2.5} flexWrap="wrap" useFlexGap>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ alignSelf: "center", mr: 1 }}>
              Quick Presets:
            </Typography>
            {["today", "week", "month", "quarter", "year"].map((preset) => (
              <Chip
                key={preset}
                label={preset === "today" ? "Today" : preset === "week" ? "Last 7 Days" : preset === "month" ? "Last 30 Days" : preset === "quarter" ? "Last 3 Months" : "Last 1 Year"}
                onClick={() => handlePreset(preset)}
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#FFF7ED", borderColor: "#F97316", color: "#F97316" },
                }}
              />
            ))}
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
                  <MenuItem value="All">All Departments</MenuItem>
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="Product & Design">Product & Design</MenuItem>
                  <MenuItem value="Marketing">Marketing</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="HR & Finance">HR & Finance</MenuItem>
                  <MenuItem value="Facility Operations">Facility Operations</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {reportType === "leave" ? (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Leave Approval Status</InputLabel>
                  <Select value={leaveStatus} label="Leave Approval Status" onChange={(e) => setLeaveStatus(e.target.value)}>
                    <MenuItem value="All">All Statuses</MenuItem>
                    <MenuItem value="Approved">Approved Only</MenuItem>
                    <MenuItem value="Pending">Pending Only</MenuItem>
                    <MenuItem value="Rejected">Rejected Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Employee (Optional)"
                  placeholder="Name or Employee Code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Live Scope Summary Callout */}
        <Box p={2} borderRadius={2.5} bgcolor="#FFF7ED" border="1px solid #FFEDD5">
          <Typography variant="body2" color="#C2410C" fontWeight={600}>
            Ready to generate: <b>{reportType === "attendance" ? "Attendance & Punctuality Report" : "Leave Management Report"}</b> in <b>{format.toUpperCase()}</b> format for <b>{department}</b> from <b>{startDate}</b> to <b>{endDate}</b>.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#FFFFFF", borderTop: "1px solid #E2E8F0", justifyContent: "space-between" }}>
        <Button onClick={onClose} sx={{ color: "#64748B", fontWeight: 700, textTransform: "none" }}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
          sx={{
            bgcolor: "#F97316",
            "&:hover": { bgcolor: "#EA580C" },
            borderRadius: 2.5,
            px: 3.5,
            py: 1.2,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
          }}
        >
          {loading ? "Generating Report..." : `Export ${format.toUpperCase()} Report`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
