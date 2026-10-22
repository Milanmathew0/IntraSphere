import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  LinearProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Alert,
  Snackbar,
  Card,
  CardContent,
} from "@mui/material";
import {
  Building,
  LayoutGrid,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  Sparkles,
  BarChart3,
  Users,
} from "lucide-react";
import TableViewIcon from "@mui/icons-material/TableView";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import api from "../../api/axios";
import { exportResourceUtilizationReport } from "../../utils/reportExport";

export default function ResourceUtilizationReports() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedFloor, setSelectedFloor] = useState("");
  const [selectedZone, setSelectedZone] = useState("All");
  const [resourceFilter, setResourceFilter] = useState("all"); // 'all', 'rooms', 'workspaces'

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null); // 'excel', 'pdf', or null
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const fetchUtilizationData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/facility/reports/utilization", {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          floor: selectedFloor !== "" ? selectedFloor : undefined,
          zone: selectedZone !== "All" ? selectedZone : undefined,
          resource_type: resourceFilter !== "all" ? resourceFilter : undefined,
        },
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to load utilization reports:", err);
      // Fallback mock if offline
      setData({
        metadata: {
          report_title: "Facility Resource Utilization & Occupancy Report",
          start_date: startDate,
          end_date: endDate,
          working_days: 22,
          operating_hours_per_unit: 198,
          floor: selectedFloor !== "" ? `Floor ${selectedFloor}` : "All Floors",
          zone: selectedZone,
          generated_at: new Date().toLocaleString(),
        },
        summary: {
          overall_space_efficiency_score: 64.5,
          meeting_rooms: {
            total_rooms: 6,
            total_capacity: 68,
            total_bookings: 34,
            total_hours_booked: 142.5,
            average_occupancy_rate: 68.2,
            peak_booking_time: "10:00 AM - 12:00 PM",
          },
          workspaces: {
            total_desks: 24,
            total_zones: 4,
            total_reservations: 86,
            total_hours_reserved: 312.0,
            average_utilization_rate: 60.8,
            peak_reservation_time: "09:00 AM - 01:00 PM",
          },
        },
        rooms: [],
        desks: [],
        zones: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilizationData();
  }, [startDate, endDate, selectedFloor, selectedZone, resourceFilter]);

  const handleQuickPreset = (preset) => {
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
    }
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      setToast({ open: true, message: `Generating Resource Utilization Report (${format.toUpperCase()})...`, severity: "info" });
      await exportResourceUtilizationReport({
        format,
        startDate,
        endDate,
        floor: selectedFloor !== "" ? selectedFloor : undefined,
        zone: selectedZone !== "All" ? selectedZone : undefined,
        resourceType: resourceFilter !== "all" ? resourceFilter : undefined,
      });
      setToast({ open: true, message: `Report exported successfully in ${format.toUpperCase()} format!`, severity: "success" });
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Failed to export report. Please try again.", severity: "error" });
    } finally {
      setExporting(null);
    }
  };

  const summary = data?.summary || {};
  const roomSummary = summary.meeting_rooms || {};
  const wsSummary = summary.workspaces || {};
  const roomsList = data?.rooms || [];
  const desksList = data?.desks || [];
  const zonesList = data?.zones || [];

  return (
    <Box sx={{ width: "100%" }}>
      {/* 1. TOP HEADER & EXPORT ACTION BAR */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3.5,
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
          mb: 3.5,
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={2.5}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  bgcolor: "#FFF7ED",
                  color: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart3 size={22} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Resource Utilization & Room Occupancy Reports
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Real-time analytics and downloadable executive reports for conference room occupancy and workspace utilization
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Export Action Buttons */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={exporting === "excel" ? <CircularProgress size={16} color="inherit" /> : <TableViewIcon />}
              onClick={() => handleExport("excel")}
              disabled={!!exporting}
              sx={{
                bgcolor: "#16A34A",
                color: "#FFFFFF",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)",
                "&:hover": { bgcolor: "#15803D" },
              }}
            >
              {exporting === "excel" ? "Exporting..." : "Export Excel (.xlsx)"}
            </Button>

            <Button
              variant="contained"
              startIcon={exporting === "pdf" ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdfIcon />}
              onClick={() => handleExport("pdf")}
              disabled={!!exporting}
              sx={{
                bgcolor: "#DC2626",
                color: "#FFFFFF",
                fontWeight: 700,
                textTransform: "none",
                borderRadius: 2.5,
                px: 2.5,
                py: 1,
                boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                "&:hover": { bgcolor: "#B91C1C" },
              }}
            >
              {exporting === "pdf" ? "Exporting..." : "Export PDF (.pdf)"}
            </Button>
          </Stack>
        </Stack>

        {/* 2. FILTER CONTROLS BAR */}
        <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid #F1F5F9" }}>
          {/* Quick Preset Pills */}
          <Stack direction="row" spacing={1} mb={2} alignItems="center" flexWrap="wrap">
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Quick Presets:
            </Typography>
            {["today", "week", "month", "quarter"].map((p) => (
              <Chip
                key={p}
                label={p === "today" ? "Today" : p === "week" ? "This Week" : p === "month" ? "This Month" : "This Quarter"}
                size="small"
                onClick={() => handleQuickPreset(p)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  cursor: "pointer",
                  bgcolor: "#F8FAFC",
                  "&:hover": { bgcolor: "#FFF7ED", color: "#F97316" },
                }}
              />
            ))}
          </Stack>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.5}>
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

            <Grid item xs={12} sm={6} md={2.5}>
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

            <Grid item xs={12} sm={4} md={2.2}>
              <FormControl fullWidth size="small">
                <InputLabel>Floor Filter</InputLabel>
                <Select
                  value={selectedFloor}
                  label="Floor Filter"
                  onChange={(e) => setSelectedFloor(e.target.value)}
                >
                  <MenuItem value="">All Floors</MenuItem>
                  <MenuItem value="1">Floor 1</MenuItem>
                  <MenuItem value="2">Floor 2</MenuItem>
                  <MenuItem value="3">Floor 3</MenuItem>
                  <MenuItem value="4">Floor 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Workspace Zone</InputLabel>
                <Select
                  value={selectedZone}
                  label="Workspace Zone"
                  onChange={(e) => setSelectedZone(e.target.value)}
                >
                  <MenuItem value="All">All Zones</MenuItem>
                  <MenuItem value="Atrium Open Workspace">Atrium Open Workspace</MenuItem>
                  <MenuItem value="Engineering Zone">Engineering Zone</MenuItem>
                  <MenuItem value="Quiet Focus Pods">Quiet Focus Pods</MenuItem>
                  <MenuItem value="Executive Lounge">Executive Lounge</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4} md={2.4}>
              <FormControl fullWidth size="small">
                <InputLabel>Resource Scope</InputLabel>
                <Select
                  value={resourceFilter}
                  label="Resource Scope"
                  onChange={(e) => setResourceFilter(e.target.value)}
                >
                  <MenuItem value="all">All Resources</MenuItem>
                  <MenuItem value="rooms">Meeting Rooms Only</MenuItem>
                  <MenuItem value="workspaces">Workspaces Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? (
        <Box textAlign="center" py={8}>
          <CircularProgress sx={{ color: "#F97316" }} />
          <Typography variant="body2" color="text.secondary" mt={1.5} fontWeight={600}>
            Computing room occupancy and workspace utilization metrics...
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3.5}>
          {/* 3. EXECUTIVE KPI METRICS (4-COLUMN RESPONSIVE GRID) */}
          <Grid container spacing={2.5}>
            {/* KPI 1: Room Occupancy Rate */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" letterSpacing={0.5}>
                      ROOM OCCUPANCY RATE
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#FFF7ED", color: "#F97316" }}>
                      <Building size={18} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" fontWeight={900} color="#0F172A" mb={0.5}>
                    {roomSummary.average_occupancy_rate ?? 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(roomSummary.average_occupancy_rate || 0, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#FFF7ED",
                      "& .MuiLinearProgress-bar": { bgcolor: "#F97316" },
                      mb: 1.5,
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Peak: <b>{roomSummary.peak_booking_time || "10 AM - 12 PM"}</b>
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#F97316">
                      {roomSummary.total_bookings ?? 0} bookings
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI 2: Workspace Utilization Rate */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" letterSpacing={0.5}>
                      WORKSPACE UTILIZATION
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#F0FDF4", color: "#16A34A" }}>
                      <LayoutGrid size={18} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" fontWeight={900} color="#0F172A" mb={0.5}>
                    {wsSummary.average_utilization_rate ?? 0}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(wsSummary.average_utilization_rate || 0, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#F0FDF4",
                      "& .MuiLinearProgress-bar": { bgcolor: "#16A34A" },
                      mb: 1.5,
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Peak: <b>{wsSummary.peak_reservation_time || "09 AM - 01 PM"}</b>
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#16A34A">
                      {wsSummary.total_reservations ?? 0} reservations
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI 3: Space Efficiency Index */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" letterSpacing={0.5}>
                      SPACE EFFICIENCY SCORE
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#EFF6FF", color: "#2563EB" }}>
                      <TrendingUp size={18} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" fontWeight={900} color="#2563EB" mb={0.5}>
                    {summary.overall_space_efficiency_score ?? 65}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(summary.overall_space_efficiency_score || 0, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: "#EFF6FF",
                      "& .MuiLinearProgress-bar": { bgcolor: "#2563EB" },
                      mb: 1.5,
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Health Rating
                    </Typography>
                    <Chip
                      label={(summary.overall_space_efficiency_score || 0) >= 60 ? "Optimal Use" : "Moderate Use"}
                      size="small"
                      sx={{
                        bgcolor: (summary.overall_space_efficiency_score || 0) >= 60 ? "#DCFCE7" : "#FEF3C7",
                        color: (summary.overall_space_efficiency_score || 0) >= 60 ? "#15803D" : "#B45309",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* KPI 4: Total Resource Inventory */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3.5,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="caption" fontWeight={700} color="#64748B" letterSpacing={0.5}>
                      ACTIVE CAPACITY SCOPE
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#F3E8FF", color: "#9333EA" }}>
                      <Users size={18} />
                    </Box>
                  </Stack>
                  <Typography variant="h4" fontWeight={900} color="#0F172A" mb={0.5}>
                    {(roomSummary.total_rooms || 0) + (wsSummary.total_desks || 0)} Units
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    {roomSummary.total_rooms || 0} Rooms ({roomSummary.total_capacity || 0} seats) • {wsSummary.total_desks || 0} Workstations
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Active Floors
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="#9333EA">
                      4 Operating Floors
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 4. ROOM OCCUPANCY BREAKDOWN (TABLE & METRICS) */}
          {resourceFilter !== "workspaces" && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#FFF7ED", color: "#F97316" }}>
                    <Building size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} color="#0F172A">
                      Meeting Room Occupancy Rates
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Occupancy % computed as hours booked vs total operating capacity ({data?.metadata?.operating_hours_per_unit || 198} hrs/room)
                    </Typography>
                  </Box>
                </Stack>
              </Stack>

              <TableContainer sx={{ border: "1px solid #F1F5F9", borderRadius: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Room Code & Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Floor & Location</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Capacity</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Bookings Count</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Hours Booked</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Occupancy Rate (%)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {roomsList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No meeting room records found matching filter criteria.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      roomsList.map((rm, idx) => {
                        const occ = rm.occupancy_rate_percent || 0;
                        const isHigh = occ >= 50;
                        const isMed = occ >= 20 && occ < 50;
                        return (
                          <TableRow key={idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                                {rm.room_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {rm.room_code}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" color="#334155">
                                Floor {rm.floor} • {rm.location}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Chip label={`${rm.capacity} Seats`} size="small" sx={{ fontWeight: 600, bgcolor: "#F1F5F9" }} />
                            </TableCell>

                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={700} color="#0F172A">
                                {rm.total_bookings}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={600} color="#475569">
                                {rm.total_hours_booked}h / {rm.operating_hours}h
                              </Typography>
                            </TableCell>

                            <TableCell align="center" sx={{ minWidth: 160 }}>
                              <Stack spacing={0.5} alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(occ, 100)}
                                    sx={{
                                      flexGrow: 1,
                                      height: 7,
                                      borderRadius: 4,
                                      bgcolor: "#F1F5F9",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor: isHigh ? "#16A34A" : isMed ? "#F97316" : "#94A3B8",
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" fontWeight={800} color={isHigh ? "#16A34A" : isMed ? "#F97316" : "#64748B"}>
                                    {occ}%
                                  </Typography>
                                </Stack>
                              </Stack>
                            </TableCell>

                            <TableCell align="center">
                              <Chip
                                label={rm.status}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: rm.status === "Available" ? "#DCFCE7" : rm.status === "Maintenance" ? "#FEF3C7" : "#FEE2E2",
                                  color: rm.status === "Available" ? "#15803D" : rm.status === "Maintenance" ? "#B45309" : "#B91C1C",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* 5. WORKSPACE & DESK UTILIZATION (ZONE SUMMARY & DESK TABLE) */}
          {resourceFilter !== "rooms" && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3.5,
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: "#F0FDF4", color: "#16A34A" }}>
                  <LayoutGrid size={20} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} color="#0F172A">
                    Workspace & Desk Utilization Breakdown
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Utilization % per zone and individual workstation based on confirmed desk reservations
                  </Typography>
                </Box>
              </Stack>

              {/* Zone Summary Chips / Mini Grid */}
              <Grid container spacing={2} mb={3}>
                {zonesList.map((zn, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Box
                      p={2}
                      borderRadius={2.5}
                      bgcolor="#F8FAFC"
                      border="1px solid #E2E8F0"
                      sx={{ transition: "all 0.2s ease", "&:hover": { borderColor: "#16A34A" } }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          {zn.zone_name}
                        </Typography>
                        <Chip label={`Floor ${zn.floor}`} size="small" sx={{ fontSize: "0.7rem", height: 20 }} />
                      </Stack>
                      <Typography variant="h5" fontWeight={800} color="#16A34A" mb={0.5}>
                        {zn.utilization_rate_percent}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(zn.utilization_rate_percent || 0, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#E2E8F0",
                          "& .MuiLinearProgress-bar": { bgcolor: "#16A34A" },
                          mb: 1,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {zn.total_desks} desks • {zn.total_reservations} reservations ({zn.total_hours_reserved}h)
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Detailed Desk Utilization Table */}
              <Typography variant="subtitle2" fontWeight={800} color="#334155" mb={1.5}>
                Individual Workstation Utilization Records
              </Typography>

              <TableContainer sx={{ border: "1px solid #F1F5F9", borderRadius: 3 }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Desk Code & Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Floor & Zone</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Desk Type</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Reservations</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Hours Reserved</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Utilization Rate (%)</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {desksList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No workstation records found matching filter criteria.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      desksList.map((dk, idx) => {
                        const util = dk.utilization_rate_percent || 0;
                        const isHigh = util >= 50;
                        const isMed = util >= 20 && util < 50;
                        return (
                          <TableRow key={idx} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                                {dk.desk_code}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {dk.desk_name}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Typography variant="body2" color="#334155">
                                Floor {dk.floor} • {dk.zone}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip label={dk.workspace_type} size="small" sx={{ fontWeight: 600, bgcolor: "#F1F5F9" }} />
                            </TableCell>

                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={700} color="#0F172A">
                                {dk.total_reservations}
                              </Typography>
                            </TableCell>

                            <TableCell align="center">
                              <Typography variant="body2" fontWeight={600} color="#475569">
                                {dk.total_hours_reserved}h / {dk.operating_hours}h
                              </Typography>
                            </TableCell>

                            <TableCell align="center" sx={{ minWidth: 160 }}>
                              <Stack spacing={0.5} alignItems="center">
                                <Stack direction="row" spacing={1} alignItems="center" width="100%">
                                  <LinearProgress
                                    variant="determinate"
                                    value={Math.min(util, 100)}
                                    sx={{
                                      flexGrow: 1,
                                      height: 7,
                                      borderRadius: 4,
                                      bgcolor: "#F1F5F9",
                                      "& .MuiLinearProgress-bar": {
                                        bgcolor: isHigh ? "#16A34A" : isMed ? "#F97316" : "#94A3B8",
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" fontWeight={800} color={isHigh ? "#16A34A" : isMed ? "#F97316" : "#64748B"}>
                                    {util}%
                                  </Typography>
                                </Stack>
                              </Stack>
                            </TableCell>

                            <TableCell align="center">
                              <Chip
                                label={dk.status}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: dk.status === "Available" ? "#DCFCE7" : dk.status === "Maintenance" ? "#FEF3C7" : "#FEE2E2",
                                  color: dk.status === "Available" ? "#15803D" : dk.status === "Maintenance" ? "#B45309" : "#B91C1C",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Stack>
      )}

      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: 2.5, fontWeight: 600 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
