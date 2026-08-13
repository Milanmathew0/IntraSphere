import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import { Lock } from "lucide-react";
import api from "../api/axios";

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

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing activation token.");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to activate account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#F4F6F0",
        p: 2
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 4,
          maxWidth: 400,
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
            bgcolor: "#E6F4EA",
            color: "#10B981",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2
          }}
        >
          <Lock size={32} />
        </Box>
        <Typography variant="h5" fontWeight={800} mb={1}>
          Activate Account
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={4}>
          Set a secure password to activate your new employee account.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Account activated successfully! Redirecting to login...
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            type="password"
            label="New Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading || success || !token}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading || success || !token}
            sx={{ mb: 3 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || success || !token}
            sx={{
              py: 1.5,
              borderRadius: "12px",
              bgcolor: "#10B981",
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              "&:hover": { bgcolor: "#059669" }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Activate"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
