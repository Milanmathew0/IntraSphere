import React from "react";
import {
  Grid,
  Paper,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddCircleOutlinedIcon from "@mui/icons-material/AddCircleOutlined";
import BuildIcon from "@mui/icons-material/Build";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import EventNoteIcon from "@mui/icons-material/EventNote";
import InsightsIcon from "@mui/icons-material/Insights";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function FacilityOverview({ stats, onNavigateTab, onOpenAddRoom, onOpenAddDesk, onOpenMaintenance }) {
  const summary = stats?.summary || {};
  const recentMaint = stats?.recent_maintenance || [];

  const quickActions = [
    { label: "Add Meeting Room", icon: AddCircleOutlinedIcon, color: "#F97316", onClick: onOpenAddRoom },
    { label: "Add Workspace Desk", icon: AddCircleOutlinedIcon, color: "#C2410C", onClick: onOpenAddDesk },
    { label: "Report Maintenance Issue", icon: BuildIcon, color: "#ED6C02", onClick: onOpenMaintenance },
    { label: "View All Reservations", icon: EventNoteIcon, color: "#7B1FA2", onClick: () => onNavigateTab(3) },
    { label: "Manage Meeting Rooms", icon: MeetingRoomIcon, color: "#2E7D32", onClick: () => onNavigateTab(1) },
    { label: "Manage Workspace Desks", icon: DesktopWindowsIcon, color: "#00796B", onClick: () => onNavigateTab(2) },
    { label: "View Maintenance Queue", icon: BuildIcon, color: "#D32F2F", onClick: () => onNavigateTab(4) },
    { label: "View Facility Analytics", icon: InsightsIcon, color: "#EA580C", onClick: () => onNavigateTab(5) },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {/* Left Column: Quick Actions Grid */}
      <Grid item xs={12} md={5}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            height: "100%",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1}>
            Quick Management Actions
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2.5}>
            Direct shortcuts for Facility Manager operational workflows.
          </Typography>

          <Grid container spacing={1.5}>
            {quickActions.map((act, idx) => {
              const ActionIcon = act.icon;
              return (
                <Grid item xs={12} sm={6} key={idx}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={act.onClick}
                    startIcon={<ActionIcon sx={{ color: act.color }} />}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      py: 1.2,
                      px: 1.5,
                      borderRadius: "10px",
                      borderColor: "#E2E8F0",
                      color: "#334155",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textTransform: "none",
                      bgcolor: "#F8FAFC",
                      "&:hover": {
                        bgcolor: "#FFFFFF",
                        borderColor: act.color,
                        boxShadow: `0 4px 12px ${act.color}20`,
                      },
                    }}
                  >
                    {act.label}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Grid>

      {/* Right Column: Maintenance & Resource Status Overview */}
      <Grid item xs={12} md={7}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
            height: "100%",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Recent Facility Maintenance Requests
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active issues reported for office rooms and desks.
              </Typography>
            </Box>

            <Button
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => onNavigateTab(4)}
              sx={{ textTransform: "none", fontWeight: 700, color: "#F97316" }}
            >
              View Queue
            </Button>
          </Stack>

          {recentMaint.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                bgcolor: "#F8FAFC",
                borderRadius: 2,
                border: "1px dashed #CBD5E1",
              }}
            >
              <BuildIcon sx={{ fontSize: 36, color: "#94A3B8", mb: 1 }} />
              <Typography variant="subtitle2" color="#64748B" fontWeight={600}>
                No Active Maintenance Issues
              </Typography>
              <Typography variant="caption" color="#94A3B8">
                All meeting rooms and workspace desks are currently in optimal condition.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ border: "1px solid #F1F5F9", borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Resource</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Issue Title</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentMaint.map((m) => (
                    <TableRow key={m._id} hover>
                      <TableCell sx={{ fontWeight: 600, color: "#1E293B", fontSize: "0.82rem" }}>
                        {m.resource_name}
                      </TableCell>
                      <TableCell sx={{ color: "#334155", fontSize: "0.82rem" }}>
                        {m.issue_title}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.priority}
                          size="small"
                          sx={{
                            height: 22,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            bgcolor:
                              m.priority === "Critical"
                                ? "#FFEBEE"
                                : m.priority === "High"
                                ? "#FFF3E0"
                                : "#FFF7ED",
                            color:
                              m.priority === "Critical"
                                ? "#C62828"
                                : m.priority === "High"
                                ? "#EF6C00"
                                : "#EA580C",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={m.status}
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 22,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            borderColor:
                              m.status === "In Progress"
                                ? "#C2410C"
                                : m.status === "Completed"
                                ? "#2E7D32"
                                : "#ED6C02",
                            color:
                              m.status === "In Progress"
                                ? "#C2410C"
                                : m.status === "Completed"
                                ? "#2E7D32"
                                : "#ED6C02",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
