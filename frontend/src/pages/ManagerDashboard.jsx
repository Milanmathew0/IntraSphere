import React, { useState, useEffect } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
  Grid,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  Users,
  UserCheck,
  Calendar,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Building,
  Activity,
  ArrowUpRight,
  Plus,
  Bell,
  Download,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { BrandLogo } from "../components/BrandLogo";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";
import EmployeeProfileSection from "../components/dashboard/EmployeeProfileSection";
import OnboardingRequestsWidget from "../components/dashboard/OnboardingRequestsWidget";
import TeamPresenceWidget from "../components/dashboard/TeamPresenceWidget";
import TeamLeaveApprovalsWidget from "../components/dashboard/TeamLeaveApprovalsWidget";
import EmployeeDirectoryWidget from "../components/dashboard/EmployeeDirectoryWidget";
import api from "../api/axios";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const email = user?.email || localStorage.getItem("email") || "Manager";
  const username = user?.username || email.split("@")[0];

  const [activeTab, setActiveTab] = useState(0);

  // Live Database Metrics State
  const [metrics, setMetrics] = useState({
    totalWorkforce: 0,
    pendingOnboardings: 0,
    presentPercentage: 93,
    pendingLeaves: 2,
    loading: true,
  });

  const fetchDashboardMetrics = async () => {
    try {
      // 1. Fetch real active workforce count from database
      const empRes = await api.get("/api/v1/employees");
      const empList = empRes.data.employees || empRes.data || [];

      // 2. Fetch real pending onboarding count from database
      const onbRes = await api.get("/api/v1/onboarding/requests?status=pending");
      const onbList = onbRes.data.requests || onbRes.data || [];

      setMetrics({
        totalWorkforce: empList.length,
        pendingOnboardings: onbList.length,
        presentPercentage: 93,
        pendingLeaves: 2,
        loading: false,
      });
    } catch (err) {
      console.error("Error fetching live metrics:", err);
      setMetrics((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  // Toast Notification State
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, severity = "success") => {
    setToast({ open: true, message: msg, severity });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F4F6F0", // Warm executive cream/slate background matching screenshot
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      {/* DEEP EMERALD GREEN HEADER SECTION (Matching TalentaSync Screenshot) */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #022C22 0%, #064E3B 55%, #047857 100%)",
          color: "#FFFFFF",
          pt: 1.5,
          pb: 8,
          px: { xs: 2, sm: 4, md: 6 },
          boxShadow: "0 10px 30px rgba(2, 44, 34, 0.25)",
        }}
      >
        {/* Top Navbar Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          {/* Left Brand & Top Navigation Pill Bar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                }}
              >
                <ShieldCheck size={22} color="#FFFFFF" />
              </Box>
              <Typography variant="h6" fontWeight={900} letterSpacing={-0.5} color="#FFFFFF">
                IntraSphere
              </Typography>
            </Box>

            {/* Top Navigation Bar Pills */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
                p: 0.6,
                borderRadius: "50px",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: { xs: "none", md: "flex" },
                gap: 0.5,
              }}
            >
              {[
                { id: 0, label: "Dashboard", icon: <LayoutDashboard size={16} /> },
                { id: 5, label: "Employees", icon: <Users size={16} /> },
                { id: 1, label: "Onboardings", icon: <UserCheck size={16} /> },
                { id: 3, label: "Presence", icon: <Building size={16} /> },
                { id: 2, label: "Leaves", icon: <Calendar size={16} /> },
                { id: 4, label: "Settings", icon: <Settings size={16} /> },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    startIcon={tab.icon}
                    sx={{
                      borderRadius: "50px",
                      px: 2.2,
                      py: 0.8,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      bgcolor: isActive ? "#FFFFFF" : "transparent",
                      color: isActive ? "#064E3B" : "#FFFFFF",
                      boxShadow: isActive ? "0 4px 14px rgba(0, 0, 0, 0.15)" : "none",
                      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                      "&:hover": {
                        bgcolor: isActive ? "#FFFFFF" : "rgba(255, 255, 255, 0.18)",
                        color: isActive ? "#064E3B" : "#FFFFFF",
                      },
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Paper>
          </Box>

          {/* Right Profile & Notification Controls */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              sx={{
                color: "#FFFFFF",
                bgcolor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              <Bell size={18} />
            </IconButton>

            <UserProfileHeader user={{ ...user, role: "Manager" }} onLogout={handleLogout} />
          </Stack>
        </Box>

        {/* Hero Greeting Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.75)", fontWeight: 500 }}>
              Good Morning,
            </Typography>
            <Typography variant="h3" fontWeight={800} letterSpacing={-0.8} sx={{ color: "#FFFFFF", mt: 0.2 }}>
              {username}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              endIcon={<ChevronDown size={16} />}
              startIcon={<Calendar size={16} />}
              sx={{
                borderRadius: "50px",
                px: 2.2,
                py: 1,
                color: "#FFFFFF",
                borderColor: "rgba(255, 255, 255, 0.25)",
                bgcolor: "rgba(255, 255, 255, 0.08)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)", borderColor: "#FFFFFF" },
              }}
            >
              2026
            </Button>

            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              sx={{
                borderRadius: "50px",
                px: 2.5,
                py: 1,
                bgcolor: "#FFFFFF",
                color: "#064E3B",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "0.85rem",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                "&:hover": { bgcolor: "#F8FAFC", transform: "translateY(-1px)" },
              }}
            >
              Export Report
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* FLOATING HERO STAT CARDS ROW (Overlapping Deep Emerald Banner into Cream Body) */}
      <Container maxWidth="xl" sx={{ mt: -5, mb: 4, position: "relative", zIndex: 5 }}>
        <Grid container spacing={2.5}>
          {/* Card 1: Total Employees */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(15, 23, 42, 0.09)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "14px",
                    bgcolor: "#E6F4EA",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={20} />
                </Box>
                <IconButton size="small" sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <ArrowUpRight size={16} color="#64748B" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  {metrics.loading ? <CircularProgress size={24} sx={{ color: "#059669" }} /> : metrics.totalWorkforce}
                </Typography>
                <Chip
                  label="+3.72%"
                  size="small"
                  sx={{ bgcolor: "#064E3B", color: "#FFFFFF", fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                />
              </Box>
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                Total Active Employees
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2: Onboarding Requests */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(15, 23, 42, 0.09)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "14px",
                    bgcolor: "#FEF3C7",
                    color: "#D97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCheck size={20} />
                </Box>
                <IconButton size="small" sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <ArrowUpRight size={16} color="#64748B" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  {metrics.loading ? <CircularProgress size={24} sx={{ color: "#D97706" }} /> : metrics.pendingOnboardings}
                </Typography>
                <Chip
                  label="Action Req."
                  size="small"
                  sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                />
              </Box>
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                Pending Onboardings
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: Daily Presence */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(15, 23, 42, 0.09)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "14px",
                    bgcolor: "#F3E8FF",
                    color: "#7E22CE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building size={20} />
                </Box>
                <IconButton size="small" sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <ArrowUpRight size={16} color="#64748B" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  93%
                </Typography>
                <Chip
                  label="Live"
                  size="small"
                  sx={{ bgcolor: "#F3E8FF", color: "#7E22CE", fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                />
              </Box>
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                Daily On-Site Presence
              </Typography>
            </Paper>
          </Grid>

          {/* Card 4: Leave Requests */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 34px rgba(15, 23, 42, 0.09)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "14px",
                    bgcolor: "#E8F0FE",
                    color: "#1D4ED8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar size={20} />
                </Box>
                <IconButton size="small" sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <ArrowUpRight size={16} color="#64748B" />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.5 }}>
                <Typography variant="h4" fontWeight={800} color="#0F172A">
                  2
                </Typography>
                <Chip
                  label="Review"
                  size="small"
                  sx={{ bgcolor: "#E8F0FE", color: "#1D4ED8", fontWeight: 700, fontSize: "0.68rem", height: 20 }}
                />
              </Box>
              <Typography variant="caption" color="#64748B" fontWeight={600}>
                Pending Leave Approvals
              </Typography>
            </Paper>
          </Grid>

          {/* Card 5: Add New Widget / Quick Action */}
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                border: "2px dashed #CBD5E1",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.02)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 140,
                cursor: "pointer",
                transition: "all 0.25s ease",
                "&:hover": { borderColor: "#064E3B", bgcolor: "rgba(6, 78, 59, 0.02)" },
              }}
              onClick={() => showToast("Widget Customizer Panel ready.")}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  bgcolor: "#064E3B",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                  boxShadow: "0 4px 12px rgba(6, 78, 59, 0.3)",
                }}
              >
                <Plus size={22} />
              </Box>
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                Add new widget
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* MAIN DASHBOARD CONTENT AREA (Warm Executive Cream Background) */}
      <Container maxWidth="xl" sx={{ pb: 8, flexGrow: 1 }}>
        {/* Tab 0: Dashboard Overview (3 Cards Grid) */}
        {activeTab === 0 && (
          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} lg={4} sx={{ display: "flex", flexDirection: "column" }}>
              <OnboardingRequestsWidget showToast={showToast} />
            </Grid>
            <Grid item xs={12} lg={4} sx={{ display: "flex", flexDirection: "column" }}>
              <TeamPresenceWidget />
            </Grid>
            <Grid item xs={12} lg={4} sx={{ display: "flex", flexDirection: "column" }}>
              <TeamLeaveApprovalsWidget showToast={showToast} />
            </Grid>
          </Grid>
        )}

        {/* Tab 5: Live Database Employees Directory */}
        {activeTab === 5 && (
          <Box>
            <EmployeeDirectoryWidget showToast={showToast} />
          </Box>
        )}

        {/* Tab 1: User Onboarding Requests */}
        {activeTab === 1 && (
          <Box>
            <OnboardingRequestsWidget showToast={showToast} />
          </Box>
        )}

        {/* Tab 2: Team Leave Approvals */}
        {activeTab === 2 && (
          <Box>
            <TeamLeaveApprovalsWidget showToast={showToast} />
          </Box>
        )}

        {/* Tab 3: Team Presence Directory */}
        {activeTab === 3 && (
          <Box>
            <TeamPresenceWidget />
          </Box>
        )}

        {/* Tab 4: Manager Profile & Security */}
        {activeTab === 4 && (
          <Box>
            <EmployeeProfileSection />
          </Box>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2.5,
          mt: "auto",
          textAlign: "center",
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          © 2026 IntraSphere – HR Operations Portal
        </Typography>
      </Box>

      {/* Toast Feedback */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
