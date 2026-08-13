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
        border: "1px solid #E4E4E7",
        borderRadius: 4,
        background: "#FFFFFF",
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "#09090B", color: "#FFFFFF", width: 42, height: 42 }}>
              <PhoneInTalkIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="900" color="#09090B">
                Workspace & Desk Reservation
              </Typography>
              <Typography variant="caption" color="#71717A">
                Book Private Call Booths & Focus Rooms
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<VolumeOffIcon fontSize="small" style={{ color: "#FFFFFF" }} />}
            label="Quiet Zone"
            sx={{
              fontWeight: 700,
              bgcolor: "#09090B",
              color: "#FFFFFF",
              "& .MuiChip-icon": { color: "#FFFFFF" }
            }}
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
                bgcolor: "#FAFAFA",
                border: "1px solid #E4E4E7",
                mb: 3,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight="800" color="#09090B">
                  {booth.name}
                </Typography>
                <Chip
                  size="small"
                  label={booth.soundproof}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "#F4F4F5",
                    color: "#09090B",
                    border: "1px solid #E4E4E7"
                  }}
                />
              </Stack>
              <Typography variant="caption" color="#71717A" display="block" mb={1}>
                📍 Location: {booth.location} • Type: {booth.type}
              </Typography>
              <Typography variant="body2" color="#09090B" fontWeight="600">
                ✨ Amenities: {booth.equipment}
              </Typography>
            </Paper>
          ))}

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<HeadsetMicIcon />}
          sx={{
            py: 1.3,
            fontWeight: 800,
            bgcolor: "#09090B",
            color: "#FFFFFF",
            "&:hover": { bgcolor: "#27272A" }
          }}
        >
          Reserve Private Workspace
        </Button>
      </CardContent>
    </Card>
  );
}

export default WorkspaceReservationCard;
