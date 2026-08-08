import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Grid,
  Button,
  Chip,
  Avatar,
  Snackbar,
  Stack,
  Divider,
} from "@mui/material";
import {
  UserCheck,
  UserX,
  Users,
  Clock,
  Briefcase,
  Mail,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import EmployeeGrid from "../components/Employee/EmployeeGrid";
import api from "../api/axios";

export default function Employees() {
  const [activeTab, setActiveTab] = useState(0); // 0: Active Employees, 1: Pending Onboarding Requests
  const [employees, setEmployees] = useState([]);
  const [onboardingRequests, setOnboardingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Snackbar Toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (msg, severity = "success") => {
    setToast({ open: true, message: msg, severity });
  };

  useEffect(() => {
    fetchEmployees();
    fetchOnboardingRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/v1/employees");
      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchOnboardingRequests = async () => {
    try {
      const response = await api.get("/api/v1/onboarding/requests?status=pending");
      setOnboardingRequests(response.data.requests || []);
    } catch (err) {
      console.log("Error fetching onboarding requests", err);
    }
  };

  const handleApprove = async (requestId) => {
    setProcessingId(requestId);
    try {
      await api.post(`/api/v1/onboarding/requests/${requestId}/approve`);
      showToast("Employee application approved! Account upgraded to Employee.", "success");
      fetchOnboardingRequests();
      fetchEmployees();
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.detail || "Failed to approve request.",
        "error"
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingId(requestId);
    try {
      await api.post(`/api/v1/onboarding/requests/${requestId}/reject`);
      showToast("Onboarding request rejected.", "info");
      fetchOnboardingRequests();
    } catch (err) {
      console.error(err);
      showToast("Failed to reject request.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <CircularProgress sx={{ display: "block", mx: "auto", mt: 6 }} />;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="#0F172A">
            Employee & Onboarding Management
          </Typography>
          <Typography variant="body2" color="#64748B">
            Oversee active staff members and process incoming user employee access applications.
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: "16px", bgcolor: "#FFFFFF", p: 1, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              borderRadius: "12px",
              minHeight: 48,
            },
          }}
        >
          <Tab
            icon={<Users size={18} />}
            iconPosition="start"
            label={`Active Employees (${employees.length})`}
          />
          <Tab
            icon={
              <Badge badgeContent={onboardingRequests.length} color="error" sx={{ ml: 1 }}>
                <Clock size={18} />
              </Badge>
            }
            iconPosition="start"
            label="Pending Onboarding Requests"
          />
        </Tabs>
      </Paper>

      {/* Error Alert */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Tab 0: Active Employees Directory */}
      {activeTab === 0 && (
        <Paper sx={{ p: 2, borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
          <EmployeeGrid employees={employees} />
        </Paper>
      )}

      {/* Tab 1: Pending Onboarding Requests */}
      {activeTab === 1 && (
        <Box>
          {onboardingRequests.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: "16px", background: "rgba(255, 255, 255, 0.9)" }}>
              <CheckCircle2 size={48} color="#15803D" style={{ marginBottom: 12 }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                No Pending Onboarding Requests
              </Typography>
              <Typography variant="body2" color="#64748B" mt={0.5}>
                All new user applications have been processed.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {onboardingRequests.map((req) => (
                <Grid item xs={12} md={6} key={req._id}>
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: "20px",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                      border: "1px solid #E2E8F0",
                      transition: "transform 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 14px 36px rgba(15, 23, 42, 0.09)",
                      },
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            bgcolor: "#2E7D32",
                            width: 44,
                            height: 44,
                            fontWeight: 700,
                            color: "#FFFFFF",
                          }}
                        >
                          {(req.username || req.email || "U").charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                            {req.username || "Registered User"}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Mail size={14} color="#64748B" />
                            <Typography variant="caption" color="#64748B">
                              {req.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip
                        label="Pending Approval"
                        size="small"
                        sx={{
                          bgcolor: "rgba(245, 158, 11, 0.15)",
                          color: "#D97706",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#64748B" display="block">
                          Target Department
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {req.department || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#64748B" display="block">
                          Job Title / Position
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="#15803D">
                          {req.job_title || "N/A"}
                        </Typography>
                      </Grid>
                      {req.emp_code && (
                        <Grid item xs={6}>
                          <Typography variant="caption" color="#64748B" display="block">
                            Ref Employee Code
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="#2563EB">
                            {req.emp_code}
                          </Typography>
                        </Grid>
                      )}
                      <Grid item xs={6}>
                        <Typography variant="caption" color="#64748B" display="block">
                          Application Date
                        </Typography>
                        <Typography variant="caption" color="#334155" fontWeight={600}>
                          {req.submitted_at || "Recently"}
                        </Typography>
                      </Grid>
                    </Grid>

                    {req.message && (
                      <Box
                        p={1.5}
                        mb={2.5}
                        borderRadius="12px"
                        sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}
                      >
                        <Typography variant="caption" color="#64748B" fontWeight={700} display="block" mb={0.5}>
                          Note to HR:
                        </Typography>
                        <Typography variant="body2" color="#334155" sx={{ fontStyle: "italic" }}>
                          "{req.message}"
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box display="flex" gap={1.5} pt={1}>
                      <Button
                        variant="contained"
                        fullWidth
                        disabled={processingId === req._id}
                        startIcon={<CheckCircle2 size={18} />}
                        onClick={() => handleApprove(req._id)}
                        sx={{
                          borderRadius: "12px",
                          bgcolor: "#2E7D32",
                          fontWeight: 700,
                          textTransform: "none",
                          "&:hover": { bgcolor: "#15803D" },
                        }}
                      >
                        Approve Employee
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled={processingId === req._id}
                        startIcon={<XCircle size={18} />}
                        onClick={() => handleReject(req._id)}
                        sx={{
                          borderRadius: "12px",
                          color: "#DC2626",
                          borderColor: "rgba(220, 38, 38, 0.4)",
                          fontWeight: 700,
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "rgba(220, 38, 38, 0.08)",
                            borderColor: "#DC2626",
                          },
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Toast Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
