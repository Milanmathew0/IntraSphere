import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  InputAdornment,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../../api/axios";

export default function PunctualityReportTable() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [dateRange, setDateRange] = useState("30");

  const fetchReports = async () => {
    setLoading(true);
    try {
      const days = parseInt(dateRange, 10) || 30;
      const endDate = new Date().toISOString().split("T")[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - days);
      const startDate = startDateObj.toISOString().split("T")[0];

      const res = await api.get("/api/v1/attendance/punctuality-reports", {
        params: {
          start_date: startDate,
          end_date: endDate,
          department: department === "All" ? "" : department,
          search: search.trim(),
        },
      });
      setReports(res.data.reports || []);
    } catch (err) {
      console.error("Failed to fetch punctuality reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, department, dateRange]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const days = parseInt(dateRange, 10) || 30;
      const endDate = new Date().toISOString().split("T")[0];
      const startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - days);
      const startDate = startDateObj.toISOString().split("T")[0];

      const response = await api.get("/api/v1/attendance/punctuality-reports/export", {
        params: {
          start_date: startDate,
          end_date: endDate,
          department: department === "All" ? "" : department,
          search: search.trim(),
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `IntraSphere_Punctuality_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to export CSV report", err);
    } finally {
      setExporting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (gradeFilter === "All") return true;
    return r.grade === gradeFilter;
  });

  const getGradeChip = (grade, score) => {
    let color = "default";
    let bg = "#F1F5F9";
    let text = "#475569";

    if (grade === "Excellent") {
      bg = "#DCFCE7";
      text = "#15803D";
    } else if (grade === "Good") {
      bg = "#DBEAFE";
      text = "#1E40AF";
    } else if (grade === "Average") {
      bg = "#FEF3C7";
      text = "#B45309";
    } else if (grade === "Needs Improvement") {
      bg = "#FEE2E2";
      text = "#B91C1C";
    }

    return (
      <Chip
        label={`${grade} (${score}%)`}
        size="small"
        sx={{
          bgcolor: bg,
          color: text,
          fontWeight: 700,
          fontSize: "0.75rem",
          borderRadius: "6px",
        }}
      />
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AssessmentIcon sx={{ color: "#F97316" }} /> Punctuality & Evaluation Reports
          </Typography>
          <Typography variant="body2" color="#64748B">
            Individual employee punctuality ratings, check-in averages, and evaluation metrics.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={exporting ? <CircularProgress size={18} color="inherit" /> : <FileDownloadIcon />}
          onClick={handleExportCSV}
          disabled={exporting}
          sx={{
            bgcolor: "#F97316",
            color: "#FFFFFF",
            fontWeight: 700,
            borderRadius: "10px",
            textTransform: "none",
            px: 2.5,
            py: 1,
            "&:hover": { bgcolor: "#EA580C" },
          }}
        >
          {exporting ? "Generating CSV..." : "Export Evaluation Report"}
        </Button>
      </Stack>

      {/* Filter Toolbar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        mb={3}
      >
        <TextField
          placeholder="Search by name, employee code or email..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
              bgcolor: "#F8FAFC",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94A3B8" }} />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1.5} sx={{ minWidth: { sm: 380 }, width: { xs: "100%", sm: "auto" } }}>
          <FormControl size="small" fullWidth>
            <Select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              sx={{ borderRadius: "10px", bgcolor: "#F8FAFC", fontWeight: 600, fontSize: "0.85rem" }}
            >
              <MenuItem value="All">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Operations">Operations</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <Select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              sx={{ borderRadius: "10px", bgcolor: "#F8FAFC", fontWeight: 600, fontSize: "0.85rem" }}
            >
              <MenuItem value="All">All Grades</MenuItem>
              <MenuItem value="Excellent">Excellent (&gt;=90%)</MenuItem>
              <MenuItem value="Good">Good (75-89%)</MenuItem>
              <MenuItem value="Average">Average (60-74%)</MenuItem>
              <MenuItem value="Needs Improvement">Needs Improvement (&lt;60%)</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Report Table */}
      <TableContainer>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: "#F8FAFC" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Employee</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Department & Role</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Days Present</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>On-Time / Late</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Avg Check-In</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Avg Daily Hours</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Punctuality Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={32} sx={{ color: "#F97316" }} />
                  <Typography variant="body2" color="#64748B" mt={1}>
                    Loading employee evaluation data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" fontWeight={600} color="#334155">
                    No punctuality reports match your filters.
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    Try clearing search criteria or adjusting the department filter.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((row) => (
                <TableRow key={row.employee_id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  {/* Employee */}
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: "#F97316", width: 36, height: 36, fontWeight: 700, fontSize: "0.85rem" }}>
                        {row.employee_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          {row.employee_name}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {row.employee_code} • {row.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Department & Role */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="#334155">
                      {row.department}
                    </Typography>
                    <Typography variant="caption" color="#64748B">
                      {row.designation}
                    </Typography>
                  </TableCell>

                  {/* Days Present */}
                  <TableCell align="center">
                    <Chip label={`${row.total_days_present} days`} size="small" sx={{ fontWeight: 700, bgcolor: "#F1F5F9", color: "#334155" }} />
                  </TableCell>

                  {/* On-Time / Late */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color="#10B981">
                      {row.on_time_days} <Typography component="span" variant="caption" color="#EF4444" fontWeight={700}>/ {row.late_days} late</Typography>
                    </Typography>
                  </TableCell>

                  {/* Avg Check-In */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={600} color="#334155">
                      {row.avg_check_in_time}
                    </Typography>
                  </TableCell>

                  {/* Avg Daily Hours */}
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {row.avg_daily_hours} hrs
                    </Typography>
                    <Typography variant="caption" color="#94A3B8">
                      Total: {row.total_working_hours}h
                    </Typography>
                  </TableCell>

                  {/* Rating Grade */}
                  <TableCell align="center">
                    {getGradeChip(row.grade, row.punctuality_score)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
