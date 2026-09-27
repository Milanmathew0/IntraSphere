import React from "react";
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
  Avatar,
  Paper,
  IconButton,
} from "@mui/material";
import {
  ShieldCheck,
  Users,
  UserCheck,
  Building,
  Calendar,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Globe,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F4F6F0",
        fontFamily: "'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* 1. TOP NAVBAR */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #022C22 0%, #064E3B 60%, #047857 100%)",
          color: "#FFFFFF",
          py: 2,
          px: { xs: 2, sm: 4, md: 6 },
          boxShadow: "0 4px 20px rgba(2, 44, 34, 0.2)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          backdropFilter: "blur(10px)",
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
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                }}
              >
                <ShieldCheck size={24} color="#FFFFFF" />
              </Box>
              <Typography variant="h5" fontWeight={900} letterSpacing={-0.5} color="#FFFFFF">
                IntraSphere
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
              {["Features", "Solutions", "Directory", "Enterprise"].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "color 0.2s",
                    "&:hover": { color: "#FFFFFF" },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>

            {/* Header CTA Buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="text"
                onClick={() => navigate("/login")}
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.9rem",
                  px: 2.5,
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.12)" },
                }}
              >
                Sign In
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  bgcolor: "#FFFFFF",
                  color: "#064E3B",
                  textTransform: "none",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                  "&:hover": { bgcolor: "#F8FAFC", transform: "translateY(-1px)" },
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
          background: "linear-gradient(135deg, #022C22 0%, #064E3B 55%, #047857 100%)",
          color: "#FFFFFF",
          pt: { xs: 8, md: 10 },
          pb: { xs: 14, md: 16 },
          px: { xs: 2, sm: 4 },
          position: "relative",
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          {/* Announcement Pill */}
          <Chip
            icon={<Sparkles size={16} color="#10B981" />}
            label="IntraSphere • AI-Powered Smart Office & HR Intelligence"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.12)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "0.85rem",
              py: 2.2,
              px: 1.5,
              borderRadius: "50px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              mb: 3,
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Main Title */}
          <Typography
            variant="h2"
            fontWeight={900}
            letterSpacing={-1.5}
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
              color: "rgba(255, 255, 255, 0.85)",
              fontWeight: 500,
              maxWidth: 780,
              mx: "auto",
              mb: 5,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.2rem" },
            }}
          >
            Unified employee directory, centralized HR provisioning, live presence tracking, and enterprise security—all inside one intelligent portal.
          </Typography>

          {/* Hero Action Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mb={6}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              endIcon={<ArrowRight size={20} />}
              sx={{
                borderRadius: "50px",
                px: 4,
                py: 1.8,
                bgcolor: "#FFFFFF",
                color: "#064E3B",
                textTransform: "none",
                fontWeight: 800,
                fontSize: "1rem",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                "&:hover": { bgcolor: "#F8FAFC", transform: "translateY(-2px)" },
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
                borderRadius: "50px",
                px: 4,
                py: 1.8,
                color: "#FFFFFF",
                borderColor: "rgba(255, 255, 255, 0.3)",
                bgcolor: "rgba(255, 255, 255, 0.08)",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "1rem",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.18)", borderColor: "#FFFFFF" },
              }}
            >
              Sign In to Portal
            </Button>
          </Stack>

          {/* Trust Badges */}
          <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap" sx={{ opacity: 0.9 }}>
            {["Role-Based Security", "Live MongoDB Sync", "Google OAuth 2.0"].map((badge) => (
              <Box key={badge} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CheckCircle2 size={16} color="#10B981" />
                <Typography variant="caption" fontWeight={600} color="#FFFFFF">
                  {badge}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* 3. HERO FLOATING PREVIEW CARDS */}
      <Container maxWidth="xl" sx={{ mt: -8, mb: 10, position: "relative", zIndex: 10 }}>
        <Grid container spacing={3}>
          {/* Card 1: Active Workforce */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "transform 0.25s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    bgcolor: "#E6F4EA",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={22} />
                </Box>
                <Chip label="Live Sync" size="small" sx={{ bgcolor: "#064E3B", color: "#FFFFFF", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                142+
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Total Active Workforce
              </Typography>
            </Paper>
          </Grid>

          {/* Card 2: Onboarding Portal */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "transform 0.25s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    bgcolor: "#FEF3C7",
                    color: "#D97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserCheck size={22} />
                </Box>
                <Chip label="Secure" size="small" sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                100%
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Centralized HR Provisioning
              </Typography>
            </Paper>
          </Grid>

          {/* Card 3: Daily Presence */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "transform 0.25s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    bgcolor: "#F3E8FF",
                    color: "#7E22CE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building size={22} />
                </Box>
                <Chip label="Geofenced" size="small" sx={{ bgcolor: "#F3E8FF", color: "#7E22CE", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                93%
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Daily On-Site Presence
              </Typography>
            </Paper>
          </Grid>

          {/* Card 4: Enterprise Security */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.8)",
                transition: "transform 0.25s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "14px",
                    bgcolor: "#E8F0FE",
                    color: "#047857",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Lock size={22} />
                </Box>
                <Chip label="OAuth 2.0" size="small" sx={{ bgcolor: "#E8F0FE", color: "#047857", fontWeight: 700 }} />
              </Box>
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                256-Bit
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                Encrypted JWT Protection
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* 4. PLATFORM FEATURES SECTION */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="caption" fontWeight={800} color="#059669" letterSpacing={1.2} display="block" mb={1}>
            PLATFORM CAPABILITIES
          </Typography>
          <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing={-0.5} mb={2}>
            Built for Modern HR & Operations Teams
          </Typography>
          <Typography variant="body1" color="#64748B" sx={{ maxWidth: 600, mx: "auto" }}>
            Everything you need to manage your staff, provision employee access securely, and track attendance seamlessly.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            {
              title: "Live Database Employee Directory",
              desc: "Instant search and filter across all employee records in MongoDB with department chips and designation tags.",
              icon: <Users size={26} color="#059669" />,
              bg: "#E6F4EA",
            },
            {
              title: "Centralized HR Provisioning",
              desc: "Secure administrative workflow for HR to provision employee accounts, verify profiles, and assign dedicated access roles.",
              icon: <UserCheck size={26} color="#D97706" />,
              bg: "#FEF3C7",
            },
            {
              title: "Smart Attendance & Presence",
              desc: "Track daily headcount, active floor statuses, and leave request management with visual progress breakdown.",
              icon: <Building size={26} color="#7E22CE" />,
              bg: "#F3E8FF",
            },
            {
              title: "Role-Based Access Control",
              desc: "Dedicated user experience dashboards for Admins, Managers, Employees, and new Onboarding Users.",
              icon: <ShieldCheck size={26} color="#047857" />,
              bg: "#E8F0FE",
            },
            {
              title: "Google OAuth 2.0 Integration",
              desc: "Instant single sign-on with Google credentials, matching profile creation, and secure JWT bearer authentication.",
              icon: <Zap size={26} color="#DC2626" />,
              bg: "#FEE2E2",
            },
            {
              title: "Executive Analytics & Dashboard",
              desc: "Beautiful dark emerald theme, floating stat cards, and live metrics for complete workforce visibility.",
              icon: <BarChart3 size={26} color="#047857" />,
              bg: "#E0F2FE",
            },
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  borderRadius: "20px",
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
                      borderRadius: "16px",
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
            borderRadius: "32px",
            background: "linear-gradient(135deg, #022C22 0%, #064E3B 60%, #047857 100%)",
            color: "#FFFFFF",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(2, 44, 34, 0.3)",
          }}
        >
          <Typography variant="h3" fontWeight={900} letterSpacing={-0.5} mb={2}>
            Ready to Transform Your Workplace?
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.85)", fontWeight: 400, maxWidth: 650, mx: "auto", mb: 4 }}>
            Experience the next-generation IntraSphere HR & Operations Control Portal today.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/register")}
              sx={{
                borderRadius: "50px",
                px: 4,
                py: 1.6,
                bgcolor: "#FFFFFF",
                color: "#064E3B",
                fontWeight: 800,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#F8FAFC" },
              }}
            >
              Create Account
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/login")}
              sx={{
                borderRadius: "50px",
                px: 4,
                py: 1.6,
                color: "#FFFFFF",
                borderColor: "rgba(255, 255, 255, 0.3)",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
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
              <ShieldCheck size={20} color="#059669" />
              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                IntraSphere
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              © 2026 IntraSphere Smart Office & Operations System. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "#059669" } }}>
                Privacy Policy
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ cursor: "pointer", "&:hover": { color: "#059669" } }}>
                Terms of Service
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
