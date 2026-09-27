import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider
} from "@mui/material";
import { Lock, Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import api from "../api/axios";
import { PasswordStrengthIndicator } from "../components/PasswordStrengthIndicator";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Resend feature state
  const [showResend, setShowResend] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("This activation link is invalid or missing a token.");
      setShowResend(true);
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError("Missing activation token.");
      setShowResend(true);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      await api.post("/api/v1/auth/activate", {
        token: token,
        password: formData.password
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail || "Failed to activate account";
      setError(detail);
      if (detail.toLowerCase().includes("expired") || detail.toLowerCase().includes("invalid")) {
        setShowResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      setResendError("Please enter your registered email address.");
      return;
    }

    setResendLoading(true);
    setResendError("");
    setResendSuccess("");

    try {
      const res = await api.post("/api/v1/auth/resend-activation", {
        email: resendEmail
      });
      setResendSuccess(res.data.message || "A new activation link has been sent to your email.");
      setResendEmail("");
    } catch (err) {
      console.error(err);
      setResendError(err.response?.data?.detail || "Failed to resend activation link. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FFFBF7",
        p: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 440,
          width: "100%",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          textAlign: "center"
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            bgcolor: success ? "#E6F4EA" : "#FFF7ED",
            color: success ? "#F97316" : "#F97316",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2
          }}
        >
          {success ? <CheckCircle2 size={32} /> : <Lock size={32} />}
        </Box>

        <Typography variant="h5" fontWeight={800} mb={1} color="#1E293B">
          {success ? "Account Activated!" : "Activate Your Account"}
        </Typography>

        <Typography variant="body2" color="textSecondary" mb={3}>
          {success
            ? "Your password has been created successfully. Redirecting you to login..."
            : "Create a secure password to activate your IntraSphere employee account."}
        </Typography>

        {error && (
          <Alert severity="error" icon={<AlertCircle size={20} />} sx={{ mb: 3, textAlign: "left", borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" icon={<CheckCircle2 size={20} />} sx={{ mb: 3, textAlign: "left", borderRadius: "10px" }}>
            Account activated successfully! Redirecting to login...
          </Alert>
        )}

        {/* Activation Form */}
        {!success && token && !showResend && (
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              required
              type="password"
              label="New Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading || success}
              sx={{ mb: 1 }}
            />

            <Box sx={{ mb: 2, textAlign: "left" }}>
              <PasswordStrengthIndicator password={formData.password} />
            </Box>

            <TextField
              fullWidth
              required
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading || success}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading || success}
              sx={{
                py: 1.5,
                borderRadius: "12px",
                bgcolor: "#F97316",
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#EA580C" }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Activate My Account"}
            </Button>
          </form>
        )}

        {/* Resend Email Section when Link is Expired / Invalid */}
        {!success && (showResend || !token) && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="textSecondary">
                Need a new activation link?
              </Typography>
            </Divider>

            {resendError && (
              <Alert severity="error" sx={{ mb: 2, textAlign: "left", borderRadius: "8px" }}>
                {resendError}
              </Alert>
            )}

            {resendSuccess && (
              <Alert severity="success" sx={{ mb: 2, textAlign: "left", borderRadius: "8px" }}>
                {resendSuccess}
              </Alert>
            )}

            <form onSubmit={handleResendSubmit}>
              <TextField
                fullWidth
                required
                type="email"
                label="Registered Email Address"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={resendLoading}
                placeholder="employee@example.com"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <Mail size={18} style={{ marginRight: 8, color: "#94A3B8" }} />
                }}
              />
              <Button
                fullWidth
                type="submit"
                variant="outlined"
                disabled={resendLoading}
                startIcon={resendLoading ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
                sx={{
                  py: 1.25,
                  borderRadius: "10px",
                  borderColor: "#F97316",
                  color: "#F97316",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#FFF7ED", borderColor: "#EA580C" }
                }}
              >
                {resendLoading ? "Sending..." : "Resend Activation Email"}
              </Button>
            </form>
          </Box>
        )}

        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #F1F5F9" }}>
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            endIcon={<ArrowRight size={16} />}
            sx={{ textTransform: "none", color: "#64748B", fontWeight: 600 }}
          >
            Go to Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
