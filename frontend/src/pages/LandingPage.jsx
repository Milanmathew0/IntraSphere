import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
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
  KeyRound,
  UserPlus,
  MonitorCheck,
  Calendar,
  Layers,
  Wrench,
  Eye,
  EyeOff,
  Mail,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { PasswordStrengthIndicator } from "../components/PasswordStrengthIndicator";

export default function LandingPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // AUTH MODAL & TAB STATE
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "register"

  // LOGIN FORM STATE
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginTouched, setLoginTouched] = useState({});
  const [loginErrors, setLoginErrors] = useState({});

  // REGISTER FORM STATE
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regTouched, setRegTouched] = useState({});
  const [regErrors, setRegErrors] = useState({});

  // SNACKBAR
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const openAuth = (tabMode = "login") => {
    setAuthTab(tabMode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return {};
    }
  };

  // LIVE LOGIN VALIDATION
  const validateLoginEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "Enter a valid email address";
    return "";
  };

  const validateLoginPassword = (val) => {
    if (!val) return "Password is required";
    return "";
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateLoginEmail(loginEmail);
    const passErr = validateLoginPassword(loginPassword);

    if (emailErr || passErr) {
      setLoginErrors({ email: emailErr, password: passErr });
      setLoginTouched({ email: true, password: true });
      return;
    }

    setLoginLoading(true);
    try {
      const response = await api.post("/api/v1/auth/login", {
        email: loginEmail.trim(),
        password: loginPassword,
      });

      const assignedRole = response.data.role || "User";
      authLogin({
        access_token: response.data.access_token,
        role: assignedRole,
        email: response.data.email || loginEmail.trim(),
        username: response.data.username || loginEmail.trim().split("@")[0],
        user_id: response.data.user_id,
      });

      setSnackbar({ open: true, message: "Login successful! Redirecting...", severity: "success" });
      closeAuth();

      if (assignedRole === "Facility Manager") {
        setTimeout(() => navigate("/facility-manager"), 500);
      } else if (assignedRole === "Admin") {
        setTimeout(() => navigate("/admin-dashboard"), 500);
      } else {
        setTimeout(() => navigate("/dashboard"), 500);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Unable to sign in. Please check your credentials.",
        severity: "error",
      });
    } finally {
      setLoginLoading(false);
    }
  };

  // LIVE REGISTER VALIDATION
  const validateRegUsername = (val) => {
    if (!val.trim()) return "Full name is required";
    if (val.trim().length < 3) return "Name must be at least 3 characters";
    return "";
  };

  const validateRegEmail = (val) => {
    if (!val.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return "Enter a valid email address";
    return "";
  };

  const validateRegPassword = (val) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const validateRegConfirm = (confirmVal, pwdVal) => {
    if (!confirmVal) return "Confirm your password";
    if (confirmVal !== pwdVal) return "Passwords do not match";
    return "";
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const nameErr = validateRegUsername(regUsername);
    const emailErr = validateRegEmail(regEmail);
    const passErr = validateRegPassword(regPassword);
    const confirmErr = validateRegConfirm(regConfirmPassword, regPassword);

    if (nameErr || emailErr || passErr || confirmErr) {
      setRegErrors({ username: nameErr, email: emailErr, password: passErr, confirmPassword: confirmErr });
      setRegTouched({ username: true, email: true, password: true, confirmPassword: true });
      return;
    }

    setRegLoading(true);
    try {
      await api.post("/api/v1/auth/register", {
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });

      setSnackbar({ open: true, message: "Account created! Signing you in...", severity: "success" });
      
      // Auto-login after registration
      const loginRes = await api.post("/api/v1/auth/login", {
        email: regEmail.trim(),
        password: regPassword,
      });

      const assignedRole = loginRes.data.role || "User";
      authLogin({
        access_token: loginRes.data.access_token,
        role: assignedRole,
        email: loginRes.data.email || regEmail.trim(),
        username: loginRes.data.username || regUsername.trim(),
        user_id: loginRes.data.user_id,
      });

      closeAuth();
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Registration failed. Please try again.",
        severity: "error",
      });
    } finally {
      setRegLoading(false);
    }
  };

  // GOOGLE SSO HANDLER
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = parseJwt(credentialResponse.credential);
      const response = await api.post("/api/v1/auth/google", {
        email: decoded.email,
        name: decoded.name || `${decoded.given_name || ""} ${decoded.family_name || ""}`.trim(),
        picture: decoded.picture || "",
        google_id: decoded.sub,
        token: credentialResponse.credential,
      });

      const assignedRole = response.data.role || "User";
      authLogin({
        access_token: response.data.access_token,
        role: assignedRole,
        email: response.data.email || decoded.email,
        username: response.data.username || decoded.name || decoded.email.split("@")[0],
        user_id: response.data.user_id,
        picture: response.data.picture,
      });

      setSnackbar({ open: true, message: "Google Single Sign-On successful!", severity: "success" });
      closeAuth();
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setSnackbar({ open: true, message: "Google Sign-In failed.", severity: "error" });
    }
  };

  // 9 RELEVANT SMART OFFICE FEATURES (3x3 GRID)
  const features = [
    {
      title: "Desk & Workstation Booking",
      desc: "Reserve smart desks, quiet pods, and standing workstations with interactive floor maps and live availability.",
      icon: <Building size={26} color="#F97316" />,
      bg: "rgba(249, 115, 22, 0.08)",
      tag: "Workspace",
    },
    {
      title: "Meeting & Conference Rooms",
      desc: "Book conference rooms on-the-fly, view AV equipment, manage capacity limits, and prevent scheduling conflicts.",
      icon: <Users size={26} color="#2563EB" />,
      bg: "rgba(37, 99, 235, 0.08)",
      tag: "Meetings",
    },
    {
      title: "Automated Punch & Attendance",
      desc: "Instant daily clock-in/out tracking, shift time recording, and monthly attendance progress dashboards.",
      icon: <UserCheck size={26} color="#7C3AED" />,
      bg: "rgba(124, 58, 237, 0.08)",
      tag: "Attendance",
    },
    {
      title: "Leave & Absence Portal",
      desc: "Submit leave applications, track manager approval status in real-time, and manage team absence schedules.",
      icon: <Calendar size={26} color="#059669" />,
      bg: "rgba(5, 150, 105, 0.08)",
      tag: "HR Portal",
    },
    {
      title: "Employee Directory & Teams",
      desc: "Centralized workforce search across engineering, product, HR, sales, and executive management teams.",
      icon: <Layers size={26} color="#D97706" />,
      bg: "rgba(217, 119, 6, 0.08)",
      tag: "Directory",
    },
    {
      title: "Role-Based Access Control",
      desc: "Custom permissions and tailored dashboards for Employees, Managers, HR Specialists, and System Admins.",
      icon: <Lock size={26} color="#DC2626" />,
      bg: "rgba(220, 38, 38, 0.08)",
      tag: "Security",
    },
    {
      title: "Live Occupancy Analytics",
      desc: "Real-time facility utilization insights, floor heatmaps, peak hour statistics, and desk usage reporting.",
      icon: <BarChart3 size={26} color="#00796B" />,
      bg: "rgba(0, 121, 107, 0.08)",
      tag: "Analytics",
    },
    {
      title: "Facility Maintenance & IT Support",
      desc: "Log equipment repair requests, report workspace issues, and track IT support tickets to resolution.",
      icon: <Wrench size={26} color="#EA580C" />,
      bg: "rgba(234, 88, 12, 0.08)",
      tag: "Operations",
    },
    {
      title: "Google OAuth 2.0 Single Sign-On",
      desc: "One-click corporate SSO authentication, instant profile creation, and secure 256-bit JWT bearer token protection.",
      icon: <Zap size={26} color="#4F46E5" />,
      bg: "rgba(79, 70, 229, 0.08)",
      tag: "Auth & SSO",
    },
  ];

  // 3 STATS CARDS FOR PERFECT 3-COLUMN SYMMETRY
  const stats = [
    {
      value: "150+",
      label: "Active Corporate Users",
      chip: "Live Workforce",
      icon: <Users size={22} color="#F97316" />,
      bg: "#FFF7ED",
      color: "#C2410C",
    },
    {
      value: "160",
      label: "Smart Desks & Pods",
      chip: "Real-Time Occupancy",
      icon: <MonitorCheck size={22} color="#2563EB" />,
      bg: "#EFF6FF",
      color: "#1D4ED8",
    },
    {
      value: "99.9%",
      label: "System Security Uptime",
      chip: "OAuth 2.0 / JWT",
      icon: <ShieldCheck size={22} color="#059669" />,
      bg: "#ECFDF5",
      color: "#047857",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        overflowX: "hidden",
      }}
    >
      {/* ========================================== */}
      {/* FROSTED GLASS BLUR AUTH FORM OVERLAY MODAL */}
      {/* ========================================== */}
      <Dialog
        open={authModalOpen}
        onClose={closeAuth}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: "28px",
            maxWidth: 480,
            width: "100%",
            mx: "auto",
            bgcolor: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 25px 60px -15px rgba(15, 23, 42, 0.35)",
            border: "1px solid rgba(255, 255, 255, 0.8)",
            position: "relative",
            maxHeight: "92vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <DialogContent
          sx={{
            p: { xs: 3, sm: 4 },
            overflowY: "auto",
            position: "relative",
            "&::-webkit-scrollbar": { width: 6 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#CBD5E1", borderRadius: 3 },
          }}
        >
          {/* Close Button */}
          <IconButton
            onClick={closeAuth}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "#94A3B8",
              bgcolor: "#F8FAFC",
              "&:hover": { color: "#0F172A", bgcolor: "#F1F5F9" },
            }}
          >
            <X size={18} />
          </IconButton>

          {/* Modal Header Badge */}
          <Box sx={{ textAlign: "center", mt: 0.5, mb: 2 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1.5,
                boxShadow: "0 8px 20px rgba(249, 115, 22, 0.35)",
              }}
            >
              <Sparkles size={26} color="#FFFFFF" />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
              IntraSphere Portal
            </Typography>
          </Box>

          {/* Tab Toggle (Sign In | Create Account) */}
          <Tabs
            value={authTab}
            onChange={(e, val) => setAuthTab(val)}
            centered
            sx={{
              mb: 3,
              bgcolor: "#F1F5F9",
              borderRadius: "14px",
              p: 0.5,
              minHeight: 44,
              "& .MuiTabs-indicator": {
                bgcolor: "#FFFFFF",
                borderRadius: "10px",
                height: "100%",
                boxShadow: "0 2px 10px rgba(15, 23, 42, 0.1)",
              },
            }}
          >
            <Tab
              value="login"
              label="Sign In"
              icon={<KeyRound size={16} />}
              iconPosition="start"
              sx={{
                fontWeight: 700,
                fontSize: "0.88rem",
                textTransform: "none",
                zIndex: 1,
                minHeight: 38,
                borderRadius: "10px",
                color: "#64748B",
                "&.Mui-selected": { color: "#0F172A" },
              }}
            />
            <Tab
              value="register"
              label="Create Account"
              icon={<UserPlus size={16} />}
              iconPosition="start"
              sx={{
                fontWeight: 700,
                fontSize: "0.88rem",
                textTransform: "none",
                zIndex: 1,
                minHeight: 38,
                borderRadius: "10px",
                color: "#64748B",
                "&.Mui-selected": { color: "#0F172A" },
              }}
            />
          </Tabs>

          {/* FORM BODY */}
          {authTab === "login" ? (
            /* ============ SIGN IN FORM ============ */
            <Box component="form" onSubmit={handleLoginSubmit} noValidate>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setLoginTouched((p) => ({ ...p, email: true }));
                      setLoginErrors((p) => ({ ...p, email: validateLoginEmail(e.target.value) }));
                    }}
                    error={!!(loginTouched.email && loginErrors.email)}
                    helperText={loginTouched.email && loginErrors.email ? loginErrors.email : ""}
                    placeholder="name@company.com"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#F97316" },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={18} color="#94A3B8" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setLoginTouched((p) => ({ ...p, password: true }));
                      setLoginErrors((p) => ({ ...p, password: validateLoginPassword(e.target.value) }));
                    }}
                    error={!!(loginTouched.password && loginErrors.password)}
                    helperText={loginTouched.password && loginErrors.password ? loginErrors.password : ""}
                    placeholder="••••••••"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#F97316" },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} color="#94A3B8" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: "#94A3B8" }}
                            >
                              {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                        sx={{ color: "#CBD5E1", "&.Mui-checked": { color: "#F97316" } }}
                      />
                    }
                    label={<Typography variant="caption" color="#475569" fontWeight={600}>Remember me</Typography>}
                  />

                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setSnackbar({ open: true, message: "Password reset link has been sent to your email.", severity: "info" });
                    }}
                    variant="caption"
                    sx={{ color: "#F97316", fontWeight: 700, textDecoration: "none" }}
                  >
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loginLoading}
                  sx={{
                    py: 1.3,
                    borderRadius: "12px",
                    bgcolor: "#F97316",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                    "&:hover": { bgcolor: "#EA580C" },
                  }}
                >
                  {loginLoading ? <CircularProgress size={22} color="inherit" /> : "Sign In to Portal"}
                </Button>
              </Stack>
            </Box>
          ) : (
            /* ============ REGISTER FORM ============ */
            <Box component="form" onSubmit={handleRegisterSubmit} noValidate>
              <Stack spacing={1.8}>
                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                    Full Name / Username
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      setRegTouched((p) => ({ ...p, username: true }));
                      setRegErrors((p) => ({ ...p, username: validateRegUsername(e.target.value) }));
                    }}
                    error={!!(regTouched.username && regErrors.username)}
                    helperText={regTouched.username && regErrors.username ? regErrors.username : ""}
                    placeholder="John Doe"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#F97316" },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <User size={18} color="#94A3B8" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                    Email Address
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      setRegTouched((p) => ({ ...p, email: true }));
                      setRegErrors((p) => ({ ...p, email: validateRegEmail(e.target.value) }));
                    }}
                    error={!!(regTouched.email && regErrors.email)}
                    helperText={regTouched.email && regErrors.email ? regErrors.email : ""}
                    placeholder="name@company.com"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#F97316" },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Mail size={18} color="#94A3B8" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value);
                      setRegTouched((p) => ({ ...p, password: true }));
                      setRegErrors((p) => ({ ...p, password: validateRegPassword(e.target.value) }));
                    }}
                    error={!!(regTouched.password && regErrors.password)}
                    helperText={regTouched.password && regErrors.password ? regErrors.password : ""}
                    placeholder="At least 8 characters"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#F97316" },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} color="#94A3B8" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: "#94A3B8" }}
                            >
                              {showRegPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <PasswordStrengthIndicator password={regPassword} />

                <Box>
                  <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showRegConfirmPassword ? "text" : "password"}
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value);
                      setRegTouched((p) => ({ ...p, confirmPassword: true }));
                      setRegErrors((p) => ({ ...p, confirmPassword: validateRegConfirm(e.target.value, regPassword) }));
                    }}
                    error={!!(regTouched.confirmPassword && regErrors.confirmPassword)}
                    helperText={regTouched.confirmPassword && regErrors.confirmPassword ? regErrors.confirmPassword : ""}
                    placeholder="Re-enter password"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        bgcolor: "#F8FAFC",
                        "& fieldset": { borderColor: "#E2E8F0" },
                        "&:hover fieldset": { borderColor: "#CBD5E1" },
                        "&.Mui-focused fieldset": { borderColor: "#F97316" },
                      },
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock size={18} color="#94A3B8" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: "#94A3B8" }}
                            >
                              {showRegConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={regLoading}
                  sx={{
                    py: 1.3,
                    borderRadius: "12px",
                    bgcolor: "#F97316",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                    "&:hover": { bgcolor: "#EA580C" },
                  }}
                >
                  {regLoading ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
                </Button>
              </Stack>
            </Box>
          )}

          {/* DIVIDER */}
          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" color="#94A3B8" fontWeight={700} sx={{ textTransform: "uppercase", px: 1 }}>
              or continue with
            </Typography>
          </Divider>

          {/* GOOGLE SSO */}
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%", pb: 1 }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setSnackbar({ open: true, message: "Google Sign-In failed.", severity: "error" })}
              theme="outline"
              size="large"
              shape="rectangular"
              width="100%"
            />
          </Box>
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
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
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
                  Smart Office Portal
                </Typography>
              </Box>
            </Box>

            {/* Nav Links */}
            <Stack direction="row" spacing={4} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
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

            {/* Actions */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                onClick={() => openAuth("login")}
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
                onClick={() => openAuth("register")}
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
                Get Started
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* 2. HERO SECTION */}
      <Box
        sx={{
          bgcolor: "#F8FAFC",
          pt: { xs: 7, md: 9 },
          pb: { xs: 8, md: 10 },
          px: { xs: 2, sm: 4 },
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container maxWidth="lg" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Announcement Badge */}
          <Chip
            icon={<Sparkles size={16} color="#F97316" />}
            label="IntraSphere Enterprise • Smart Office System"
            sx={{
              bgcolor: "#FFF7ED",
              color: "#C2410C",
              fontWeight: 700,
              fontSize: "0.85rem",
              py: 2,
              px: 1.5,
              borderRadius: "50px",
              border: "1px solid #FFEDD5",
              mb: 3,
              boxShadow: "0 2px 10px rgba(249, 115, 22, 0.08)",
            }}
          />

          {/* Title */}
          <Typography
            variant="h2"
            fontWeight={900}
            letterSpacing={-1.5}
            color="#0F172A"
            sx={{
              fontSize: { xs: "2.2rem", sm: "3.2rem", md: "3.8rem" },
              lineHeight: 1.15,
              mb: 2.5,
              maxWidth: 900,
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
              maxWidth: 720,
              mx: "auto",
              mb: 4.5,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            Streamline desk bookings, meeting rooms, attendance tracking, and HR operations in one unified enterprise portal.
          </Typography>

          {/* Hero Buttons */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mb={5}>
            <Button
              variant="contained"
              size="large"
              onClick={() => openAuth("register")}
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
              onClick={() => openAuth("login")}
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
          <Stack direction="row" spacing={3.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 2 }}>
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

      {/* 3. SYMMETRICAL 3 STATS CARDS */}
      <Container maxWidth="lg" sx={{ mb: 10 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 3,
            width: "100%",
          }}
        >
          {stats.map((stat, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                border: "1px solid #E2E8F0",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 36px rgba(15, 23, 42, 0.08)", borderColor: "#CBD5E1" },
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  bgcolor: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5,
                }}
              >
                {stat.icon}
              </Box>
              <Chip
                label={stat.chip}
                size="small"
                sx={{ bgcolor: stat.bg, color: stat.color, fontWeight: 700, mb: 1, fontSize: "0.75rem" }}
              />
              <Typography variant="h3" fontWeight={800} color="#0F172A" mb={0.5}>
                {stat.value}
              </Typography>
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                {stat.label}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* 4. PLATFORM FEATURES SECTION (EXACT 3x3 GRID) */}
      <Container maxWidth="lg" sx={{ mb: 12 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 7, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Chip
            label="PLATFORM CAPABILITIES"
            sx={{
              bgcolor: "rgba(249, 115, 22, 0.1)",
              color: "#F97316",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: 1.2,
              mb: 1.5,
              borderRadius: "20px",
              px: 1,
            }}
          />
          <Typography variant="h3" fontWeight={800} color="#0F172A" letterSpacing={-0.5} mb={2}>
            Built for Modern Smart Workplaces
          </Typography>
          <Typography variant="body1" color="#64748B" sx={{ maxWidth: 640, mx: "auto", lineHeight: 1.6 }}>
            Comprehensive enterprise tools to reserve desks, manage meeting rooms, track attendance, and oversee office operations inside one unified portal.
          </Typography>
        </Box>

        {/* 3x3 Cards CSS Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3.5,
            width: "100%",
          }}
        >
          {features.map((feature, idx) => (
            <Card
              key={idx}
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: "20px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                textAlign: "center",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
                  borderColor: "#F97316",
                },
              }}
            >
              <CardContent
                sx={{
                  p: 3.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                {/* Icon Box */}
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "16px",
                    bgcolor: feature.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 2.5,
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
                  }}
                >
                  {feature.icon}
                </Box>

                {/* Tag Chip */}
                <Chip
                  label={feature.tag}
                  size="small"
                  sx={{
                    bgcolor: "#F8FAFC",
                    color: "#475569",
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    mb: 1.5,
                    border: "1px solid #E2E8F0",
                  }}
                />

                {/* Title */}
                <Typography variant="h6" fontWeight={800} color="#0F172A" mb={1.5} sx={{ fontSize: "1.05rem" }}>
                  {feature.title}
                </Typography>

                {/* Description */}
                <Typography variant="body2" color="#64748B" sx={{ lineHeight: 1.6, fontSize: "0.88rem" }}>
                  {feature.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
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
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
          }}
        >
          <Typography variant="h3" fontWeight={800} letterSpacing={-0.5} mb={2}>
            Ready to Transform Your Workplace?
          </Typography>
          <Typography variant="h6" sx={{ color: "#94A3B8", fontWeight: 400, maxWidth: 640, mx: "auto", mb: 4 }}>
            Experience the next-generation IntraSphere HR & Operations Control Portal today.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => openAuth("register")}
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
              onClick={() => openAuth("login")}
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
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

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


