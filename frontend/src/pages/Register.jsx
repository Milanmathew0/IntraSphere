import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Snackbar,
  Alert,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";
import { PasswordStrengthIndicator } from "../components/PasswordStrengthIndicator";

export default function Register() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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
      return null;
    }
  };

  // LIVE VALIDATORS
  const validateUsername = (val) => {
    if (!val || !val.trim()) return "Full name is required";
    if (val.trim().length < 3) return "Name must be at least 3 characters";
    return "";
  };

  const validateEmail = (val) => {
    if (!val || !val.trim()) return "Email address is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters long";
    return "";
  };

  const validateConfirmPassword = (confirmVal, pwdVal) => {
    if (!confirmVal) return "Please confirm your password";
    if (confirmVal !== pwdVal) return "Passwords do not match";
    return "";
  };

  const getFirstErrorMap = (rawErrors) => {
    const fields = ["username", "email", "password", "confirmPassword"];
    const result = { username: "", email: "", password: "", confirmPassword: "" };
    for (const f of fields) {
      if (rawErrors[f]) {
        result[f] = rawErrors[f];
        break;
      }
    }
    return result;
  };

  // INSTANT LIVE KEYSTROKE HANDLERS
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    setTouched((prev) => ({ ...prev, username: true }));
    const raw = {
      username: validateUsername(val),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
    setErrors(getFirstErrorMap(raw));
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setTouched((prev) => ({ ...prev, email: true }));
    const raw = {
      username: validateUsername(username),
      email: validateEmail(val),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };
    setErrors(getFirstErrorMap(raw));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setTouched((prev) => ({ ...prev, password: true }));
    const raw = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(val),
      confirmPassword: confirmPassword ? validateConfirmPassword(confirmPassword, val) : "",
    };
    setErrors(getFirstErrorMap(raw));
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    setTouched((prev) => ({ ...prev, confirmPassword: true }));
    const raw = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(val, password),
    };
    setErrors(getFirstErrorMap(raw));
  };

  const validateForm = () => {
    const rawErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword, password),
    };

    const hasAnyError = Object.values(rawErrors).some(Boolean);
    setErrors(getFirstErrorMap(rawErrors));
    setTouched({ username: true, email: true, password: true, confirmPassword: true });

    return !hasAnyError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post("/api/v1/auth/register", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setSnackbar({
        open: true,
        message: "Account created successfully! Redirecting to login...",
        severity: "success",
      });

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const serverDetail = err.response?.data?.detail;
      let errorMsg = "Registration failed. Please check your information.";

      if (serverDetail) {
        if (typeof serverDetail === "string") {
          errorMsg = serverDetail;
          if (serverDetail.toLowerCase().includes("email")) {
            setErrors((prev) => ({ ...prev, email: serverDetail }));
          }
        } else if (Array.isArray(serverDetail)) {
          errorMsg = serverDetail.map((d) => d.msg).join(", ");
        }
      }

      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
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

      setSnackbar({
        open: true,
        message: "Google Sign-Up successful! Redirecting...",
        severity: "success",
      });

      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      console.error("Google registration error:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Google authentication failed.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: "20px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0px 10px 30px rgba(15, 23, 42, 0.05)",
          p: { xs: 1, sm: 1.5 },
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header Title */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              color="#0F172A"
              sx={{ letterSpacing: -0.5, mb: 0.8 }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" color="#64748B" fontWeight={500}>
              Register your credentials to access IntraSphere.
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                  Full Name / Username
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={username}
                  onChange={handleUsernameChange}
                  error={!!(touched.username && errors.username)}
                  helperText={touched.username && errors.username ? errors.username : ""}
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
                          <PersonOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
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
                  value={email}
                  onChange={handleEmailChange}
                  error={!!(touched.email && errors.email)}
                  helperText={touched.email && errors.email ? errors.email : ""}
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
                          <EmailOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!(touched.password && errors.password)}
                  helperText={touched.password && errors.password ? errors.password : ""}
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
                          <LockOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: "#94A3B8" }}
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <PasswordStrengthIndicator password={password} />

              <Box>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.5, display: "block" }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  error={!!(touched.confirmPassword && errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ""}
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
                          <LockOutlinedIcon sx={{ color: "#94A3B8", fontSize: 18 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            size="small"
                            sx={{ color: "#94A3B8" }}
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              {/* Register Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                size="large"
                sx={{
                  mt: 1,
                  py: 1.3,
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "none",
                  backgroundColor: "#F97316",
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                  "&:hover": { backgroundColor: "#EA580C" },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
              </Button>
            </Stack>

            {/* Divider */}
            <Divider sx={{ my: 2.5 }}>
              <Typography
                variant="caption"
                color="#94A3B8"
                sx={{ px: 1, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}
              >
                or continue with
              </Typography>
            </Divider>

            {/* Google Sign-In Button */}
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: 2 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setSnackbar({
                    open: true,
                    message: "Google Sign-Up failed or was cancelled.",
                    severity: "error",
                  });
                }}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
                text="signup_with"
              />
            </Box>

            {/* Login Link */}
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="#64748B" fontWeight={500}>
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: "#F97316",
                    fontWeight: 700,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar Alert */}
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
    </AuthLayout>
  );
}