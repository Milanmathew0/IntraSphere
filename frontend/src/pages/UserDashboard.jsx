import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Sparkles,
  ShieldCheck,
  LogOut,
  Users,
  Cpu,
  Coffee,
  Clock,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import GlassCard from "../components/dashboard/GlassCard";
import AppLayout from "../components/layout/AppLayout";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "user@intrasphere.io";



  // Department Explorer State
  const [activeDeptTab, setActiveDeptTab] = useState("Engineering");

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



  // Company Departments Info
  const departmentsData = {
    Engineering: {
      title: "Engineering & Product Tech",
      lead: "Alex Rivera (VP Tech)",
      description:
        "Building scalable smart office IoT systems, cloud microservices, and AI-driven workspace optimization algorithms.",
      techStack: ["React", "FastAPI", "MongoDB", "Python AI", "Docker"],
      openRoles: ["Senior Fullstack Engineer", "DevOps Specialist", "UI/UX Designer"],
    },
    HR: {
      title: "Human Resources & Culture",
      lead: "Sarah Jenkins (HR Manager)",
      description:
        "Empowering workforce growth, onboarding new team members, managing employee benefits, and promoting hybrid work wellness.",
      techStack: ["People Operations", "Talent Management", "Workplace Safety"],
      openRoles: ["HR Business Partner", "Talent Acquisition Lead"],
    },
    Operations: {
      title: "Workspace & Facilities Operations",
      lead: "David Chen (Head of Ops)",
      description:
        "Overseeing smart building infrastructure, quiet pod allocations, office sustainability, and emergency response protocols.",
      techStack: ["IoT Floor Controls", "Space Planning", "Asset Tracking"],
      openRoles: ["Facilities Manager", "Office Operations Specialist"],
    },
    Sales: {
      title: "Global Enterprise Sales & Growth",
      lead: "Elena Rostova (Chief Commercial Officer)",
      description:
        "Expanding IntraSphere enterprise solutions to corporate hubs worldwide and fostering strategic partnerships.",
      techStack: ["Salesforce", "Enterprise Solutions", "Key Account Mgmt"],
      openRoles: ["Enterprise Account Executive", "Growth Strategist"],
    },
  };

  const selectedDept = departmentsData[activeDeptTab] || departmentsData["Engineering"];

  return (
    <AppLayout activeTabOverride="dashboard">
      <Box sx={{ width: "100%" }}>

        {/* Hero Greeting Row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.75)", fontWeight: 500 }}>
              Welcome back,
            </Typography>
            <Typography variant="h3" fontWeight={800} letterSpacing={-0.8} sx={{ color: "#FFFFFF", mt: 0.2 }}>
              {username}
            </Typography>
          </Box>
        </Box>

      {/* Main Container */}
      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, pt: 3 }}>
        {/* Glass Navbar Header */}
        <GlassCard
          glowColor="rgba(46, 125, 50, 0.12)"
          borderColor="rgba(226, 232, 240, 0.8)"
          sx={{
            px: { xs: 2.5, md: 4 },
            py: 2,
            mb: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Logo Brand */}
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2E7D32 0%, #15803D 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 15px rgba(46, 125, 50, 0.3)",
              }}
            >
              <Zap size={24} color="#FFFFFF" />
            </Box>
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: "#0F172A",
                  lineHeight: 1.2,
                }}
              >
                INTRASPHERE
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#2E7D32", fontWeight: 700, letterSpacing: 1.2 }}
              >
                COMPANY PORTAL
              </Typography>
            </Box>
          </Box>

          {/* User Profile Header Component */}
          <UserProfileHeader
            user={user}
            onLogout={handleLogout}
          />
        </GlassCard>

        {/* Hero Section: Welcome & Company Introduction */}
        <GlassCard
          glowColor="rgba(46, 125, 50, 0.15)"
          borderColor="rgba(226, 232, 240, 0.9)"
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.9) 100%)",
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid xs={12} md={7}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Chip
                  icon={<Sparkles size={14} color="#15803D" />}
                  label="Official IntraSphere Portal"
                  sx={{
                    bgcolor: "rgba(46, 125, 50, 0.1)",
                    color: "#15803D",
                    border: "1px solid rgba(46, 125, 50, 0.25)",
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Typography
                variant="h2"
                fontWeight={800}
                sx={{
                  fontSize: { xs: "2rem", md: "2.8rem" },
                  lineHeight: 1.2,
                  color: "#0F172A",
                  mb: 2,
                }}
              >
                Welcome to IntraSphere Smart Office
              </Typography>

              <Typography
                variant="body1"
                color="#475569"
                sx={{ fontSize: "1.05rem", lineHeight: 1.7, mb: 4, maxWidth: "650px" }}
              >
                IntraSphere is a next-generation enterprise workspace platform. We empower modern teams with AI-driven workspace reservations, automated attendance logging, quiet focus pod management, and real-time collaboration tools.
              </Typography>


            </Grid>


          </Grid>
        </GlassCard>

        {/* Company Core Pillars (Glass Cards Grid) */}
        <Box mb={6}>
          <Typography variant="h5" fontWeight={800} color="#0F172A" mb={3}>
            Why Work at IntraSphere?
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              },
              gap: 3,
              alignItems: "stretch",
            }}
          >
            {/* Card 1 */}
            <GlassCard
              glowColor="rgba(46, 125, 50, 0.12)"
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: "rgba(46, 125, 50, 0.1)",
                  color: "#15803D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  flexShrink: 0,
                }}
              >
                <Cpu size={24} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1} sx={{ lineHeight: 1.3 }}>
                Smart Workspace
              </Typography>
              <Typography variant="body2" color="#64748B" lineHeight={1.6} sx={{ flexGrow: 1 }}>
                AI-driven desk allocations, IoT soundproof focus pods, and automated environment controls.
              </Typography>
            </GlassCard>

            {/* Card 2 */}
            <GlassCard
              glowColor="rgba(59, 130, 246, 0.12)"
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: "rgba(249, 115, 22, 0.1)",
                  color: "#C2410C",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  flexShrink: 0,
                }}
              >
                <Users size={24} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1} sx={{ lineHeight: 1.3 }}>
                Flexible Hybrid Culture
              </Typography>
              <Typography variant="body2" color="#64748B" lineHeight={1.6} sx={{ flexGrow: 1 }}>
                Freedom to balance remote work with high-tech in-office collaborative war rooms.
              </Typography>
            </GlassCard>

            {/* Card 3 */}
            <GlassCard
              glowColor="rgba(168, 85, 247, 0.12)"
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: "rgba(147, 51, 234, 0.1)",
                  color: "#7E22CE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1} sx={{ lineHeight: 1.3 }}>
                Enterprise Security
              </Typography>
              <Typography variant="body2" color="#64748B" lineHeight={1.6} sx={{ flexGrow: 1 }}>
                Encrypted JWT authentication, role-based resource management, and audit integrity.
              </Typography>
            </GlassCard>

            {/* Card 4 */}
            <GlassCard
              glowColor="rgba(245, 158, 11, 0.12)"
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: "rgba(245, 158, 11, 0.12)",
                  color: "#D97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  flexShrink: 0,
                }}
              >
                <Coffee size={24} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1} sx={{ lineHeight: 1.3 }}>
                Modern Amenities
              </Typography>
              <Typography variant="body2" color="#64748B" lineHeight={1.6} sx={{ flexGrow: 1 }}>
                Ergonomic height-adjustable standing desks, tech lounges, and wellness spaces.
              </Typography>
            </GlassCard>
          </Box>
        </Box>

        {/* Company Department Explorer */}
        <GlassCard glowColor="rgba(59, 130, 246, 0.12)" sx={{ p: { xs: 3, md: 4 }, mt: 5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Explore Company Departments
              </Typography>
              <Typography variant="body2" color="#64748B">
                Discover our core divisions and key teams
              </Typography>
            </Box>

            {/* Department Filter Chips */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {Object.keys(departmentsData).map((deptKey) => (
                <Chip
                  key={deptKey}
                  label={deptKey}
                  onClick={() => setActiveDeptTab(deptKey)}
                  sx={{
                    borderRadius: "12px",
                    fontWeight: 600,
                    px: 1,
                    cursor: "pointer",
                    bgcolor:
                      activeDeptTab === deptKey
                        ? "rgba(46, 125, 50, 0.15)"
                        : "rgba(241, 245, 249, 0.8)",
                    color: activeDeptTab === deptKey ? "#15803D" : "#64748B",
                    border:
                      activeDeptTab === deptKey
                        ? "1px solid rgba(46, 125, 50, 0.3)"
                        : "1px solid rgba(226, 232, 240, 0.8)",
                  }}
                />
              ))}
            </Box>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid xs={12} md={7}>
              <Typography variant="h5" fontWeight={700} color="#15803D" mb={1}>
                {selectedDept.title}
              </Typography>
              <Typography variant="caption" color="#64748B" display="block" mb={2}>
                Lead: {selectedDept.lead}
              </Typography>

              <Typography variant="body1" color="#334155" mb={3} lineHeight={1.7}>
                {selectedDept.description}
              </Typography>

              <Typography variant="subtitle2" color="#0F172A" mb={1} fontWeight={700}>
                Key Focus & Technologies:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                {selectedDept.techStack.map((tech) => (
                  <Chip
                    key={tech}
                    label={tech}
                    size="small"
                    sx={{
                      bgcolor: "rgba(249, 115, 22, 0.1)",
                      color: "#C2410C",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid xs={12} md={5}>
              <Box
                sx={{
                  p: 3,
                  borderRadius: "20px",
                  background: "rgba(241, 245, 249, 0.7)",
                  border: "1px solid rgba(226, 232, 240, 0.9)",
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={2}>
                  Active Openings in {activeDeptTab}
                </Typography>
                <Stack spacing={1.5}>
                  {selectedDept.openRoles.map((role, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      p={1.5}
                      sx={{ borderRadius: "12px", background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                    >
                      <Typography variant="body2" fontWeight={600} color="#0F172A">
                        {role}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </GlassCard>
      </Container>


      {/* Snackbar Toast Feedback */}
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
    </AppLayout>
  );
}
