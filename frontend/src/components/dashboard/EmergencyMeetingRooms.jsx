import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Avatar,
  Paper,
  Tooltip,
} from "@mui/material";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import GroupsIcon from "@mui/icons-material/Groups";
import VideocamIcon from "@mui/icons-material/Videocam";
import TvIcon from "@mui/icons-material/Tv";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export function EmergencyMeetingRooms() {
  const [selectedRoom, setSelectedRoom] = useState("room-1");
  const [isEmergency, setIsEmergency] = useState(true);
  const [duration, setDuration] = useState("30");

  const rooms = [
    {
      id: "room-1",
      name: "Emergency War Room Alpha",
      capacity: "8 Persons",
      floor: "Floor 2 - West Wing",
      status: "Available Now",
      isInstant: true,
      features: ["AV Display", "Whiteboard", "High-Priority Priority Audio"],
    },
    {
      id: "room-2",
      name: "Executive Discussion Suite B",
      capacity: "12 Persons",
      floor: "Floor 4 - North",
      status: "Available Now",
      isInstant: false,
      features: ["4K Video Conf", "Smart Screen"],
    },
    {
      id: "room-3",
      name: "Rapid Huddle Pod 102",
      capacity: "4 Persons",
      floor: "Floor 3 - Central",
      status: "Reserved until 03:00 PM",
      isInstant: true,
      features: ["Quick Touch TV"],
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 4,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "#FFEBEE", color: "#D32F2F", width: 42, height: 42 }}>
              <MeetingRoomIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1E293B">
                Meeting Room Booking
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Emergency & Rapid Discussion Rooms
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<FlashOnIcon fontSize="small" />}
            label="Emergency Mode"
            color="error"
            variant={isEmergency ? "filled" : "outlined"}
            onClick={() => setIsEmergency(!isEmergency)}
            sx={{ fontWeight: 700, cursor: "pointer" }}
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Reserve available conference spaces instantly for critical syncs or team discussions.
        </Typography>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Select Room"
              size="small"
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              {rooms.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name} ({r.capacity})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Duration"
              size="small"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <MenuItem value="15">15 Minutes (Express)</MenuItem>
              <MenuItem value="30">30 Minutes (Standard Sync)</MenuItem>
              <MenuItem value="60">1 Hour (Extended)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Selected Room Details Preview */}
        {rooms
          .filter((r) => r.id === selectedRoom)
          .map((room) => (
            <Paper
              key={room.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                mb: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold" color="#0F172A">
                  {room.name}
                </Typography>
                <Chip
                  size="small"
                  label={room.status}
                  color={room.status.includes("Available") ? "success" : "warning"}
                  sx={{ fontWeight: 600 }}
                />
              </Stack>

              <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                📍 {room.floor} • Capacity: {room.capacity}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                {room.features.map((feat, idx) => (
                  <Chip
                    key={idx}
                    label={feat}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem", bgcolor: "#FFFFFF" }}
                  />
                ))}
              </Stack>
            </Paper>
          ))}

        <Button
          variant="contained"
          color={isEmergency ? "error" : "primary"}
          fullWidth
          size="large"
          startIcon={isEmergency ? <FlashOnIcon /> : <CheckCircleIcon />}
          sx={{ py: 1.3, fontWeight: 700 }}
        >
          {isEmergency ? "Instant Emergency Reservation" : "Reserve Selected Room"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default EmergencyMeetingRooms;
