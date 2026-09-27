import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from "@mui/material";
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Building,
  Layers,
  FileText,
} from "lucide-react";
import api from "../../api/axios";

export default function MyWorkspaceReservations({ refreshKey, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState(0); // 0: Upcoming, 1: Past, 2: Cancelled
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancel Dialog state
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const fetchMyReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/workspace-reservations/my/");
      setReservations(res.data || []);
    } catch (err) {
      console.error("Error fetching my reservations:", err);
      if (showToast) showToast("Failed to load your reservations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReservations();
  }, [refreshKey]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError("");

    try {
      await api.patch(`/api/v1/workspace-reservations/${cancelTarget.id}/cancel`);
      if (showToast) showToast("Reservation cancelled successfully!", "success");
      setCancelTarget(null);
      fetchMyReservations();
    } catch (err) {
      console.error("Cancel reservation failed:", err);
      const detail = err.response?.data?.detail || "Failed to cancel reservation.";
      setCancelError(detail);
    } finally {
      setCancelling(false);
    }
  };

  // Filter reservations based on subTab
  const upcomingReservations = reservations.filter((r) => r.status === "Confirmed");
  const pastReservations = reservations.filter((r) => r.status === "Completed");
  const cancelledReservations = reservations.filter((r) => r.status === "Cancelled");

  const getCurrentList = () => {
    if (activeSubTab === 0) return upcomingReservations;
    if (activeSubTab === 1) return pastReservations;
    return cancelledReservations;
  };

  const currentList = getCurrentList();

  return (
    <Box>
      {/* Sub Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeSubTab}
          onChange={(e, val) => setActiveSubTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            label={`Upcoming (${upcomingReservations.length})`}
            sx={{ fontWeight: 700, textTransform: "none", fontSize: "15px" }}
          />
          <Tab
            label={`Past History (${pastReservations.length})`}
            sx={{ fontWeight: 700, textTransform: "none", fontSize: "15px" }}
          />
          <Tab
            label={`Cancelled (${cancelledReservations.length})`}
            sx={{ fontWeight: 700, textTransform: "none", fontSize: "15px" }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={36} sx={{ color: "#F97316" }} />
        </Box>
      ) : currentList.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: "16px",
            border: "1px dashed #D4D4D8",
            bgcolor: "#FFFFFF",
          }}
        >
          <Typography variant="h6" fontWeight={700} color="#09090B" gutterBottom>
            No {activeSubTab === 0 ? "Upcoming" : activeSubTab === 1 ? "Past" : "Cancelled"} Reservations
          </Typography>
          <Typography variant="body2" color="#71717A">
            {activeSubTab === 0
              ? "You don't have any active desk reservations right now. Browse available desks to reserve one."
              : "No reservation records found in this category."}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {currentList.map((res) => {
            const isUpcoming = res.status === "Confirmed";

            return (
              <Grid item xs={12} md={6} key={res.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "16px",
                    border: "1px solid #E4E4E7",
                    bgcolor: "#FFFFFF",
                    transition: "all 0.2s ease",
                    "&:hover": { boxShadow: "0 8px 20px rgba(0,0,0,0.06)" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Chip
                          label={res.desk_code}
                          size="small"
                          sx={{ bgcolor: "#09090B", color: "#FFFFFF", fontWeight: 800, fontSize: "11px" }}
                        />
                        <Typography variant="subtitle1" fontWeight={800} color="#09090B">
                          {res.desk_name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="#52525B" fontWeight={600}>
                        Floor {res.floor} • {res.zone} ({res.building})
                      </Typography>
                    </Box>

                    <Chip
                      label={res.status}
                      color={isUpcoming ? "success" : res.status === "Completed" ? "default" : "error"}
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Timing & Date */}
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#F97316" }}>
                      <Calendar size={16} />
                      <Typography variant="body2" fontWeight={700}>
                        {res.date}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#3F3F46" }}>
                      <Clock size={16} />
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(res.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {" – "}
                        {new Date(res.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Typography>
                    </Box>

                    {res.purpose && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#71717A" }}>
                        <FileText size={16} />
                        <Typography variant="caption" fontWeight={500}>
                          Purpose: {res.purpose}
                        </Typography>
                      </Box>
                    )}
                  </Stack>

                  {/* Actions */}
                  {isUpcoming && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setCancelTarget(res)}
                        startIcon={<XCircle size={16} />}
                        sx={{
                          borderRadius: "10px",
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Cancel Reservation
                      </Button>
                    </Box>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)} paperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel Workspace Reservation?</DialogTitle>
        <DialogContent>
          {cancelError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
              {cancelError}
            </Alert>
          )}
          <Typography variant="body2" color="#3F3F46">
            Are you sure you want to cancel your reservation for{" "}
            <strong>
              {cancelTarget?.desk_name} ({cancelTarget?.desk_code})
            </strong>{" "}
            on <strong>{cancelTarget?.date}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelTarget(null)} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
            Keep Reservation
          </Button>
          <Button
            onClick={handleCancelConfirm}
            variant="contained"
            color="error"
            disabled={cancelling}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
          >
            {cancelling ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
