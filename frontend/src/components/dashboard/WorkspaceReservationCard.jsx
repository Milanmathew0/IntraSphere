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
  Paper,
  Avatar,
  MenuItem,
  TextField,
} from "@mui/material";
import PhoneInTalkIcon from "@mui/icons-material/PhoneInTalk";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import EventSeatIcon from "@mui/icons-material/EventSeat";

export function WorkspaceReservationCard() {
  const [selectedBooth, setSelectedBooth] = useState("booth-1");
  const [timeSlot, setTimeSlot] = useState("11:00 AM - 12:00 PM");

  const booths = [
    {
      id: "booth-1",
      name: "Silent Call Pod #A4",
      type: "Private Phone Booth",
      soundproof: "100% Soundproof",
      equipment: "High-speed Ethernet, Ergonomic Chair",
      location: "Zone B (Quiet Floor)",
    },
    {
      id: "booth-2",
      name: "Focus Workspace Studio #09",
      type: "Private Office Room",
      soundproof: "Acoustic Shielding",
      equipment: "4K Dual Monitors, Standing Desk",
      location: "Zone A (Executive)",
    },
    {
      id: "booth-3",
      name: "Client Call Suite #C2",
      type: "Private Video Booth",
      soundproof: "Noise-Cancelling Studio",
      equipment: "Ring Light, HD Webcam, Studio Mic",
      location: "Zone C (Media Wing)",
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
            <Avatar sx={{ bgcolor: "#E0F7FA", color: "#00ACC1", width: 42, height: 42 }}>
              <PhoneInTalkIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1E293B">
                Workspace & Desk Reservation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Book Private Call Booths & Focus Rooms
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<VolumeOffIcon fontSize="small" />}
            label="Quiet Zone"
            color="secondary"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Select Private Space"
              value={selectedBooth}
              onChange={(e) => setSelectedBooth(e.target.value)}
            >
              {booths.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              size="small"
              label="Select Time Slot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
            >
              <MenuItem value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</MenuItem>
              <MenuItem value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</MenuItem>
              <MenuItem value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</MenuItem>
              <MenuItem value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Space Preview */}
        {booths
          .filter((b) => b.id === selectedBooth)
          .map((booth) => (
            <Paper
              key={booth.id}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                mb: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="bold" color="#0F172A">
                  {booth.name}
                </Typography>
                <Chip size="small" label={booth.soundproof} color="info" variant="outlined" />
              </Stack>
              <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                📍 Location: {booth.location} • Type: {booth.type}
              </Typography>
              <Typography variant="body2" color="#334155" fontWeight="500">
                ✨ Amenities: {booth.equipment}
              </Typography>
            </Paper>
          ))}

        <Button
          variant="contained"
          color="secondary"
          fullWidth
          size="large"
          startIcon={<HeadsetMicIcon />}
          sx={{ py: 1.3, fontWeight: 700 }}
        >
          Reserve Private Workspace
        </Button>
      </CardContent>
    </Card>
  );
}

export default WorkspaceReservationCard;
