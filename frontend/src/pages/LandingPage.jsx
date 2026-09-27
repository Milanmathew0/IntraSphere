import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Building,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Zap,
  X,
  Compass,
  KeyRound,
  UserPlus,
  MonitorCheck,
  Calendar,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [welcomeOpen, setWelcomeOpen] = useState(true);

  const handleCloseWelcome = () => {
    setWelcomeOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* 0. INTERACTIVE WELCOME SCREEN MODAL */}
      <Dialog
        open={welcomeOpen}
        onClose={handleCloseWelcome}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "28px",
            p: 1,
            boxShadow: "0 30px 60px -12px rgba(15, 23, 42, 0.25)",
            border: "1px solid #E2E8F0",
            bgcolor: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(20px)",
          },
        }}
      >
        <DialogContent sx={{ p: { xs: 3, sm: 4.5 }, position: "relative" }}>
          {/* Close Icon Button */}
          <IconButton
            onClick={handleCloseWelcome}
            sx={{
              position: "absolute",
              top: 18,
              right: 18,
              color: "#94A3B8",
              bgcolor: "#F8FAFC",
              "&:hover": { color: "#0F172A", bgcolor: "#F1F5F9" },
            }}
          >
            <X size={18} />
          </IconButton>

          {/* Welcome Header Badge */}
          <Box sx={{ textAlign: "center", mb: 3.5 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "20px",
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                boxShadow: "0 10px 25px rgba(249, 115, 22, 0.35)",
              }}
            >
              <Sparkles size={34} color="#FFFFFF" />
            </Box>
            <Typography
              variant="h4"
              fontWeight={800}
              color="#0F172A"
              letterSpacing={-0.6}
              sx={{ mb: 1, fontSize: { xs: "1.5rem", sm: "1.85rem" } }}
            >
              Welcome to IntraSphere
            </Typography>
            <Typography variant="body2" color="#64748B" fontWeight={500} sx={{ maxWidth: 420, mx: "auto", lineHeight: 1.5 }}>
              Your Enterprise Smart Office Portal for workspace booking, meeting rooms, attendance tracking & HR control.
            </Typography>
          </Box>

          {/* Quick Access Options */}
          <Stack spacing={2} sx={{ mb: 3.5 }}>
            <Paper
              elevation={0}
              onClick={() => navigate("/login")}
              sx={{
                p: 2.5,
                borderRadius: "18px",
                border: "1px solid #FFEDD5",
                bgcolor: "#FFFBF7",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  borderColor: "#F97316",
                  boxShadow: "0 8px 22px rgba(249, 115, 22, 0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    bgcolor: "#F97316",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                  }}
                >
                  <KeyRound size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                    Sign In to Portal
                  </Typography>
                  <Typography variant="caption" color="#64748B" fontWeight={500}>
                    Access Employee, Manager, HR & Admin portals
                  </Typography>
                </Box>
              </Box>
              <ArrowRight size={20} color="#F97316" />
            </Paper>

            <Paper
              elevation={0}
              onClick={() => navigate("/register")}
              sx={{
                p: 2.5,
                borderRadius: "18px",
                border: "1px solid #E2E8F0",
                bgcolor: "#FFFFFF",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                  borderColor: "#F97316",
                  boxShadow: "0 8px 22px rgba(249, 115, 22, 0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "14px",
                    bgcolor: "#F1F5F9",
                    color: "#0F172A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserPlus size={22} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                    Create New Account
                  </Typography>
                  <Typography variant="caption" color="#64748B" fontWeight={500}>
                    Register your corporate user profile
                  </Typography>
                </Box>
              </Box>
              <ArrowRight size={20} color="#64748B" />
            </Paper>
          </Stack>

          {/* Dismiss Action Button */}
          <Button
            variant="contained"
            fullWidth
            onClick={handleCloseWelcome}
            startIcon={<Compass size={18} />}
            sx={{
              py: 1.5,
              borderRadius: "14px",
              bgcolor: "#0F172A",
              color: "#FFFFFF",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
              "&:hover": { bgcolor: "#1E293B" },
            }}
          >
            Explore Platform Features
          </Button>
        </DialogContent>
      </Dialog>

      {/* 1. TOP NAVBAR */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          color: "#0F172A",
          py: 2,
          px: { xs: 2, sm: 4, md: 6 },
          borderBottom: "1px solid #E2E8F0",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Brand Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }} onClick={() => navigate("/")}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  bgcolor: "#F97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                }}
              >
                <Sparkles size={22} color="#FFFFFF" />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} letterSpacing={-0.5} color="#0F172A" sx={{ lineHeight: 1.1 }}>
                  IntraSphere
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                  Smart Office System
                </Typography>
              </Box>
            </Box>

            {/* Navigation Links */}
            <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
              {["Workspaces", "Meeting Rooms", "Attendance", "Administration"].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: "#475569",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.2s",
                    "&:hover": { color: "#F97316" },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>

            {/* Header CTA Buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                onClick={() => setWelcomeOpen(true)}
                sx={{
                  borderColor: "#E2E8F0",
                  color: "#334155",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 2.2,
                  "&:hover": { bgcolor: "#F8FAFC", borderColor: "#CBD5E1" },
                }}
              >
                Welcome Screen
              </Button>

              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#F97316",
                  color: "#F97316",
                  fontWeight: 700,
                  textTransform: "none",
                  borderRadius: "10px",
                  px: 2.5,
                  "&:hover": { bgcolor: "#FFF7ED" },
                }}
              >
                Sign In
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  borderRadius: "10px",
                  px: 3,
                  py: 1,
                  bgcolor: "#F97316",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                  "&:hover": { bgcolor: "#EA580C" },
                }}
              >
                Get Started Free
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. HERO SECTION */}
      <Box
        sx={{
          bgcolor: "#F8FAFC",
          pt: { xs: 8, md: 10 },
          pb: { xs: 12, md: 14 },
          px: { xs: 2, sm: 4 },
          position: "relative",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>
          {/* Announcement Badge */}
          <Chip
            icon={<Sparkles size={16} color="#F97316" />}
            label="IntraSphere • AI-Powered Smart Office & Operations System"
            sx={{
              bgcolor: "#FFF7ED",
              color: "#C2410C",
              fontWeight: 700,
              fontSize: "0.85rem",
              py: 2.2,
              px: 1.5,
              borderRadius: "50px",
              border: "1px solid #FFEDD5",
              mb: 3.5,
              boxShadow: "0 2px 10px rgba(249, 115, 22, 0.08)",
            }}
          />

          {/* Main Title */}
          <Typography
            variant="h2"
            fontWeight={900}
            letterSpacing={-1.5}
            color="#0F172A"
            sx={{
              fontSize: { xs: "2.2rem", sm: "3.2rem", md: "4rem" },
              lineHeight: 1.15,
              mb: 3,
            }}
          >
            Empower Your Workforce with Next-Gen Operations
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h6"
            sx={{
              color: "#64748B",
              fontWeight: 500,
              maxWidth: 780,
              mx: "auto",
              mb: 5,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            Streamline desk bookings, meeting rooms, attendance tracking, and facility management inside one clean, unified enterprise portal.
          </Typography>

          {/* Hero Action Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mb={6}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              endIcon={<ArrowRight size={20} />}
              sx={{
                borderRadius: "14px",
                px: 4,
                py: 1.8,
                bgcolor: "#F97316",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                boxShadow: "0 6px 20px rgba(249, 115, 22, 0.35)",
                "&:hover": { bgcolor: "#EA580C" },
              }}
            >
              Get Started Free
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              startIcon={<Lock size={18} />}
              sx={{
                borderRadius: "14px",
                px: 4,
                py: 1.8,
                color: "#0F172A",
                borderColor: "#CBD5E1",
                bgcolor: "#FFFFFF",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                "&:hover": { bgcolor: "#F1F5F9", borderColor: "#94A3B8" },
              }}
            >
              Sign In to Portal
            </Button>
          </Stack>

          {/* Trust Badges */}
          <Stack direction="row" spacing={3.5} justifyContent="center" flexWrap="wrap">
            {["Role-Based Access Control", "Live Desk & Room Sync", "Google OAuth 2.0 Security"].map((badge) => (
              <Box key={badge} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle2 size={16} color="#F97316" />
                <Typography variant="caption" fontWeight={600} color="#475569">
                  {badge}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* 3. HERO FLOATING STATS CARDS */}
      <Container maxWidth="xl" sx={{ mt: -6, mb: 10, position: "relative", zIndex: 10 }}>
        <Grid container spacing={3}>
          {/* Card 1: Active Workforce */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid #E2E8F0",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 36px rgba(249, 115, 22, 0.1)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "#FFF7ED",
                    color: "#F97316",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={22} />
                </Box>
                <Chip label="Live Workforce" size="small" sx={{ bgcolor: "#FFF7ED", color: "#C2410C", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                148+
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Active System Users
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2: Workspace Desks */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid #E2E8F0",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 36px rgba(46, 125, 50, 0.1)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MonitorCheck size={22} />
                </Box>
                <Chip label="Real-time" size="small" sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                160
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Smart Desks & Pods
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: Meeting Rooms */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid #E2E8F0",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 36px rgba(123, 31, 162, 0.1)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "#F3E5F5",
                    color: "#7B1FA2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building size={22} />
                </Box>
                <Chip label="Conference" size="small" sx={{ bgcolor: "#F3E5F5", color: "#7B1FA2", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                12
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Active Meeting Rooms
              </Typography>
            </Paper>
          </Grid>

          {/* Card 4: Security */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                border: "1px solid #E2E8F0",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 36px rgba(237, 108, 2, 0.1)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    bgcolor: "#FFF3E0",
                    color: "#ED6C02",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={22} />
                </Box>
                <Chip label="OAuth 2.0" size="small" sx={{ bgcolor: "#FFF3E0", color: "#ED6C02", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                256-Bit
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                JWT Bearer Protection
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 4. PLATFORM FEATURES SECTION */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="caption" fontWeight={800} color="#F97316" letterSpacing={1.2} display="block" mb={1}>
            PLATFORM CAPABILITIES
          </Typography>
          <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing={-0.5} mb={2}>
            Built for Modern Smart Workplaces
          </Typography>
          <Typography variant="body1" color="#64748B" sx={{ maxWidth: 600, mx: "auto" }}>
            Everything you need to reserve desks, manage meeting rooms, track attendance, and oversee office operations.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              title: "Smart Workspace & Desk Reservation",
              desc: "Instant desk selection with floor plans, quiet zone filters, standing desk options, and live occupancy status.",
              icon: <Building size={26} color="#F97316" />,
              bg: "#FFF7ED",
            },
            {
              title: "Emergency & Scheduled Meeting Rooms",
              desc: "Book conference rooms on-the-fly, view AV amenities, track reservation conflicts, and manage attendance.",
              icon: <Users size={26} color="#2E7D32" />,
              bg: "#E8F5E9",
            },
            {
              title: "Automated Attendance & Punch Clock",
              desc: "Live daily check-in/check-out logs, monthly attendance progress charts, and late/arrival tracking.",
              icon: <UserCheck size={26} color="#7B1FA2" />,
              bg: "#F3E5F5",
            },
            {
              title: "Leave Application & Approval Portal",
              desc: "Submit leave applications, track approval status in real-time, and manage team absence schedules.",
              icon: <ShieldCheck size={26} color="#C2410C" />,
              bg: "#FFF7ED",
            },
            {
              title: "Google OAuth 2.0 Integration",
              desc: "Instant single sign-on with corporate Google accounts, auto profile creation, and bearer token security.",
              icon: <Zap size={26} color="#ED6C02" />,
              bg: "#FFF3E0",
            },
            {
              title: "Administrator Control Center",
              desc: "Full organization metrics, user role permissions, facility health tracking, and system audit log reporting.",
              icon: <BarChart3 size={26} color="#00796B" />,
              bg: "#E0F2F1",
            },
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "18px",
                  p: 1,
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
                    borderColor: "#CBD5E1",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      bgcolor: feature.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2.5,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" mb={1}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="#64748B" sx={{ lineHeight: 1.6 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 5. CALL TO ACTION BANNER */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: "24px",
            bgcolor: "#0F172A",
            color: "#FFFFFF",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
          }}
        >
          <Typography variant="h3" fontWeight={800} letterSpacing={-0.5} mb={2}>
            Ready to Transform Your Workplace?
          </Typography>
          <Typography variant="h6" sx={{ color: "#94A3B8", fontWeight: 400, maxWidth: 650, mx: "auto", mb: 4 }}>
            Experience the next-generation IntraSphere HR & Operations Control Portal today.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                borderRadius: "12px",
                px: 4,
                py: 1.6,
                bgcolor: "#F97316",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)",
                "&:hover": { bgcolor: "#EA580C" },
              }}
            >
              Create Account
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: "12px",
                px: 4,
                py: 1.6,
                color: "#FFFFFF",
                borderColor: "#475569",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.08)", borderColor: "#94A3B8" },
              }}
            >
              Sign In to Portal
            </Button>
          </Stack>
        </Paper>
      </Container>

      {/* 6. FOOTER */}
      <Box
        component="footer"
        sx={{
          py: 4,
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Sparkles size={20} color="#F97316" />
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                IntraSphere
              </Typography>
            </Box>
            <Typography variant="caption" color="#64748B" fontWeight={500}>
              © 2026 IntraSphere Smart Office & Operations System. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
