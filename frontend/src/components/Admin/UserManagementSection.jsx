import React from "react";
import { Paper, Box, Typography, Button, Stack, Chip, Grid, Skeleton } from "@mui/material";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

export default function UserManagementSection({ data, loading, onOpenManageUsers }) {
  const users = data?.users || {};
  const roles = users.roles || {};

  const roleList = [
    { name: "Admin", count: roles.Admin ?? 0, color: "#7B1FA2", bg: "#F3E5F5" },
    { name: "Manager", count: roles.Manager ?? 0, color: "#F97316", bg: "#FFF7ED" },
    { name: "HR", count: roles.HR ?? 0, color: "#C2185B", bg: "#FCE4EC" },
    { name: "Employee", count: roles.Employee ?? 0, color: "#2E7D32", bg: "#E8F5E9" },
    { name: "Facility Manager", count: roles["Facility Manager"] ?? 0, color: "#00796B", bg: "#E0F2F1" },
    { name: "User", count: roles.User ?? 0, color: "#ED6C02", bg: "#FFF3E0" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#F3E5F5",
                color: "#7B1FA2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SupervisorAccountIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              User & Role Management
            </Typography>
          </Stack>

          <Chip
            label={`${users.total || 0} Total System Users`}
            size="small"
            sx={{ bgcolor: "#FFF7ED", color: "#F97316", fontWeight: 700 }}
          />
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        ) : (
          <Grid container spacing={1.5} sx={{ my: 1 }}>
            {roleList.map((r, idx) => (
              <Grid item xs={6} sm={4} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: r.bg,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" fontWeight={700} color="#1E293B">
                    {r.name}
                  </Typography>
                  <Chip label={r.count} size="small" sx={{ bgcolor: r.color, color: "#FFFFFF", fontWeight: 800 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ManageAccountsIcon />}
            onClick={onOpenManageUsers}
            sx={{
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              py: 1.2,
            }}
          >
            Manage Users
          </Button>

          <Button
            variant="outlined"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={onOpenManageUsers}
            sx={{
              borderColor: "#F97316",
              color: "#F97316",
              "&:hover": { bgcolor: "#FFF7ED" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              py: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            Manage Roles
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
