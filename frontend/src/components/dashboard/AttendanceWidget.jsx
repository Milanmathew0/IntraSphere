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
        border: "1px solid #E4E4E7",
        borderRadius: 4,
        background: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: "#09090B", color: "#FFFFFF", width: 42, height: 42 }}>
              <AccessTimeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="900" color="#09090B">
                Daily Attendance
              </Typography>
              <Typography variant="caption" color="#71717A">
                Manual Office Check-in / Check-out
              </Typography>
            </Box>
          </Box>
          <Chip
            icon={<CheckCircleOutlinedIcon fontSize="small" style={{ color: "#09090B" }} />}
            label={isCheckedIn ? "Checked In" : "Checked Out"}
            sx={{
              fontWeight: 700,
              px: 1,
              bgcolor: "#F4F4F5",
              color: "#09090B",
              border: "1px solid #E4E4E7"
            }}
          />
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            bgcolor: "#FAFAFA",
            borderRadius: 3,
            border: "1px solid #E4E4E7",
            mb: 3,
          }}
        >
          <Grid container spacing={2} textAlign="center">
            <Grid item xs={4}>
              <Typography variant="caption" color="#71717A" display="block">
                Check In
              </Typography>
              <Typography variant="subtitle1" fontWeight="800" color="#09090B">
                09:15 AM
              </Typography>
            </Grid>
            <Grid item xs={4} sx={{ borderLeft: "1px solid #E4E4E7", borderRight: "1px solid #E4E4E7" }}>
              <Typography variant="caption" color="#71717A" display="block">
                Check Out
              </Typography>
              <Typography variant="subtitle1" fontWeight="800" color="#09090B">
                --:-- PM
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="caption" color="#71717A" display="block">
                Logged Hours
              </Typography>
              <Typography variant="subtitle1" fontWeight="800" color="#09090B">
                5h 42m
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={() => setIsCheckedIn(true)}
            sx={{
              py: 1.2,
              fontWeight: 800,
              bgcolor: "#09090B",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#27272A" }
            }}
          >
            Check In
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={() => setIsCheckedIn(false)}
            sx={{
              py: 1.2,
              fontWeight: 800,
              borderColor: "#09090B",
              color: "#09090B",
              "&:hover": { bgcolor: "#F4F4F5", borderColor: "#09090B" }
            }}
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
