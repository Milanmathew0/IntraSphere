import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Grid,
  TextField,
  Divider,
  Chip,
  Paper,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessIcon from "@mui/icons-material/Business";
import SaveIcon from "@mui/icons-material/Save";

export function EmployeeProfileSection() {
  const email = localStorage.getItem("email") || "employee@intrasphere.com";

  const [fullName, setFullName] = useState("Milan Mathew");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [department, setDepartment] = useState("Software Engineering");
  const [designation, setDesignation] = useState("Senior Full-Stack Developer");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileSave = () => {
    setSuccessMessage("Profile details updated successfully!");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handlePasswordUpdate = () => {
    setSuccessMessage("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 4,
        background: "#FFFFFF",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header section */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" mb={4}>
          <Box position="relative">
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "#1976D2",
                fontSize: "2.2rem",
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(25, 118, 210, 0.25)",
              }}
            >
              {fullName.charAt(0)}
            </Avatar>
            <Button
              size="small"
              variant="contained"
              color="primary"
              sx={{
                position: "absolute",
                bottom: -6,
                right: -6,
                minWidth: 32,
                width: 32,
                height: 32,
                borderRadius: "50%",
                p: 0,
              }}
            >
              <EditIcon fontSize="small" />
            </Button>
          </Box>

          <Box textAlign={{ xs: "center", sm: "left" }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "center", sm: "flex-start" }} mb={0.5}>
              <Typography variant="h5" fontWeight="bold" color="#0F172A">
                {fullName}
              </Typography>
              <Chip label="Active" color="success" size="small" sx={{ fontWeight: 600 }} />
            </Stack>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {designation} • {department}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Employee ID: EMP-2026-0489
            </Typography>
          </Box>
        </Stack>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Profile Information Form */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 3, mb: 4, bgcolor: "#F8FAFC" }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
            <BadgeIcon color="primary" />
            <Typography variant="h6" fontWeight="bold" color="#1E293B">
              Personal Information
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Email Address"
                value={email}
                disabled
                helperText="Email address is managed by domain admin"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Job Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box mt={3} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleProfileSave}
              sx={{ fontWeight: 600 }}
            >
              Save Profile Changes
            </Button>
          </Box>
        </Paper>

        {/* Security & Password Update Section */}
        <Paper elevation={0} sx={{ p: 3, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#F8FAFC" }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
            <LockResetIcon color="error" />
            <Typography variant="h6" fontWeight="bold" color="#1E293B">
              Security & Password
            </Typography>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                size="small"
                label="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                size="small"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="password"
                size="small"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box mt={3} textAlign="right">
            <Button
              variant="outlined"
              color="error"
              startIcon={<LockResetIcon />}
              onClick={handlePasswordUpdate}
              sx={{ fontWeight: 600 }}
            >
              Update Password
            </Button>
          </Box>
        </Paper>
      </CardContent>
    </Card>
  );
}

export default EmployeeProfileSection;
