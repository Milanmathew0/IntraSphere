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
    setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setErrors({
      email: emailErr,
      password: passwordErr,
    });
    setTouched({ email: true, password: true });

    return !emailErr && !passwordErr;
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

      setTimeout(() => navigate("/dashboard"), 600);
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
          password: "Check password and try again",
        });
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

      setTimeout(() => navigate("/dashboard"), 600);
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
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                bgcolor: "#1976D2",
                width: 52,
                height: 52,
                mb: 1.5,
              }}
            >
              <LockOutlinedIcon fontSize="medium" />
            </Avatar>

            <Typography
              variant="h5"
              fontWeight="bold"
              align="center"
              color="#1E293B"
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mt: 0.5 }}
            >
              Sign in to IntraSphere Smart Office System
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email Address"
              fullWidth
              margin="normal"
              value={email}
              onChange={handleEmailChange}
              error={!!(touched.email && errors.email)}
              helperText={touched.email && errors.email ? errors.email : ""}
              placeholder="name@company.com"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon color={touched.email && errors.email ? "error" : "action"} fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              margin="normal"
              value={password}
              onChange={handlePasswordChange}
              error={!!(touched.password && errors.password)}
              helperText={touched.password && errors.password ? errors.password : ""}
              placeholder="Enter your password"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color={touched.password && errors.password ? "error" : "action"} fontSize="small" />
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

            {/* Remember Me & Forgot Password Row */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1, mb: 2 }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    Remember Me
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
                color="primary"
                sx={{
                  fontWeight: 500,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot Password?
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
                py: 1.3,
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "#1976D2",
                "&:hover": { backgroundColor: "#1565C0" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>

            {/* Divider */}
            <Divider sx={{ my: 2.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 1, fontWeight: 600 }}
              >
                OR SIGN IN WITH
              </Typography>
            </Divider>

            {/* Google Sign-In Button */}
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", my: 1 }}>
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
                shape="pill"
                width="100%"
                text="signin_with"
              />
            </Box>

            {/* Register Link */}
            <Box textAlign="center" mt={2.5}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  color="primary"
                  sx={{
                    fontWeight: 600,
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
