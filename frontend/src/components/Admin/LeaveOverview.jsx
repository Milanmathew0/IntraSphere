import React from "react";
import { Paper, Box, Typography, Button, Stack, Chip, List, ListItem, ListItemText, Skeleton, Grid } from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

export default function LeaveOverview({ data, loading }) {
  const navigate = useNavigate();
  const lv = data?.leave || {};
  const pendingList = lv.pending_list || [];

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
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#FFEBEE",
              color: "#D32F2F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EventBusyIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Leave Requests Overview
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton variant="rectangular" height={160} sx={{ borderRadius: 2 }} />
        ) : (
          <>
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 1.2, textAlign: "center", bgcolor: "#FFF3E0", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Pending
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#ED6C02">
                    {lv.pending ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 1.2, textAlign: "center", bgcolor: "#E8F5E9", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Approved
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#2E7D32">
                    {lv.approved_today ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 1.2, textAlign: "center", bgcolor: "#FFEBEE", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Rejected
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#D32F2F">
                    {lv.rejected_today ?? 0}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper elevation={0} sx={{ p: 1.2, textAlign: "center", bgcolor: "#E0F7FA", borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    On Leave
                  </Typography>
                  <Typography variant="h6" fontWeight={800} color="#047857">
                    {lv.currently_on_leave ?? 0}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={1}>
              Recent Pending Requests
            </Typography>

            {pendingList.length === 0 ? (
              <Box sx={{ py: 2, textAlign: "center", bgcolor: "#F8FAFC", borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No pending leave requests.
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {pendingList.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{
                      px: 2,
                      py: 1,
                      mb: 1,
                      bgcolor: "#F8FAFC",
                      borderRadius: 2,
                      border: "1px solid #F1F5F9",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={700} color="#0F172A">
                          {item.employee_name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {item.leave_type} · {item.dates}
                        </Typography>
                      }
                    />
                    <Chip label="Pending" size="small" sx={{ bgcolor: "#FFF3E0", color: "#ED6C02", fontWeight: 700 }} />
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/leave")}
          sx={{
            bgcolor: "#10B981",
            "&:hover": { bgcolor: "#059669" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.2,
          }}
        >
          View Leave Management
        </Button>
      </Box>
    </Paper>
  );
}
