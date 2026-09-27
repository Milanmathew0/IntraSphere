import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Snackbar,
  Stack,
} from "@mui/material";
import { Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/layout/AppLayout";
import EmployeeGrid from "../components/Employee/EmployeeGrid";
import api from "../api/axios";
import AddEmployeeModal from "../components/Employee/AddEmployeeModal";

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

  if (loading) {
    return (
      <AppLayout activeTabOverride="employees">
        <Box display="flex" justifyContent="center" alignItems="center" py={12}>
          <CircularProgress size={40} sx={{ color: "#F97316" }} />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTabOverride="employees">
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header Bar */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          mb={3.5}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
              Employee Directory & Workforce
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.25}>
              Oversee active workforce records, process onboarding requests, and manage roles.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              icon={<Users size={16} color="#F97316" />}
              label={`${employees.length} Active Staff`}
              sx={{
                bgcolor: "#FFF7ED",
                color: "#C2410C",
                fontWeight: 700,
                fontSize: "0.82rem",
                borderRadius: "8px",
                border: "1px solid #FFEDD5",
                py: 1.8,
              }}
            />
            <Button
              variant="contained"
              startIcon={<UserPlus size={18} />}
              onClick={() => setIsAddModalOpen(true)}
              sx={{
                bgcolor: "#F97316",
                color: "#FFFFFF",
                fontWeight: 700,
                borderRadius: "10px",
                textTransform: "none",
                px: 2.5,
                py: 1,
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                "&:hover": {
                  bgcolor: "#EA580C",
                },
              }}
            >
              Add Employee
            </Button>
          </Stack>
        </Box>

        {/* Modal for adding employee */}
        <AddEmployeeModal
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            fetchEmployees();
            showToast("Employee added successfully!");
          }}
        />

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        {/* Directory Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
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
    </AppLayout>
  );
}
