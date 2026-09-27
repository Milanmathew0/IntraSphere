import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  LinearProgress,
  CircularProgress,
  IconButton,
  Divider,
  Stack,
} from "@mui/material";
import { X, BarChart3, TrendingUp, Calendar, Layers, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";

export default function WorkspaceAnalyticsModal({ open, onClose }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchAnalytics();
    }
  }, [open]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/workspaces/analytics");
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error fetching workspace analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth paperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle sx={{ m: 0, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <BarChart3 size={22} color="#F97316" />
          <Typography variant="h6" fontWeight={800} color="#09090B">
            Workspace Utilization Analytics
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#71717A" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={36} sx={{ color: "#F97316" }} />
          </Box>
        ) : !analytics ? (
          <Typography color="#71717A" textAlign="center" py={4}>
            Could not load workspace analytics.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {/* Top Metric Cards */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#FFF7ED", border: "1px solid #FFEDD5" }}>
                  <Typography variant="caption" fontWeight={700} color="#C2410C">
                    AVERAGE UTILIZATION (30 DAYS)
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#9A3412" sx={{ my: 0.5 }}>
                    {analytics.average_utilization_pct}%
                  </Typography>
                  <Typography variant="caption" color="#EA580C">
                    Based on office working hours (09:00–18:00)
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <Typography variant="caption" fontWeight={700} color="#15803D">
                    RESERVATIONS THIS WEEK
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#166534" sx={{ my: 0.5 }}>
                    {analytics.reservations_this_week}
                  </Typography>
                  <Typography variant="caption" color="#22C55E">
                    {analytics.reservations_today} reserved today
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: "14px", bgcolor: "#FAF5FF", border: "1px solid #E9D5FF" }}>
                  <Typography variant="caption" fontWeight={700} color="#7E22CE">
                    RESERVATIONS THIS MONTH
                  </Typography>
                  <Typography variant="h4" fontWeight={900} color="#6B21A8" sx={{ my: 0.5 }}>
                    {analytics.reservations_this_month}
                  </Typography>
                  <Typography variant="caption" color="#A855F7">
                    Across {analytics.total_desks} active hot desks
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Per Desk Utilization Table / List */}
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#09090B" gutterBottom>
                Desk-by-Desk Hot-Desking Utilization Rate
              </Typography>
              <Typography variant="caption" color="#71717A" display="block" sx={{ mb: 2 }}>
                Calculated strictly from real confirmed workspace reservation records over the past 30 days.
              </Typography>

              <Stack spacing={1.5}>
                {analytics.desk_utilization_list && analytics.desk_utilization_list.length > 0 ? (
                  analytics.desk_utilization_list.map((item) => (
                    <Paper
                      key={item.desk_id}
                      elevation={0}
                      sx={{ p: 2, borderRadius: "12px", border: "1px solid #E4E4E7", bgcolor: "#FFFFFF" }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={800} color="#09090B">
                            {item.desk_code} – {item.desk_name}
                          </Typography>
                          <Typography variant="caption" color="#71717A">
                            (Floor {item.floor} • {item.zone})
                          </Typography>
                        </Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#F97316">
                          {item.utilization_pct}% ({item.booked_hours_30d} hrs)
                        </Typography>
                      </Box>

                      <LinearProgress
                        variant="determinate"
                        value={item.utilization_pct}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#F4F4F5",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: item.utilization_pct > 75 ? "#16A34A" : item.utilization_pct > 40 ? "#F97316" : "#EAB308",
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body2" color="#71717A">
                    No desk utilization data available yet.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: "#09090B", color: "#FFFFFF", fontWeight: 700, borderRadius: "10px" }}>
          Close Analytics
        </Button>
      </DialogActions>
    </Dialog>
  );
}
