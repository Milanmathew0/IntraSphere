import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  Stack,
  LinearProgress,
} from "@mui/material";
import {
  Calendar,
  Plus,
  CheckCircle2,
  Filter,
  Settings,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import AppLayout from "../components/layout/AppLayout";
import ApplyLeaveModal from "../components/Leave/ApplyLeaveModal";
import LeaveApprovalDialog from "../components/Leave/LeaveApprovalDialog";

export default function Leave() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.role || localStorage.getItem("role") || "Employee";

  const isManagerOrAdmin = ["Admin", "HR", "Manager"].includes(role);
  const isHROrAdmin = ["Admin", "HR"].includes(role);

  const [activeTab, setActiveTab] = useState(0);

  // Data States
  const [balances, setBalances] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Category Filter State for My Leave Dashboard (All, Casual, Sick, etc.)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Filter States (for HR/Admin Org Register)
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Loading States
  const [loading, setLoading] = useState(true);

  // Modals & Dialogs
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [selectedApprovalReq, setSelectedApprovalReq] = useState(null);

  // Toast State
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  const fetchAllLeaveData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Leave Types
      const typesRes = await api.get("/api/v1/leave-requests/types/");
      const filteredTypes = (typesRes.data || []).filter((t) => {
        const name = t.name?.toLowerCase() || "";
        return !name.includes("unpaid") && !name.includes("earned");
      });
      setLeaveTypes(filteredTypes);

      // 2. Fetch My Balances & Requests
      const [balRes, myReqRes] = await Promise.all([
        api.get("/api/v1/leave-requests/balances/me"),
        api.get("/api/v1/leave-requests/my"),
      ]);
      const filteredBalances = (balRes.data || []).filter((b) => {
        const name = b.leave_type_name?.toLowerCase() || "";
        return !name.includes("unpaid") && !name.includes("earned");
      });
      setBalances(filteredBalances);
      setMyRequests(myReqRes.data || []);

      // 3. If Manager/HR/Admin, fetch pending approvals
      if (isManagerOrAdmin) {
        const pendRes = await api.get(
          "/api/v1/leave-requests/pending-approvals",
        );
        setPendingApprovals(pendRes.data || []);
      }

      // 4. If HR/Admin, fetch all org requests & holidays
      if (isHROrAdmin) {
        const [allReqRes, holRes] = await Promise.all([
          api.get("/api/v1/leave-requests/all"),
          api.get("/api/v1/leave-requests/holidays/"),
        ]);
        setAllRequests(allReqRes.data || []);
        setHolidays(holRes.data || []);
      }
    } catch (err) {
      console.error("Error loading leave portal data:", err);
      showToast("Error loading leave data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaveData();
  }, []);

  // Handle Cancel/Withdraw Request
  const handleCancelRequest = async (requestId) => {
    try {
      await api.patch(`/api/v1/leave-requests/${requestId}/cancel`, {
        cancellation_reason: "Cancelled by employee",
      });
      showToast("Leave request cancelled successfully.");
      fetchAllLeaveData();
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to cancel request.",
        "error",
      );
    }
  };

  // Enterprise Color Status Chips
  const getStatusChip = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Chip
            label="Approved"
            size="small"
            sx={{
              bgcolor: "#DCFCE7",
              color: "#15803D",
              border: "1px solid #BBF7D0",
              fontWeight: 700,
              borderRadius: "8px",
              px: 1,
            }}
          />
        );
      case "Pending":
      case "Awaiting":
        return (
          <Chip
            label="Awaiting Approval"
            size="small"
            sx={{
              bgcolor: "#FEF3C7",
              color: "#B45309",
              border: "1px solid #FDE68A",
              fontWeight: 700,
              borderRadius: "8px",
              px: 1,
            }}
          />
        );
      case "Rejected":
      case "Declined":
        return (
          <Chip
            label="Declined"
            size="small"
            sx={{
              bgcolor: "#FEE2E2",
              color: "#B91C1C",
              border: "1px solid #FCA5A5",
              fontWeight: 700,
              borderRadius: "8px",
              px: 1,
            }}
          />
        );
      case "Cancelled":
        return (
          <Chip
            label="Cancelled"
            size="small"
            sx={{
              bgcolor: "#F1F5F9",
              color: "#64748B",
              border: "1px solid #E2E8F0",
              fontWeight: 700,
              borderRadius: "8px",
              px: 1,
            }}
          />
        );
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 700, borderRadius: "8px" }} />;
    }
  };

  // Helper to format date display for leave cards (e.g., Wed, 16 Dec)
  const formatCardDate = (startStr, endStr, totalDays, isHalfDay) => {
    try {
      const s = new Date(startStr);
      const startFmt = s.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
      if (startStr === endStr || totalDays <= 1) {
        return startFmt;
      }
      const e = new Date(endStr);
      const endFmt = e.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
      return `${startFmt} - ${endFmt}`;
    } catch {
      return `${startStr} - ${endStr}`;
    }
  };

  // Helper to get month label (e.g. "December 2026")
  const getMonthLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } catch {
      return "Recent";
    }
  };

  // Filter requests by category
  const filteredMyRequests = myRequests.filter((req) => {
    if (selectedCategoryFilter === "All") return true;
    return req.leave_type_name?.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
  });

  // Group requests by Month
  const groupedRequests = filteredMyRequests.reduce((acc, req) => {
    const month = getMonthLabel(req.start_date || req.created_at);
    if (!acc[month]) acc[month] = [];
    acc[month].push(req);
    return acc;
  }, {});

  return (
    <AppLayout activeTabOverride="leave">
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
              Leaves & Time Off
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.25}>
              Track your leave balance, submit new applications, and inspect status.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setOpenApplyModal(true)}
            sx={{
              borderRadius: "10px",
              px: 2.5,
              py: 1,
              bgcolor: "#1976D2",
              color: "#FFFFFF",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.88rem",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": { bgcolor: "#1565C0" },
            }}
          >
            Apply for Leave
          </Button>
        </Box>

        {/* Content Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            p: 0.8,
            borderRadius: "14px",
            mb: 3,
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.88rem",
                borderRadius: "10px",
                minHeight: 42,
                color: "#64748B",
                "&.Mui-selected": {
                  color: "#1976D2",
                },
              },
            }}
          >
            <Tab
              icon={<Calendar size={18} />}
              iconPosition="start"
              label="My Leave Dashboard"
            />
            {isManagerOrAdmin && (
              <Tab
                icon={<UserCheck size={18} />}
                iconPosition="start"
                label={`Pending Approvals (${pendingApprovals.length})`}
              />
            )}
            {isHROrAdmin && (
              <Tab
                icon={<Filter size={18} />}
                iconPosition="start"
                label="Organization Register"
              />
            )}
            {isHROrAdmin && (
              <Tab
                icon={<Settings size={18} />}
                iconPosition="start"
                label="Policy & Quota Settings"
              />
            )}
          </Tabs>
        </Paper>

        {/* TAB 0: My Leave Dashboard */}
        {activeTab === 0 && (
          <Stack spacing={3.5}>
            {/* Summary Quota Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(4, 1fr)",
                },
                gap: 2.5,
              }}
            >
              {balances
                .filter((b) => {
                  const name = b.leave_type_name?.toLowerCase() || "";
                  return !name.includes("unpaid") && !name.includes("earned");
                })
                .map((b) => {
                  const remaining = b.remaining || 0;
                  const allocated = b.allocated || 1;
                  const percent = Math.min(100, Math.round((remaining / allocated) * 100));

                  return (
                    <Paper
                      key={b._id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: "16px",
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#1976D2",
                          boxShadow: "0 6px 20px rgba(25, 118, 210, 0.08)",
                        },
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1.5}
                      >
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                          {b.leave_type_name}
                        </Typography>
                        <Chip
                          label={`FY ${b.year}`}
                          size="small"
                          sx={{
                            bgcolor: "#EFF6FF",
                            color: "#1E40AF",
                            border: "1px solid #DBEAFE",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                          }}
                        />
                      </Box>

                      <Typography variant="h4" fontWeight={800} color="#0F172A" mb={1}>
                        {b.remaining}{" "}
                        <Typography component="span" variant="body2" color="#64748B" fontWeight={600}>
                          / {b.allocated} Days Left
                        </Typography>
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "#F1F5F9",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: percent > 25 ? "#1976D2" : "#EF4444",
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Paper>
                  );
                })}
            </Box>

            {/* LEAVE CATEGORY FILTER BAR */}
            <Paper elevation={0} sx={{ p: 1.2, borderRadius: "14px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="body2" fontWeight={700} color="#64748B" sx={{ mr: 1, pl: 1 }}>
                  Category:
                </Typography>
                {["All", "Casual", "Sick"].map((cat) => {
                  const isSelected = selectedCategoryFilter === cat;
                  return (
                    <Button
                      key={cat}
                      size="small"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      sx={{
                        borderRadius: "50px",
                        px: 2.5,
                        py: 0.6,
                        fontWeight: 700,
                        textTransform: "none",
                        fontSize: "0.82rem",
                        bgcolor: isSelected ? "#1976D2" : "#F8FAFC",
                        color: isSelected ? "#FFFFFF" : "#475569",
                        border: isSelected ? "1px solid #1976D2" : "1px solid #E2E8F0",
                        boxShadow: isSelected ? "0 4px 12px rgba(25, 118, 210, 0.3)" : "none",
                        "&:hover": {
                          bgcolor: isSelected ? "#1565C0" : "#F1F5F9",
                        },
                      }}
                    >
                      {cat}
                    </Button>
                  );
                })}
              </Stack>
            </Paper>

            {/* LEAVE CARDS GROUPED BY MONTH */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={36} sx={{ color: "#1976D2" }} />
              </Box>
            ) : Object.keys(groupedRequests).length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: "16px", border: "1px solid #E2E8F0", bgcolor: "#FFFFFF" }}>
                <Calendar size={44} color="#94A3B8" style={{ marginBottom: 12 }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  No leave applications found
                </Typography>
                <Typography variant="body2" color="#64748B" mt={0.5}>
                  Click 'Apply for Leave' to submit your first application.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {Object.entries(groupedRequests).map(([monthLabel, requests]) => (
                  <Box key={monthLabel}>
                    {/* Month Group Header */}
                    <Typography variant="subtitle2" fontWeight={800} color="#64748B" mb={1.5} sx={{ pl: 0.5 }}>
                      {monthLabel}
                    </Typography>

                    {/* Cards Stack */}
                    <Stack spacing={1.5}>
                      {requests.map((req) => (
                        <Paper
                          key={req._id}
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: "16px",
                            bgcolor: "#FFFFFF",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#1976D2",
                              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.08)",
                            },
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                            <Box flexGrow={1}>
                              {/* Application Type Subtitle */}
                              <Typography variant="caption" fontWeight={700} color="#64748B">
                                {req.is_half_day
                                  ? "Half Day Application"
                                  : req.total_days === 1
                                  ? "Full Day Application"
                                  : `${req.total_days} Days Application`}
                              </Typography>

                              {/* Dates Title */}
                              <Typography variant="h6" fontWeight={800} color="#0F172A" mt={0.25} mb={0.5}>
                                {formatCardDate(req.start_date, req.end_date, req.total_days, req.is_half_day)}
                              </Typography>

                              {/* Category & Session Pill */}
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={req.leave_type_name}
                                  size="small"
                                  sx={{
                                    bgcolor: "#EFF6FF",
                                    color: "#1E40AF",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 22,
                                    border: "1px solid #DBEAFE",
                                  }}
                                />
                                {req.is_half_day && (
                                  <Typography variant="caption" color="#64748B" fontWeight={600}>
                                    • {req.half_day_session} Session
                                  </Typography>
                                )}
                              </Stack>
                            </Box>

                            {/* Status Chip & Actions */}
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              {getStatusChip(req.status)}

                              {req.status === "Pending" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleCancelRequest(req._id)}
                                  sx={{
                                    borderRadius: "8px",
                                    textTransform: "none",
                                    fontWeight: 700,
                                    color: "#EF4444",
                                    borderColor: "#FCA5A5",
                                    "&:hover": { borderColor: "#EF4444", bgcolor: "#FEE2E2" },
                                  }}
                                >
                                  Withdraw
                                </Button>
                              )}

                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  bgcolor: "#F8FAFC",
                                  border: "1px solid #E2E8F0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#1976D2",
                                }}
                              >
                                <ChevronRight size={18} />
                              </Box>
                            </Stack>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {/* TAB 1: Pending Approvals (Manager/HR/Admin) */}
        {activeTab === 1 && isManagerOrAdmin && (
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Team Leave Approvals
                </Typography>
                <Typography variant="body2" color="#64748B">
                  Pending requests requiring your authorization.
                </Typography>
              </Box>

              <Chip
                label={`${pendingApprovals.length} Pending`}
                sx={{
                  bgcolor: "#EFF6FF",
                  color: "#1E40AF",
                  border: "1px solid #DBEAFE",
                  fontWeight: 800,
                }}
              />
            </Box>

            {pendingApprovals.length === 0 ? (
              <Box textAlign="center" py={6}>
                <CheckCircle2 size={40} color="#10B981" style={{ marginBottom: 12 }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  No pending approvals
                </Typography>
                <Typography variant="body2" color="#64748B" mt={0.5}>
                  All team leave requests have been reviewed!
                </Typography>
              </Box>
            ) : (
              <Table sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApprovals.map((req) => (
                    <TableRow key={req._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                          {req.employee_name}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {req.employee_code} • {req.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {req.leave_type_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="#475569">
                          {req.start_date} to {req.end_date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800} color="#0F172A">
                          {req.total_days} Day(s)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="#64748B"
                          sx={{ maxWidth: 200 }}
                          noWrap
                        >
                          {req.reason}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => setSelectedApprovalReq(req)}
                          sx={{
                            borderRadius: "8px",
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: "#1976D2",
                            color: "#FFFFFF",
                            "&:hover": { bgcolor: "#1565C0" },
                          }}
                        >
                          Review Request
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        )}

        {/* TAB 2: All Organization Requests (HR/Admin) */}
        {activeTab === 2 && isHROrAdmin && (
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "16px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800} color="#0F172A">
                  Organization Leave Register
                </Typography>
                <Typography variant="body2" color="#64748B">
                  Full audit log of company-wide leave applications.
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <TextField
                  select
                  size="small"
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{ width: 140 }}
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </TextField>
              </Stack>
            </Box>

            <Table sx={{ border: "1px solid #E2E8F0", borderRadius: "12px" }}>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Approved By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRequests
                  .filter(
                    (r) =>
                      filterStatus === "All" || r.status === filterStatus,
                  )
                  .map((row) => (
                    <TableRow key={row._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                          {row.employee_name}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {row.department}
                        </Typography>
                      </TableCell>
                      <TableCell>{row.leave_type_name}</TableCell>
                      <TableCell>
                        {row.start_date} to {row.end_date}
                      </TableCell>
                      <TableCell>{row.total_days} Day(s)</TableCell>
                      <TableCell>{getStatusChip(row.status)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" color="#64748B">
                          {row.approved_by_name || "N/A"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        )}

        {/* TAB 3: Policy & Balances Management (HR/Admin) */}
        {activeTab === 3 && isHROrAdmin && (
          <Stack spacing={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: "16px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
              }}
            >
              <Typography variant="h6" fontWeight={800} color="#0F172A" mb={1}>
                Leave Policy Definitions
              </Typography>
              <Typography variant="body2" color="#64748B" mb={3}>
                Configured leave categories, annual quotas, and rollover policies.
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {leaveTypes
                  .filter((t) => {
                    const name = t.name?.toLowerCase() || "";
                    return !name.includes("unpaid") && !name.includes("earned");
                  })
                  .map((t) => (
                    <Paper
                      key={t._id}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: "16px",
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="#0F172A"
                      >
                        {t.name} ({t.code})
                      </Typography>
                      <Typography variant="body2" color="#64748B" mb={2}>
                        {t.description}
                      </Typography>

                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="#64748B">
                            Annual Quota:
                          </Typography>
                          <Typography variant="caption" fontWeight={800} color="#0F172A">
                            {t.default_allocated_days} Days / Year
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="#64748B">
                            Max Consecutive:
                          </Typography>
                          <Typography variant="caption" fontWeight={800} color="#0F172A">
                            {t.maximum_consecutive_days || "Unlimited"} Days
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="#64748B">
                            Requires Attachment:
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            color="#0F172A"
                          >
                            {t.requires_attachment ? "Yes" : "No"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                ))}
              </Box>
            </Paper>
          </Stack>
        )}
      </Box>

      {/* Apply Leave Modal */}
      <ApplyLeaveModal
        open={openApplyModal}
        onClose={() => setOpenApplyModal(false)}
        onSuccess={() => {
          showToast("Leave request submitted successfully!");
          fetchAllLeaveData();
        }}
        leaveTypes={leaveTypes}
      />

      {/* Review Approval Dialog */}
      {selectedApprovalReq && (
        <LeaveApprovalDialog
          open={Boolean(selectedApprovalReq)}
          onClose={() => setSelectedApprovalReq(null)}
          request={selectedApprovalReq}
          onSuccess={() => {
            showToast("Leave request decision recorded successfully!");
            fetchAllLeaveData();
          }}
        />
      )}

      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} sx={{ borderRadius: "12px" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
