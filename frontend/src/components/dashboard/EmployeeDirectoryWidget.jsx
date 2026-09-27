import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  Paper,
  Stack,
} from "@mui/material";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Briefcase,
  Building,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function EmployeeDirectoryWidget({ showToast }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/api/v1/employees");
      const data = response.data.employees || response.data || [];
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees from database:", err);
      setError("Failed to fetch employee records from the database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const fullName = emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim();
    const query = searchQuery.toLowerCase();
    return (
      fullName.toLowerCase().includes(query) ||
      (emp.email && emp.email.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query)) ||
      (emp.designation && emp.designation.toLowerCase().includes(query)) ||
      (emp.employee_id && emp.employee_id.toLowerCase().includes(query))
    );
  });

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "24px",
        border: "1px solid #E4E4E7",
        background: "#FFFFFF",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={22} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontWeight={900} color="#09090B">
                  Staff Directory & Database
                </Typography>
                <Chip
                  label={`${employees.length} Members`}
                  size="small"
                  sx={{
                    bgcolor: "#F4F4F5",
                    color: "#27272A",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                  }}
                />
              </Stack>
              <Typography variant="caption" color="#64748B">
                Fetched live from database (`/api/v1/employees`)
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchEmployees}
              startIcon={<RefreshCw size={14} className={loading ? "spin-animation" : ""} />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                color: "#EA580C",
                borderColor: "rgba(59, 130, 246, 0.4)",
                "&:hover": { bgcolor: "rgba(59, 130, 246, 0.08)" },
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate("/employees")}
              endIcon={<ExternalLink size={14} />}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                background: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                color: "#FFFFFF",
              }}
            >
              Full Page
            </Button>
          </Stack>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search by Name, Role, Department, or Email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color="#64748B" />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            mb: 3,
            "& .MuiOutlinedInput-root": {
              borderRadius: "14px",
              bgcolor: "#FFFFFF",
              "&:hover fieldset": { borderColor: "#EA580C" },
              "&.Mui-focused fieldset": { borderColor: "#C2410C" },
            },
          }}
        />

        {/* Body Content */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
            <CircularProgress size={32} sx={{ color: "#EA580C" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: "14px" }}>
            {error}
          </Alert>
        ) : filteredEmployees.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px dashed #CBD5E1",
            }}
          >
            <Typography variant="subtitle2" color="#64748B" mb={1}>
              No employees found in the database.
            </Typography>
            <Typography variant="caption" color="#94A3B8">
              {searchQuery ? "Try refining your search query." : "Approve onboarding requests to populate active staff."}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {filteredEmployees.map((emp) => {
              const displayName = emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee";
              const initial = displayName.charAt(0).toUpperCase();

              return (
                <Grid item xs={12} sm={6} md={4} key={emp._id || emp.employee_id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.2,
                      borderRadius: "18px",
                      border: "1px solid #E2E8F0",
                      bgcolor: "#FFFFFF",
                      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.03)",
                      transition: "all 0.25s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 8px 22px rgba(249, 115, 22, 0.12)",
                        borderColor: "#93C5FD",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 42,
                            height: 42,
                            background: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
                            color: "#FFFFFF",
                            fontWeight: 800,
                            fontSize: "1rem",
                            boxShadow: "0 4px 12px rgba(249, 115, 22, 0.25)",
                          }}
                        >
                          {initial}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                            {displayName}
                          </Typography>
                          <Typography variant="caption" color="#64748B" display="block" sx={{ fontSize: "0.72rem" }}>
                            ID: {emp.employee_id || "N/A"}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={emp.employment_status || "Active"}
                        size="small"
                        sx={{
                          bgcolor: emp.employment_status === "Inactive" ? "#FEE2E2" : "#E6F4EA",
                          color: emp.employment_status === "Inactive" ? "#DC2626" : "#EA580C",
                          fontWeight: 700,
                          fontSize: "0.68rem",
                          height: 22,
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Briefcase size={14} color="#EA580C" />
                        <Typography variant="caption" color="#334155" fontWeight={600}>
                          {emp.designation || emp.role || "Staff Member"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Building size={14} color="#64748B" />
                        <Typography variant="caption" color="#64748B">
                          {emp.department || "General"}
                        </Typography>
                      </Box>

                      {emp.email && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Mail size={14} color="#94A3B8" />
                          <Typography variant="caption" color="#64748B" noWrap>
                            {emp.email}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
