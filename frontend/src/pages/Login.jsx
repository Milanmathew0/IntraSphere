import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Snackbar,
  Alert,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [focusedField, setFocusedField] = useState(null);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // LIVE FIELD VALIDATION RULES & STATUS
  const emailRules = {
    notEmpty: email.trim().length > 0,
    validFormat: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim()),
  };
  const isEmailValid = emailRules.notEmpty && emailRules.validFormat;

  const passwordRules = {
    notEmpty: password.length > 0,
    minLength: password.length >= 6,
  };
  const isPasswordValid = passwordRules.notEmpty && passwordRules.minLength;

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

  // LIVE VALIDATION FUNCTIONS
  const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return "Email address is required";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address (e.g. name@domain.com)";
    }
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required";
    if (val.length < 6) return "Password must be at least 6 characters long";
    return "";
  };

  // INSTANT LIVE KEYSTROKE HANDLERS
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setTouched((prev) => ({ ...prev, email: true }));
    const emailErr = validateEmail(val);
    setErrors((prev) => ({ ...prev, email: emailErr }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setTouched((prev) => ({ ...prev, password: true }));
    const passErr = validatePassword(val);
    setErrors((prev) => ({ ...prev, password: passErr }));
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    if (emailErr) {
      setErrors({ email: emailErr, password: passwordErr });
      setTouched({ email: true, password: true });
      return false;
    }

    if (passwordErr) {
      setErrors({ email: "", password: passwordErr });
      setTouched({ email: true, password: true });
      return false;
    }

    setErrors({ email: "", password: "" });
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await api.post("/api/v1/auth/login", {
        email: email.trim(),
        password,
      });

      const assignedRole = response.data.role || "User";

      authLogin({
        access_token: response.data.access_token,
        role: assignedRole,
        email: response.data.email || email.trim(),
        username: response.data.username || email.trim().split("@")[0],
        user_id: response.data.user_id,
      });

      setSnackbar({
        open: true,
        message: "Login successful! Redirecting to portal...",
        severity: "success",
      });

      if (assignedRole === "Facility Manager") {
        setTimeout(() => navigate("/facility-manager"), 600);
      } else if (assignedRole === "Admin") {
        setTimeout(() => navigate("/admin-dashboard"), 600);
      } else {
        setTimeout(() => navigate("/dashboard"), 600);
      }
    } catch (err) {
      const serverDetail = err.response?.data?.detail;
      let errorMsg = "Unable to login. Please check your email and password.";

      if (serverDetail) {
        if (typeof serverDetail === "string") {
          errorMsg = serverDetail;
        } else if (Array.isArray(serverDetail)) {
          errorMsg = serverDetail.map((d) => d.msg).join(", ");
        }
      }

      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });

      if (err.response?.status === 401) {
        setErrors({
          email: "Invalid email or password",
          password: "",
        });
        setTouched({ email: true, password: false });
      }
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
        message: "Google Sign-In successful! Redirecting...",
        severity: "success",
      });

      if (assignedRole === "Facility Manager") {
        setTimeout(() => navigate("/facility-manager"), 600);
      } else if (assignedRole === "Admin") {
        setTimeout(() => navigate("/admin-dashboard"), 600);
      } else {
        setTimeout(() => navigate("/dashboard"), 600);
      }
    } catch (err) {
      console.error("Google authentication error:", err);
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
          <Box sx={{ mb: 3.5 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              color="#0F172A"
              sx={{ letterSpacing: -0.5, mb: 0.8 }}
            >
              Sign In
            </Typography>
            <Typography variant="body2" color="#64748B" fontWeight={500}>
              Enter your corporate credentials to access IntraSphere.
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.2}>
              <Box>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.8, display: "block" }}>
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!(touched.email && errors.email)}
                  helperText={touched.email && errors.email ? errors.email : ""}
                  placeholder="name@company.com"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
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
                          <EmailOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ mb: 0.8, display: "block" }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  size="medium"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!(touched.password && errors.password)}
                  helperText={touched.password && errors.password ? errors.password : ""}
                  placeholder="••••••••"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
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
                          <LockOutlinedIcon sx={{ color: "#94A3B8", fontSize: 20 }} />
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

              {/* Remember Me & Forgot Password Row */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ pt: 0.5 }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      sx={{
                        color: "#CBD5E1",
                        "&.Mui-checked": { color: "#F97316" },
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" color="#475569" fontWeight={500}>
                      Remember me
                    </Typography>
                  }
                />

                <Link
                  component={RouterLink}
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSnackbar({
                      open: true,
                      message: "If an active account exists, password reset instructions have been sent.",
                      severity: "info",
                    });
                  }}
                  variant="body2"
                  sx={{
                    color: "#F97316",
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Forgot password?
                </Link>
              </Stack>

              {/* Login Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                size="large"
                sx={{
                  py: 1.4,
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "none",
                  backgroundColor: "#F97316",
                  boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
                  "&:hover": { backgroundColor: "#EA580C" },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In to Portal"}
              </Button>
            </Stack>

            {/* Divider */}
            <Divider sx={{ my: 3 }}>
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
                    message: "Google Sign-In failed or was cancelled.",
                    severity: "error",
                  });
                }}
                theme="outline"
                size="large"
                shape="rectangular"
                width="100%"
                text="signin_with"
              />
            </Box>

            {/* Register Link */}
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="#64748B" fontWeight={500}>
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: "#F97316",
                    fontWeight: 700,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Register Account
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
