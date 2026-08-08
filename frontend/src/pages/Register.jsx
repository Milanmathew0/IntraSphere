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
      return {};
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      await api.post("/api/v1/auth/register", {
        username,
        email,
        password,
      });

      setSnackbar({
        open: true,
        message: "Account created successfully!",
        severity: "success",
      });

      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || "Registration failed",
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
        name: decoded.name || `${decoded.given_name || ""} ${decoded.family_name || ""}`.strip(),
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
          borderRadius: "16px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0px 14px 36px rgba(0, 0, 0, 0.08)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header Avatar & Title */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2.5 }}>
            <Avatar
              sx={{
                bgcolor: "#2E7D32",
                width: 48,
                height: 48,
                mb: 1.5,
              }}
            >
              <PersonAddAlt1Icon />
            </Avatar>

            <Typography variant="h5" fontWeight="bold" align="center" color="#1E293B">
              Create Account
            </Typography>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5 }}>
              Join IntraSphere Smart Office Portal
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Username"
              fullWidth
              margin="dense"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={!!errors.username}
              helperText={errors.username}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Email Address"
              fullWidth
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <PasswordStrengthIndicator password={password} />

            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Register Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              size="large"
              sx={{
                mt: 2.5,
                py: 1.3,
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "#2E7D32",
                "&:hover": { backgroundColor: "#1B5E20" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 2.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, fontWeight: 600 }}>
                OR SIGN UP WITH
              </Typography>
            </Divider>

            {/* Google Sign-In Button */}
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", my: 1 }}>
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
                shape="pill"
                width="100%"
                text="signup_with"
              />
            </Box>

            {/* Login Link */}
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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