import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Divider,
  Stack,
  CircularProgress,
  IconButton,
} from "@mui/material";
import {
  X,
  Building,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Accessibility,
  CalendarCheck,
  ShieldCheck,
  Wrench,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";

export default function DeskDetailsModal({ open, onClose, desk, onReserve }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && desk?.id) {
      fetchDeskDetails(desk.id);
    }
  }, [open, desk]);

  const fetchDeskDetails = async (deskId) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/v1/workspaces/${deskId}`);
      setDetails(res.data);
    } catch (err) {
      console.error("Error fetching desk details:", err);
      setDetails(desk); // Fallback to passed desk prop
    } finally {
      setLoading(false);
    }
  };

  if (!desk) return null;
  const activeData = details || desk;
  const isAvailable = activeData.current_status === "Available Now" || activeData.status === "Available";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth paperProps={{ sx: { borderRadius: "20px" } }}>
      {/* Title Bar */}
      <DialogTitle sx={{ m: 0, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip label={activeData.desk_code} sx={{ bgcolor: "#09090B", color: "#FFFFFF", fontWeight: 800 }} />
          <Typography variant="h6" fontWeight={800} color="#09090B">
            {activeData.desk_name}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#71717A" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={36} sx={{ color: "#1976D2" }} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Status & Location Summary */}
            <Box
              sx={{
                p: 2,
                borderRadius: "14px",
                bgcolor: "#F4F4F5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#09090B">
                  {activeData.building} • Floor {activeData.floor}
                </Typography>
                <Typography variant="caption" color="#52525B" fontWeight={500}>
                  Zone: {activeData.zone} ({activeData.location})
                </Typography>
              </Box>
              <Chip
                label={activeData.current_status || activeData.status}
                color={isAvailable ? "success" : activeData.status === "Maintenance" ? "warning" : "info"}
                sx={{ fontWeight: 800 }}
              />
            </Box>

            {/* Description */}
            {activeData.description && (
              <Box>
                <Typography variant="caption" fontWeight={700} color="#71717A" gutterBottom display="block">
                  ABOUT THIS WORKSPACE
                </Typography>
                <Typography variant="body2" color="#3F3F46" sx={{ lineHeight: 1.6 }}>
                  {activeData.description}
                </Typography>
              </Box>
            )}

            {/* Facilities Checklist */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="#71717A" gutterBottom display="block">
                INCLUDED FACILITIES & FEATURES
              </Typography>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {activeData.facilities && activeData.facilities.length > 0 ? (
                  activeData.facilities.map((fac, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircle2 size={16} color="#1976D2" />
                        <Typography variant="body2" fontWeight={600} color="#27272A">
                          {fac}
                        </Typography>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="#71717A">
                      Standard hot desk configuration
                    </Typography>
                  </Grid>
                )}

                {activeData.is_accessible && (
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Accessibility size={16} color="#1976D2" />
                      <Typography variant="body2" fontWeight={700} color="#1976D2">
                        Wheelchair Accessible
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Today's Schedule */}
            <Box>
              <Typography variant="caption" fontWeight={700} color="#71717A" gutterBottom display="block">
                TODAY'S RESERVATION SCHEDULE
              </Typography>

              {activeData.today_schedule && activeData.today_schedule.length > 0 ? (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {activeData.today_schedule.map((sched, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        bgcolor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Clock size={16} color="#1D4ED8" />
                        <Typography variant="body2" fontWeight={700} color="#1E40AF">
                          {new Date(sched.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" - "}
                          {new Date(sched.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                      </Box>
                      <Chip label={sched.purpose || "Reserved"} size="small" sx={{ bgcolor: "#DBEAFE", color: "#1E40AF", fontWeight: 700 }} />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    bgcolor: "#F0FDF4",
                    border: "1px dashed #86EFAC",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mt: 1,
                  }}
                >
                  <CheckCircle2 size={18} color="#16A34A" />
                  <Typography variant="body2" color="#15803D" fontWeight={600}>
                    No reservations scheduled for today. Desk is available for booking!
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
          Close
        </Button>

        <Button
          variant="contained"
          disabled={!isAvailable}
          onClick={() => {
            onClose();
            if (onReserve) onReserve(activeData);
          }}
          startIcon={<CalendarCheck size={18} />}
          sx={{
            bgcolor: "#1976D2",
            color: "#FFFFFF",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: "10px",
            boxShadow: "none",
            "&:hover": { bgcolor: "#1565C0" },
          }}
        >
          Reserve Desk
        </Button>
      </DialogActions>
    </Dialog>
  );
}
