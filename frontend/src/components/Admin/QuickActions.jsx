import React from "react";
import { Paper, Box, Typography, Grid, Button, Stack } from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MeetingRoomOutlinedIcon from "@mui/icons-material/MeetingRoomOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useNavigate } from "react-router-dom";

export default function QuickActions({ onOpenAddEmployee, onOpenManageUsers, onOpenReports }) {
  const navigate = useNavigate();

  const actions = [
    { label: "+ Add Employee", icon: PersonAddIcon, color: "#10B981", bg: "#ECFDF5", onClick: onOpenAddEmployee },
    { label: "Manage Employees", icon: PeopleIcon, color: "#2E7D32", bg: "#E8F5E9", onClick: () => navigate("/employees") },
    { label: "Manage Users", icon: ManageAccountsIcon, color: "#7B1FA2", bg: "#F3E5F5", onClick: onOpenManageUsers },
    { label: "Manage Departments", icon: BusinessIcon, color: "#00796B", bg: "#E0F2F1", onClick: () => navigate("/employees") },
    { label: "Manage Designations", icon: BadgeIcon, color: "#ED6C02", bg: "#FFF3E0", onClick: () => navigate("/employees") },
    { label: "Manage Leave", icon: EventBusyIcon, color: "#D32F2F", bg: "#FFEBEE", onClick: () => navigate("/leave") },
    { label: "Meeting Rooms", icon: MeetingRoomIcon, color: "#047857", bg: "#E0F7FA", onClick: () => navigate("/meeting-rooms") },
    { label: "Manage Rooms", icon: MeetingRoomOutlinedIcon, color: "#C2185B", bg: "#FCE4EC", onClick: () => navigate("/meeting-rooms") },
    { label: "View Attendance", icon: EventAvailableIcon, color: "#059669", bg: "#ECFDF5", onClick: () => navigate("/employees") },
    { label: "View Reports", icon: AssessmentIcon, color: "#455A64", bg: "#ECEFF1", onClick: onOpenReports },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        mb: 4,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2.5}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#FFF3E0",
            color: "#ED6C02",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FlashOnIcon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={700} color="#0F172A">
          Admin Quick Actions
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {actions.map((act, idx) => {
          const IconComp = act.icon;
          return (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<IconComp sx={{ color: act.color }} />}
                onClick={act.onClick}
                sx={{
                  borderColor: "#E2E8F0",
                  color: "#1E293B",
                  bgcolor: "#FAFAFA",
                  "&:hover": {
                    bgcolor: act.bg,
                    borderColor: act.color,
                    color: act.color,
                  },
                  borderRadius: 2.5,
                  py: 1.5,
                  px: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  justifyContent: "flex-start",
                }}
              >
                {act.label}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}
