import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  CircularProgress,
  Divider,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  UserCheck,
  UserX,
  Clock,
  Briefcase,
  Mail,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function OnboardingRequestsWidget({ showToast }) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/onboarding/requests?status=pending");
      setRequests(res.data.requests || []);
    } catch (err) {
      console.log("Error fetching onboarding requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/api/v1/onboarding/requests/${id}/approve`);
      if (showToast) {
        showToast("Employee access request APPROVED! Account role upgraded to Employee.", "success");
      }
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast(err.response?.data?.detail || "Failed to approve request.", "error");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      await api.post(`/api/v1/onboarding/requests/${id}/reject`);
      if (showToast) {
        showToast("Onboarding request rejected.", "info");
      }
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
      if (showToast) {
        showToast("Failed to reject request.", "error");
      }
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Widget Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "rgba(245, 158, 11, 0.15)",
                color: "#D97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserCheck size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                User Employee Requests
              </Typography>
              <Typography variant="caption" color="#64748B">
                Approve new users to grant Employee status
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${requests.length} Pending`}
            size="small"
            sx={{
              bgcolor: requests.length > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
              color: requests.length > 0 ? "#D97706" : "#15803D",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Content Body */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : requests.length === 0 ? (
          <Box
            p={3}
            borderRadius="16px"
            textAlign="center"
            sx={{ bgcolor: "#F1F5F9", border: "1px dashed #CBD5E1", my: "auto" }}
          >
            <CheckCircle2 size={36} color="#15803D" style={{ marginBottom: 8 }} />
            <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
              No Pending User Requests
            </Typography>
            <Typography variant="caption" color="#64748B" display="block" mb={2}>
              All new user onboarding applications have been reviewed.
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowRight size={16} />}
              onClick={() => navigate("/employees")}
              sx={{ textTransform: "none", fontWeight: 700, color: "#0288D1" }}
            >
              View Employee Directory
            </Button>
          </Box>
        ) : (
          <Stack
            spacing={2}
            sx={{
              overflowY: "auto",
              maxHeight: 380,
              pr: 0.8,
              "&::-webkit-scrollbar": { width: "5px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "4px" },
            }}
          >
            {requests.map((req) => (
              <Box
                key={req._id}
                p={2}
                borderRadius="16px"
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "#CBD5E1",
                    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
                  },
                }}
              >
                {/* User Info Line */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        bgcolor: "#2E7D32",
                        width: 34,
                        height: 34,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                      }}
                    >
                      {(req.username || req.email || "U").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                        {req.username || "New User"}
                      </Typography>
                      <Typography variant="caption" color="#64748B" display="block">
                        {req.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={req.department || "Engineering"}
                    size="small"
                    sx={{ bgcolor: "rgba(37, 99, 235, 0.1)", color: "#1D4ED8", fontWeight: 600, fontSize: "0.7rem" }}
                  />
                </Box>

                {/* Job Title & Date */}
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} mb={1.5} px={0.5}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="caption" color="#475569" fontWeight={600}>
                      Target Role:
                    </Typography>
                    <Chip
                      label={req.job_title || "Staff"}
                      size="small"
                      sx={{
                        bgcolor: "rgba(16, 185, 129, 0.12)",
                        color: "#059669",
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        height: 22,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="#94A3B8" sx={{ fontSize: "0.72rem" }}>
                    {req.submitted_at || "Recent"}
                  </Typography>
                </Box>

                {/* Optional Message */}
                {req.message && (
                  <Typography
                    variant="caption"
                    color="#475569"
                    sx={{
                      display: "block",
                      fontStyle: "italic",
                      bgcolor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      p: 1,
                      borderRadius: "8px",
                      mb: 1.5,
                      fontSize: "0.73rem",
                    }}
                  >
                    "{req.message}"
                  </Typography>
                )}

                {/* Action Buttons Side-by-Side */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap" }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    disabled={processingId === req._id}
                    startIcon={<CheckCircle2 size={15} />}
                    onClick={() => handleApprove(req._id)}
                    sx={{
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "0.78rem",
                      py: 0.7,
                      px: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                      },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    disabled={processingId === req._id}
                    startIcon={<XCircle size={15} />}
                    onClick={() => handleReject(req._id)}
                    sx={{
                      borderRadius: "12px",
                      color: "#EF4444",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "0.78rem",
                      py: 0.7,
                      px: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "rgba(239, 68, 68, 0.08)",
                        borderColor: "#EF4444",
                      },
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
