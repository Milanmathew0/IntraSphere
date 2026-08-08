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
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import SendIcon from "@mui/icons-material/Send";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

export function LeaveApplicationCard() {
  const [leaveType, setLeaveType] = useState("annual");
  const [startDate, setStartDate] = useState("2026-08-10");
  const [endDate, setEndDate] = useState("2026-08-12");
  const [reason, setReason] = useState("Family vacation & personal time.");

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
            <Avatar sx={{ bgcolor: "#F3E5F5", color: "#8E24AA", width: 42, height: 42 }}>
              <EventBusyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="#1E293B">
                Leave Application
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submit requests for HR Administrator approval
              </Typography>
            </Box>
          </Box>
          <Chip label="14 Days Available" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
        </Stack>

        {/* Balance Counter Bar */}
        <Grid container spacing={1.5} mb={3}>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Annual
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="#1976D2">
                12 Days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Casual
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="#2E7D32">
                4 Days
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Sick
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="#D32F2F">
                6 Days
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Stack spacing={2} mb={3}>
          <TextField
            select
            fullWidth
            size="small"
            label="Leave Type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
          >
            <MenuItem value="annual">Annual Leave</MenuItem>
            <MenuItem value="casual">Casual Leave</MenuItem>
            <MenuItem value="sick">Sick / Medical Leave</MenuItem>
            <MenuItem value="unpaid">Unpaid Leave</MenuItem>
          </TextField>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <TextField
            fullWidth
            multiline
            rows={2}
            size="small"
            label="Reason for Leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Stack>

        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<SendIcon />}
          sx={{
            py: 1.2,
            fontWeight: 700,
            background: "linear-gradient(135deg, #8E24AA 0%, #6A1B9A 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #AB47BC 0%, #8E24AA 100%)",
            },
          }}
        >
          Submit Request for HR Approval
        </Button>

        <Divider sx={{ my: 2.5 }} />

        {/* Recent Leave Requests Status */}
        <Typography variant="caption" color="text.secondary" fontWeight="bold" display="block" mb={1}>
          RECENT REQUEST STATUS
        </Typography>
        <Paper elevation={0} sx={{ p: 1.5, border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#FAFAFA" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" fontWeight="600" color="#1E293B">
                Casual Leave (1 Day)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Aug 05, 2026
              </Typography>
            </Box>
            <Chip
              icon={<PendingActionsIcon fontSize="small" />}
              label="Pending HR Approval"
              color="warning"
              size="small"
              sx={{ fontWeight: 600, fontSize: "0.75rem" }}
            />
          </Stack>
        </Paper>
      </CardContent>
    </Card>
  );
}

export default LeaveApplicationCard;
