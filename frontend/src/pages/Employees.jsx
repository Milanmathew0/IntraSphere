import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
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
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import EmployeeGrid from "../components/Employee/EmployeeGrid";
import api from "../api/axios";
import AddEmployeeModal from "../components/Employee/AddEmployeeModal";
import UserProfileHeader from "../components/dashboard/UserProfileHeader";

export default function Employees() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  if (loading)
    return (
      <CircularProgress
        sx={{ display: "block", mx: "auto", mt: 6, color: "#10B981" }}
      />
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F4F6F0",
        fontFamily: "'Inter', sans-serif",
        pb: 6,
      }}
    >
      {/* Top Deep Forest Emerald Header Banner */}
      <Box
        sx={{
          background:
            "linear-gradient(135deg, #022C22 0%, #064E3B 55%, #047857 100%)",
          color: "#FFFFFF",
          pt: 3,
          pb: 6,
          px: { xs: 2, sm: 4, md: 6 },
          boxShadow: "0 10px 30px rgba(2, 44, 34, 0.25)",
          mb: -3,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={900}
              letterSpacing={-0.5}
              color="#FFFFFF"
            >
              Employee & Onboarding Directory
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.8)", mt: 0.5 }}
            >
              Oversee active workforce records, process incoming onboarding
              access requests, and manage company roles.
            </Typography>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Chip
              icon={<Users size={16} color="#10B981" />}
              label={`${employees.length} Active Staff`}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.15)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.88rem",
                py: 2,
                px: 1,
                borderRadius: "50px",
                border: "1px solid rgba(255, 255, 255, 0.25)",
              }}
            />
            <Button
              variant="contained"
              onClick={() => setIsAddModalOpen(true)}
              sx={{
                bgcolor: "#10B981",
                color: "white",
                fontWeight: "bold",
                borderRadius: "50px",
                "&:hover": {
                  bgcolor: "#059669",
                },
              }}
            >
              Add Employee
            </Button>
            <UserProfileHeader
              user={user}
              onLogout={() => {
                logout();
                navigate("/login");
              }}
            />
          </Box>
        </Box>
      </Box>

      <AddEmployeeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchEmployees}
      />

      <Box
        sx={{ px: { xs: 2, sm: 4, md: 6 }, position: "relative", zIndex: 5 }}
      >
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Active Employees Directory */}
        <Paper
          sx={{
            p: 2,
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <EmployeeGrid employees={employees} />
        </Paper>

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
    </Box>
  );
}
