import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Avatar,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

export function BookingHistoryTable() {
  const [tabValue, setTabValue] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const bookings = [
    {
      id: "RES-8921",
      resource: "Emergency War Room Alpha",
      type: "Meeting Room",
      date: "Aug 02, 2026",
      time: "02:00 PM - 03:00 PM",
      status: "Active",
      icon: <MeetingRoomIcon color="primary" fontSize="small" />,
    },
    {
      id: "RES-8890",
      resource: "Silent Call Pod #A4",
      type: "Private Phone Booth",
      date: "Aug 02, 2026",
      time: "10:30 AM - 11:30 AM",
      status: "Completed",
      icon: <PhoneInTalkIcon color="secondary" fontSize="small" />,
    },
    {
      id: "RES-8742",
      resource: "Executive Discussion Suite B",
      type: "Meeting Room",
      date: "Jul 29, 2026",
      time: "04:00 PM - 05:00 PM",
      status: "Completed",
      icon: <MeetingRoomIcon color="primary" fontSize="small" />,
    },
    {
      id: "RES-8611",
      resource: "Focus Workspace Studio #09",
      type: "Workspace Desk",
      date: "Jul 25, 2026",
      time: "09:00 AM - 01:00 PM",
      status: "Cancelled",
      icon: <PhoneInTalkIcon color="action" fontSize="small" />,
    },
  ];

  const filteredBookings = bookings.filter((b) => {
    const matchesTab =
      tabValue === "all" || b.status.toLowerCase() === tabValue.toLowerCase();
    const matchesQuery =
      b.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesQuery;
  });

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
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "#EDE7F6", color: "#673AB7", width: 42, height: 42 }}>
              <HistoryIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1E293B">
                Booking & Reservation History
              </Typography>
              <Typography variant="caption" color="text.secondary">
                View past & current meeting room and desk reservations
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={2} width={{ xs: "100%", md: "auto" }}>
            <TextField
              size="small"
              placeholder="Search reservations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: "100%", md: 240 } }}
            />
          </Stack>
        </Stack>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="all" label="All Reservations" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab value="active" label="Active" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab value="completed" label="Completed" sx={{ textTransform: "none", fontWeight: 600 }} />
            <Tab value="cancelled" label="Cancelled" sx={{ textTransform: "none", fontWeight: 600 }} />
          </Tabs>
        </Box>

        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #F1F5F9", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Booking ID</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Resource Name</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Date & Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((row) => (
                  <TableRow key={row.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell fontWeight="600">
                      <Typography variant="body2" fontWeight="600" color="#0F172A">
                        {row.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {row.icon}
                        <Typography variant="body2" fontWeight="600" color="#334155">
                          {row.resource}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.type} size="small" variant="outlined" sx={{ fontSize: "0.75rem" }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="#475569">
                        {row.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={
                          row.status === "Active"
                            ? "primary"
                            : row.status === "Completed"
                            ? "success"
                            : "default"
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {row.status === "Active" && (
                        <Tooltip title="Cancel Booking">
                          <IconButton size="small" color="error">
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No reservation history found matching your filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

export default BookingHistoryTable;
