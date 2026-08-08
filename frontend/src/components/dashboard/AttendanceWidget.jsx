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
  Divider,
  Avatar,
  Paper,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

export function AttendanceWidget() {
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",
        borderRadius: 4,
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "#E3F2FD", color: "#1976D2", width: 42, height: 42 }}>
              <AccessTimeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1E293B">
                Daily Attendance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Manual Office Check-in / Check-out
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<CheckCircleOutlinedIcon fontSize="small" />}
            label={isCheckedIn ? "Checked In" : "Checked Out"}
            color={isCheckedIn ? "success" : "default"}
            sx={{ fontWeight: 600, px: 1 }}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: "#F1F5F9",
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            mb: 3,
          }}
        >
          <Grid container spacing={2} textAlign="center">
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary" display="block">
                Check In
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="#0F172A">
                09:15 AM
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ borderLeft: "1px solid #CBD5E1", borderRight: "1px solid #CBD5E1" }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Check Out
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="#0F172A">
                --:-- PM
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="text.secondary" display="block">
                Logged Hours
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="#1976D2">
                5h 42m
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant={isCheckedIn ? "contained" : "outlined"}
            color="success"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => setIsCheckedIn(true)}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            Check In
          </Button>
          <Button
            variant={!isCheckedIn ? "contained" : "outlined"}
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={() => setIsCheckedIn(false)}
            sx={{ py: 1.2, fontWeight: 600 }}
          >
            Check Out
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <LocationOnOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Location:
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight="600" color="#334155">
              Main HQ - Floor 3
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <TimerOutlinedIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Standard Shift:
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight="600" color="#334155">
              09:00 AM - 06:00 PM
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default AttendanceWidget;
