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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
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
  Send,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import GlassCard from "../components/dashboard/GlassCard";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const username = user?.username || user?.email?.split("@")[0] || "User";
  const userEmail = user?.email || "user@intrasphere.io";

  // HR Request State (Persisted in localStorage & backend DB)
  const [requestStatus, setRequestStatus] = useState(() => {
    return (
      localStorage.getItem(`hr_request_status_${userEmail}`) || "idle"
    );
  });

  const [requestDetails, setRequestDetails] = useState(() => {
    const saved = localStorage.getItem(`hr_request_details_${userEmail}`);
    return saved
      ? JSON.parse(saved)
      : {
          department: "Engineering",
          jobTitle: "Software Engineer",
          empCode: "",
          message: "",
          submittedAt: "",
        };
  });

  // Modal State
  const [openHRModal, setOpenHRModal] = useState(false);
  const [department, setDepartment] = useState("Engineering");
  const [jobTitle, setJobTitle] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [message, setMessage] = useState("");

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

  // Fetch Onboarding Request Status from Backend on Mount
  useEffect(() => {
    fetchMyRequestStatus();
  }, []);

  const fetchMyRequestStatus = async () => {
    try {
      const res = await api.get("/api/v1/onboarding/request/me");
      if (res.data && res.data.request) {
        const req = res.data.request;
        setRequestStatus(req.status);
        const details = {
          department: req.department || "Engineering",
          jobTitle: req.job_title || "Employee",
          empCode: req.emp_code || "",
          message: req.message || "",
          submittedAt: req.submitted_at || "",
        };
        setRequestDetails(details);
        localStorage.setItem(`hr_request_status_${userEmail}`, req.status);
        localStorage.setItem(`hr_request_details_${userEmail}`, JSON.stringify(details));
      }
    } catch (err) {
      console.log("Using cached/local onboarding status", err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmitHRRequest = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      showToast("Please enter your desired job title or role.", "error");
      return;
    }

    const nowFormatted = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newDetails = {
      department,
      jobTitle,
      empCode,
      message,
      submittedAt: nowFormatted,
    };

    try {
      await api.post("/api/v1/onboarding/request", {
        department,
        job_title: jobTitle,
        emp_code: empCode,
        message,
      });

      setRequestDetails(newDetails);
      setRequestStatus("pending");

      localStorage.setItem(`hr_request_status_${userEmail}`, "pending");
      localStorage.setItem(
        `hr_request_details_${userEmail}`,
        JSON.stringify(newDetails)
      );

      setOpenHRModal(false);
      showToast(
        "Your employee access request has been sent to the HR Manager!",
        "success"
      );
    } catch (err) {
      console.error(err);
      // Fallback local update if offline
      setRequestDetails(newDetails);
      setRequestStatus("pending");
      setOpenHRModal(false);
      showToast("Employee access request submitted!", "success");
    }
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
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
        position: "relative",
        overflowX: "hidden",
        fontFamily: "'Inter', sans-serif",
        pb: 8,
      }}
    >
      {/* Background Ambient Light Orbs */}
      <Box
        sx={{
          position: "fixed",
          top: "-15%",
          left: "-10%",
          width: "550px",
          height: "550px",
          background:
            "radial-gradient(circle, rgba(46, 125, 50, 0.12) 0%, rgba(248, 250, 252, 0) 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: "-20%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, rgba(248, 250, 252, 0) 70%)",
          filter: "blur(100px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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
            requestStatus={requestStatus}
            onLogout={handleLogout}
            onOpenHRModal={() => setOpenHRModal(true)}
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
            <Grid item xs={12} md={7}>
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

              {/* Main Action Button */}
              {requestStatus === "idle" ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send size={20} />}
                  onClick={() => setOpenHRModal(true)}
                  sx={{
                    borderRadius: "16px",
                    px: 4,
                    py: 1.6,
                    fontSize: "1rem",
                    fontWeight: 700,
                    textTransform: "none",
                    color: "#FFFFFF",
                    background: "linear-gradient(135deg, #2E7D32 0%, #15803D 100%)",
                    boxShadow: "0 8px 25px rgba(46, 125, 50, 0.35)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #15803D 0%, #166534 100%)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  Request Employee Access from HR
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Clock size={20} color="#D97706" />}
                  onClick={() =>
                    showToast(
                      "Your application is currently under review by the HR Manager.",
                      "info"
                    )
                  }
                  sx={{
                    borderRadius: "16px",
                    px: 4,
                    py: 1.6,
                    fontSize: "1rem",
                    fontWeight: 700,
                    textTransform: "none",
                    color: "#D97706",
                    borderColor: "rgba(217, 119, 6, 0.4)",
                    background: "rgba(245, 158, 11, 0.08)",
                  }}
                >
                  Request Pending HR Approval
                </Button>
              )}
            </Grid>

            {/* Hero Visual Card / Request Summary */}
            <Grid item xs={12} md={5}>
              {requestStatus === "pending" ? (
                /* Interactive Pending Status Card */
                <Box
                  sx={{
                    p: 3.5,
                    borderRadius: "24px",
                    background: "rgba(254, 243, 199, 0.5)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                    <Clock size={24} color="#D97706" />
                    <Typography variant="h6" fontWeight={700} color="#B45309">
                      Onboarding Status: Pending
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="#475569" mb={3}>
                    Your application to join as an official employee has been submitted to the HR Manager.
                  </Typography>

                  <Stack spacing={2} mb={3}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="#64748B">
                        Requested Department:
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#0F172A">
                        {requestDetails.department}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="#64748B">
                        Target Job Title:
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="#15803D">
                        {requestDetails.jobTitle}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" color="#64748B">
                        Submitted On:
                      </Typography>
                      <Typography variant="caption" color="#334155">
                        {requestDetails.submittedAt}
                      </Typography>
                    </Box>
                  </Stack>

                  <LinearProgress
                    variant="indeterminate"
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: "rgba(245, 158, 11, 0.2)",
                      "& .MuiLinearProgress-bar": { bgcolor: "#D97706" },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="#64748B"
                    display="block"
                    textAlign="center"
                    mt={1.5}
                  >
                    HR Manager review in progress...
                  </Typography>
                </Box>
              ) : (
                /* Information Visual Card */
                <Box
                  sx={{
                    p: 3.5,
                    borderRadius: "24px",
                    background: "rgba(241, 245, 249, 0.7)",
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1}>
                    How Onboarding Works
                  </Typography>
                  <Typography variant="body2" color="#64748B" mb={3}>
                    Follow 3 simple steps to activate full employee privileges:
                  </Typography>

                  <Stack spacing={2.5}>
                    <Box display="flex" gap={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: "rgba(46, 125, 50, 0.15)",
                          color: "#15803D",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        1
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          Submit Request to HR
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Provide your department interest and position title.
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: "rgba(37, 99, 235, 0.15)",
                          color: "#1D4ED8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        2
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          HR Manager Approval
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          HR verifies your record and upgrades your account role to Employee.
                        </Typography>
                      </Box>
                    </Box>

                    <Box display="flex" gap={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "10px",
                          bgcolor: "rgba(147, 51, 234, 0.15)",
                          color: "#7E22CE",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        3
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                          Unlock Employee Portal
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Gain access to attendance check-in, shift logs, and quiet pods.
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              )}
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
                  bgcolor: "rgba(37, 99, 235, 0.1)",
                  color: "#1D4ED8",
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
            <Grid item xs={12} md={7}>
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
                      bgcolor: "rgba(37, 99, 235, 0.1)",
                      color: "#1D4ED8",
                      fontWeight: 600,
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
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
                      borderRadius="12px"
                      sx={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
                    >
                      <Typography variant="body2" fontWeight={600} color="#0F172A">
                        {role}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => {
                          setDepartment(activeDeptTab);
                          setJobTitle(role);
                          setOpenHRModal(true);
                        }}
                        sx={{
                          color: "#15803D",
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Apply for this Role
                      </Button>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </GlassCard>
      </Container>

      {/* Interactive Modal: Send Request to HR Manager */}
      <Dialog
        open={openHRModal}
        onClose={() => setOpenHRModal(false)}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            color: "#0F172A",
            maxWidth: "520px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pt: 3, pb: 1, color: "#0F172A" }}>
          Request Employee Onboarding from HR Manager
        </DialogTitle>
        <form onSubmit={handleSubmitHRRequest}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Typography variant="body2" color="#64748B">
              Fill out your position details below. Once submitted, the HR Manager will review your details and upgrade your account role to <strong>Employee</strong>.
            </Typography>

            <TextField
              label="Full Name"
              disabled
              value={username}
              fullWidth
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "#334155",
                  WebkitTextFillColor: "#334155",
                },
                "& .MuiInputLabel-root": { color: "#64748B" },
              }}
            />

            <TextField
              label="Email Address"
              disabled
              value={userEmail}
              fullWidth
              sx={{
                "& .MuiInputBase-input.Mui-disabled": {
                  color: "#334155",
                  WebkitTextFillColor: "#334155",
                },
                "& .MuiInputLabel-root": { color: "#64748B" },
              }}
            />

            <TextField
              select
              fullWidth
              label="Target Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      bgcolor: "#FFFFFF",
                      color: "#0F172A",
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
                      "& .MuiMenuItem-root": {
                        color: "#0F172A",
                        "&:hover": { bgcolor: "rgba(46, 125, 50, 0.08)" },
                        "&.Mui-selected": { bgcolor: "rgba(46, 125, 50, 0.15)" },
                      },
                    },
                  },
                },
              }}
              sx={{
                "& .MuiInputBase-input": { color: "#0F172A" },
                "& .MuiInputLabel-root": { color: "#64748B" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#15803D" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#15803D" },
                },
              }}
            >
              <MenuItem value="Engineering">Engineering & Product Tech</MenuItem>
              <MenuItem value="HR">Human Resources & Culture</MenuItem>
              <MenuItem value="Operations">Facilities & Workspace Operations</MenuItem>
              <MenuItem value="Sales">Global Enterprise Sales</MenuItem>
            </TextField>

            <TextField
              required
              fullWidth
              label="Job Title / Position"
              placeholder="e.g. Software Engineer, Operations Analyst..."
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              sx={{
                "& .MuiInputBase-input": { color: "#0F172A" },
                "& .MuiInputLabel-root": { color: "#64748B" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#15803D" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#15803D" },
                },
              }}
            />

            <TextField
              fullWidth
              label="Employee Code / Offer Ref (Optional)"
              placeholder="e.g. EMP-98214..."
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
              sx={{
                "& .MuiInputBase-input": { color: "#0F172A" },
                "& .MuiInputLabel-root": { color: "#64748B" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#15803D" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#15803D" },
                },
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Note for HR Manager (Optional)"
              placeholder="Tell HR about your joining date or team reference..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{
                "& .MuiInputBase-input": { color: "#0F172A" },
                "& .MuiInputLabel-root": { color: "#64748B" },
                "& .MuiInputLabel-root.Mui-focused": { color: "#15803D" },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#CBD5E1" },
                  "&:hover fieldset": { borderColor: "#15803D" },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenHRModal(false)} sx={{ color: "#64748B" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: "12px",
                bgcolor: "#2E7D32",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "#15803D" },
                fontWeight: 700,
                px: 3,
              }}
            >
              Submit Request to HR
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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
          sx={{
            width: "100%",
            borderRadius: "14px",
            boxShadow: "0 8px 32px rgba(15, 23, 42, 0.15)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
