import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  Sparkles,
  Calendar,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Filter,
  FileText,
  Settings,
  UserCheck,
  RefreshCw,
  Ban,
  ArrowUpRight,
  LayoutDashboard,
  Building,
  ChevronRight,
  LogOut,
  Search,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";
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

  // Category Filter State for My Leave Dashboard (Monochrome Filter: All, Casual, Sick, etc.)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");

  // Filter States (for HR/Admin Org Register)
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Loading States
  const [loading, setLoading] = useState(true);

  // Modals & Dialogs
  const [openApplyModal, setOpenApplyModal] = useState(false);
  const [selectedApprovalReq, setSelectedApprovalReq] = useState(null);
  const [openAdjustModal, setOpenAdjustModal] = useState(false);
  const [adjustEmpId, setAdjustEmpId] = useState("");
  const [adjustLeaveTypeId, setAdjustLeaveTypeId] = useState("");
  const [adjustAllocated, setAdjustAllocated] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

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

  // Black & White / Monochrome Status Chips
  const getStatusChip = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Chip
            label="Approved"
            size="small"
            sx={{
              bgcolor: "#09090B",
              color: "#FFFFFF",
              fontWeight: 800,
              borderRadius: "8px",
              px: 1,
            }}
          />
        );
      case "Pending":
      case "Awaiting":
        return (
          <Chip
            label="Awaiting"
            size="small"
            sx={{
              bgcolor: "#F4F4F5",
              color: "#09090B",
              border: "1px solid #E4E4E7",
              fontWeight: 800,
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
              bgcolor: "#27272A",
              color: "#FFFFFF",
              fontWeight: 800,
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
              bgcolor: "#F4F4F5",
              color: "#71717A",
              border: "1px solid #E4E4E7",
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

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const navTabs = [
    {
      id: 0,
      label: "My Dashboard & Overview",
      subtitle: "Personal attendance, schedule overview, and quick operations.",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: 1,
      label: "Daily Attendance Log",
      subtitle: "Track check-in status and inspect your monthly attendance history.",
      icon: Clock,
      path: "/dashboard",
    },
    {
      id: 2,
      label: "My Leave Applications",
      subtitle: "Submit new leave requests and track your approval status.",
      icon: Calendar,
      path: "/leave",
      active: true,
    },
    {
      id: 3,
      label: "Workspaces & Rooms",
      subtitle: "Find and book the right space for your next meeting.",
      icon: Building,
      path: "/meeting-rooms",
    },
    {
      id: 4,
      label: "My Profile Settings",
      subtitle: "View personal credentials and account details.",
      icon: Settings,
      path: "/dashboard",
    },
  ];

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
    <Box sx={{ minHeight: "100vh", bgcolor: "#FAFAFA", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      {/* 1. LEFT PERMANENT SIDEBAR (Jet Obsidian Black `#09090B`) */}
      <Box
        sx={{
          width: { xs: 80, md: 250 },
          bgcolor: "#09090B",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          p: 2.5,
          boxShadow: "4px 0 25px rgba(0,0,0,0.12)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Brand Header Badge */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4, px: 1, cursor: "pointer" }}
          onClick={() => navigate("/dashboard")}
        >
          <Box
            sx={{
              bgcolor: "#FFFFFF",
              color: "#09090B",
              px: 2,
              py: 0.8,
              borderRadius: "50px",
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: "0 4px 14px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Sparkles size={18} color="#09090B" />
            <Typography
              variant="subtitle1"
              fontWeight={900}
              letterSpacing={-0.3}
              color="#09090B"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              IntraSphere
            </Typography>
          </Box>
        </Box>

        {/* Sidebar Navigation Menu */}
        <Typography
          variant="caption"
          sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}
        >
          EMPLOYEE PORTAL
        </Typography>

        <Stack spacing={0.75} sx={{ mb: 4 }}>
          {navTabs.map((item) => {
            const isActive = !!item.active;
            const IconComponent = item.icon;
            return (
              <Box
                key={item.id}
                onClick={() => navigate(item.path)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 2,
                  py: 1.25,
                  borderRadius: "12px",
                  cursor: "pointer",
                  bgcolor: isActive ? "#FFFFFF" : "transparent",
                  color: isActive ? "#09090B" : "#A1A1AA",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "14px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.1)",
                    color: "#FFFFFF",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <IconComponent size={18} />
                  <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
                    {item.label}
                  </Typography>
                </Box>
                {isActive && <ChevronRight size={16} sx={{ display: { xs: "none", md: "block" } }} />}
              </Box>
            );
          })}
        </Stack>

        {/* Quick Operations Section */}
        <Typography
          variant="caption"
          sx={{ color: "#71717A", fontWeight: 700, px: 1.5, mb: 1, display: { xs: "none", md: "block" } }}
        >
          QUICK REQUESTS
        </Typography>

        <Stack spacing={0.75}>
          <Box
            onClick={() => setOpenApplyModal(true)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              bgcolor: "#27272A",
              border: "1px solid #3F3F46",
              "&:hover": { bgcolor: "#3F3F46" },
            }}
          >
            <Plus size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Apply for Leave
            </Typography>
          </Box>

          <Box
            onClick={() => navigate("/meeting-rooms")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#FFFFFF",
              fontWeight: 600,
              fontSize: "14px",
              bgcolor: "#27272A",
              border: "1px solid #3F3F46",
              "&:hover": { bgcolor: "#3F3F46" },
            }}
          >
            <Building size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Meeting Rooms
            </Typography>
          </Box>
        </Stack>

        {/* Logout at Bottom */}
        <Box sx={{ mt: "auto", pt: 2, borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <Box
            onClick={() => {
              logout();
              navigate("/login");
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: "12px",
              cursor: "pointer",
              color: "#EF4444",
              fontWeight: 600,
              fontSize: "14px",
              "&:hover": { bgcolor: "rgba(239, 68, 68, 0.12)" },
            }}
          >
            <LogOut size={18} />
            <Typography variant="body2" fontWeight="inherit" sx={{ display: { xs: "none", md: "block" } }}>
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. MAIN WORKSPACE CANVAS AREA */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 2, md: 4 }, overflowX: "hidden" }}>
        {/* Top Header Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900} color="#09090B" letterSpacing={-0.5}>
              Leaves
            </Typography>
            <Typography variant="body2" color="#71717A" mt={0.25}>
              Track your applications, remaining balances, and workforce status.
            </Typography>
          </Box>

          {/* Right Header Action Icons & User Menu */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
                borderRadius: "50px",
                px: 2,
                py: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1,
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
              }}
            >
              <Calendar size={16} color="#71717A" />
              <Typography variant="caption" fontWeight={700} color="#09090B">
                {currentDateFormatted}
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setOpenApplyModal(true)}
              sx={{
                borderRadius: "50px",
                px: 2.5,
                py: 1,
                bgcolor: "#09090B",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.88rem",
                boxShadow: "0 4px 14px rgba(9, 9, 11, 0.25)",
                "&:hover": { bgcolor: "#27272A" },
              }}
            >
              Apply for Leave
            </Button>

            <UserProfileHeader user={user} onLogout={() => { logout(); navigate("/login"); }} />
          </Box>
        </Box>

        {/* Content Navigation Tabs */}
        <Paper
          elevation={0}
          sx={{
            p: 1,
            borderRadius: "16px",
            mb: 3,
            border: "1px solid #E4E4E7",
            bgcolor: "#FFFFFF",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<Calendar size={18} />}
              iconPosition="start"
              label="My Leave Dashboard"
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
            {isManagerOrAdmin && (
              <Tab
                icon={<UserCheck size={18} />}
                iconPosition="start"
                label={`Pending Approvals (${pendingApprovals.length})`}
                sx={{ fontWeight: 700, textTransform: "none" }}
              />
            )}
            {isHROrAdmin && (
              <Tab
                icon={<Filter size={18} />}
                iconPosition="start"
                label="All Organization Requests"
                sx={{ fontWeight: 700, textTransform: "none" }}
              />
            )}
            {isHROrAdmin && (
              <Tab
                icon={<Settings size={18} />}
                iconPosition="start"
                label="Policy & Balances Management"
                sx={{ fontWeight: 700, textTransform: "none" }}
              />
            )}
          </Tabs>
        </Paper>

        {/* TAB 0: My Leave Dashboard */}
        {activeTab === 0 && (
          <Stack spacing={3.5}>
            {/* Summary Quota Cards Grid (Black & White Style) */}
            <Grid container spacing={2.5}>
              {balances
                .filter((b) => {
                  const name = b.leave_type_name?.toLowerCase() || "";
                  return !name.includes("unpaid") && !name.includes("earned");
                })
                .map((b) => (
                  <Grid item xs={12} sm={6} md={3} key={b._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: "16px",
                        bgcolor: "#FFFFFF",
                        border: "1px solid #E4E4E7",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={1.5}
                      >
                        <Typography variant="subtitle1" fontWeight={800} color="#09090B">
                          {b.leave_type_name}
                        </Typography>
                        <Chip
                          label={`${b.year}`}
                          size="small"
                          sx={{ bgcolor: "#F4F4F5", color: "#09090B", fontWeight: 700 }}
                        />
                      </Box>

                      <Typography variant="h4" fontWeight={900} color="#09090B" mb={0.5}>
                        {b.remaining}{" "}
                        <Typography component="span" variant="body2" color="#71717A" fontWeight={600}>
                          / {b.allocated} Days
                        </Typography>
                      </Typography>

                      <Stack direction="row" spacing={2} mt={1.5} pt={1.5} sx={{ borderTop: "1px solid #F4F4F5" }}>
                        <Box>
                          <Typography variant="caption" color="#71717A">
                            Used: <strong>{b.used}d</strong>
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="#71717A">
                            Pending: <strong>{b.pending}d</strong>
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
            </Grid>

            {/* MONOCHROME LEAVE CATEGORY FILTER BAR (Matching User Screenshot: All, Casual, Sick) */}
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: "16px", border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="body2" fontWeight={700} color="#71717A" sx={{ mr: 1, pl: 1 }}>
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
                        bgcolor: isSelected ? "#09090B" : "#F4F4F5",
                        color: isSelected ? "#FFFFFF" : "#09090B",
                        border: isSelected ? "1px solid #09090B" : "1px solid #E4E4E7",
                        "&:hover": {
                          bgcolor: isSelected ? "#27272A" : "#E4E4E7",
                        },
                      }}
                    >
                      {cat}
                    </Button>
                  );
                })}
              </Stack>
            </Paper>

            {/* MONOCHROME LEAVE CARDS GROUPED BY MONTH (Matching Attached Design) */}
            {loading ? (
              <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress size={36} sx={{ color: "#09090B" }} />
              </Box>
            ) : Object.keys(groupedRequests).length === 0 ? (
              <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: "16px", border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}>
                <Calendar size={44} color="#A1A1AA" style={{ marginBottom: 12 }} />
                <Typography variant="h6" fontWeight={700} color="#09090B">
                  No leave applications found.
                </Typography>
                <Typography variant="body2" color="#71717A" mt={0.5}>
                  Click 'Apply for Leave' to submit your first application.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {Object.entries(groupedRequests).map(([monthLabel, requests]) => (
                  <Box key={monthLabel}>
                    {/* Month Group Header */}
                    <Typography variant="subtitle2" fontWeight={800} color="#71717A" mb={1.5} sx={{ pl: 0.5 }}>
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
                            border: "1px solid #E4E4E7",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.02)",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              borderColor: "#09090B",
                              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.06)",
                            },
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box flexGrow={1}>
                              {/* Application Type Subtitle (e.g., Half Day Application / Full Day Application / 3 Days Application) */}
                              <Typography variant="caption" fontWeight={700} color="#71717A">
                                {req.is_half_day
                                  ? "Half Day Application"
                                  : req.total_days === 1
                                  ? "Full Day Application"
                                  : `${req.total_days} Days Application`}
                              </Typography>

                              {/* Dates Title */}
                              <Typography variant="h6" fontWeight={900} color="#09090B" mt={0.25} mb={0.5}>
                                {formatCardDate(req.start_date, req.end_date, req.total_days, req.is_half_day)}
                              </Typography>

                              {/* Category & Session Pill */}
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  label={req.leave_type_name}
                                  size="small"
                                  sx={{
                                    bgcolor: "#F4F4F5",
                                    color: "#09090B",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    height: 22,
                                    border: "1px solid #E4E4E7",
                                  }}
                                />
                                {req.is_half_day && (
                                  <Typography variant="caption" color="#71717A" fontWeight={600}>
                                    • {req.half_day_session} Session
                                  </Typography>
                                )}
                              </Stack>
                            </Box>

                            {/* Status Chip & Actions */}
                            <Stack direction="row" spacing={2} alignItems="center">
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
                                    color: "#09090B",
                                    borderColor: "#E4E4E7",
                                    "&:hover": { borderColor: "#09090B", bgcolor: "#F4F4F5" },
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
                                  bgcolor: "#F4F4F5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <ChevronRight size={18} color="#09090B" />
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
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E4E4E7",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Box>
                <Typography variant="h6" fontWeight={900} color="#09090B">
                  Team Leave Approvals
                </Typography>
                <Typography variant="body2" color="#71717A">
                  Pending requests requiring your authorization.
                </Typography>
              </Box>

              <Chip
                label={`${pendingApprovals.length} Pending`}
                sx={{ bgcolor: "#09090B", color: "#FFFFFF", fontWeight: 800 }}
              />
            </Box>

            {pendingApprovals.length === 0 ? (
              <Box textAlign="center" py={6}>
                <CheckCircle2 size={40} color="#09090B" style={{ marginBottom: 12 }} />
                <Typography variant="h6" fontWeight={700} color="#09090B">
                  No pending approvals.
                </Typography>
                <Typography variant="body2" color="#71717A" mt={0.5}>
                  All team leave requests have been reviewed!
                </Typography>
              </Box>
            ) : (
              <Table sx={{ border: "1px solid #E4E4E7", borderRadius: "12px" }}>
                <TableHead sx={{ bgcolor: "#F4F4F5" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApprovals.map((req) => (
                    <TableRow key={req._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {req.employee_name}
                        </Typography>
                        <Typography variant="caption" color="#71717A">
                          {req.employee_code} • {req.department}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {req.leave_type_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {req.start_date} to {req.end_date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={800}>
                          {req.total_days} Day(s)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="#71717A"
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
                            bgcolor: "#09090B",
                            color: "#FFFFFF",
                            "&:hover": { bgcolor: "#27272A" },
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
              borderRadius: "20px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E4E4E7",
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
                <Typography variant="h6" fontWeight={900} color="#09090B">
                  Organization Leave Register
                </Typography>
                <Typography variant="body2" color="#71717A">
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

            <Table sx={{ border: "1px solid #E4E4E7", borderRadius: "12px" }}>
              <TableHead sx={{ bgcolor: "#F4F4F5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Approved By</TableCell>
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
                        <Typography variant="subtitle2" fontWeight={800}>
                          {row.employee_name}
                        </Typography>
                        <Typography variant="caption" color="#71717A">
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
                        <Typography variant="caption" color="#71717A">
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
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E4E4E7",
              }}
            >
              <Typography variant="h6" fontWeight={900} color="#09090B" mb={1}>
                Leave Policy Definitions
              </Typography>
              <Typography variant="body2" color="#71717A" mb={3}>
                Configured leave categories, annual quotas, and rollover policies.
              </Typography>

              <Grid container spacing={3}>
                {leaveTypes
                  .filter((t) => {
                    const name = t.name?.toLowerCase() || "";
                    return !name.includes("unpaid") && !name.includes("earned");
                  })
                  .map((t) => (
                  <Grid item xs={12} sm={6} md={4} key={t._id}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: "16px",
                        bgcolor: "#F4F4F5",
                        border: "1px solid #E4E4E7",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="#09090B"
                      >
                        {t.name} ({t.code})
                      </Typography>
                      <Typography variant="body2" color="#71717A" mb={2}>
                        {t.description}
                      </Typography>

                      <Stack spacing={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="#71717A">
                            Annual Quota:
                          </Typography>
                          <Typography variant="caption" fontWeight={800}>
                            {t.default_allocated_days} Days / Year
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="#71717A">
                            Max Consecutive:
                          </Typography>
                          <Typography variant="caption" fontWeight={800}>
                            {t.maximum_consecutive_days || "Unlimited"} Days
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="#71717A">
                            Requires Attachment:
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            color="#09090B"
                          >
                            {t.requires_attachment ? "Yes" : "No"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Stack>
        )}

        {/* FOOTER */}
        <Box component="footer" sx={{ py: 2.5, mt: "auto", textAlign: "center", borderTop: "1px solid #E4E4E7", bgcolor: "#FFFFFF", borderRadius: "12px" }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 IntraSphere – Smart Office Management System
          </Typography>
        </Box>
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
        <Alert severity={toast.severity} sx={{ borderRadius: "14px", bgcolor: "#09090B", color: "#FFFFFF", "& .MuiAlert-icon": { color: "#FFFFFF" } }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
