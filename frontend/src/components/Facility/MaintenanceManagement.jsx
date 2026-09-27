import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BuildIcon from "@mui/icons-material/Build";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WarningIcon from "@mui/icons-material/Warning";

import api from "../../api/axios";

export default function MaintenanceManagement({ openAddSignal, onResetAddSignal, onRefreshStats }) {
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  // Create Maintenance Modal State
  const [openModal, setOpenModal] = useState(false);
  const [roomsList, setRoomsList] = useState([]);
  const [desksList, setDesksList] = useState([]);
  const [formData, setFormData] = useState({
    resource_type: "meeting_room",
    resource_id: "",
    resource_name: "",
    issue_title: "",
    issue_description: "",
    priority: "Medium",
  });

  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "All") params.status = statusFilter;
      if (priorityFilter !== "All") params.priority = priorityFilter;

      const res = await api.get("/api/v1/facility/maintenance", { params });
      setMaintenanceList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to load maintenance records", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchResourcesForModal = async () => {
    try {
      const [roomRes, deskRes] = await Promise.all([
        api.get("/api/v1/facility/meeting-rooms"),
        api.get("/api/v1/facility/workspaces"),
      ]);
      setRoomsList(Array.isArray(roomRes.data) ? roomRes.data : []);
      setDesksList(Array.isArray(deskRes.data) ? deskRes.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMaintenance();
    fetchResourcesForModal();
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (openAddSignal) {
      handleOpenCreateModal();
      if (onResetAddSignal) onResetAddSignal();
    }
  }, [openAddSignal]);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: "", text: "" }), 4000);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      resource_type: "meeting_room",
      resource_id: "",
      resource_name: "",
      issue_title: "",
      issue_description: "",
      priority: "Medium",
    });
    setOpenModal(true);
  };

  const handleResourceSelect = (resId) => {
    if (formData.resource_type === "meeting_room") {
      const found = roomsList.find((r) => (r._id || r.id) === resId);
      setFormData({
        ...formData,
        resource_id: resId,
        resource_name: found ? found.name : "Meeting Room",
      });
    } else {
      const found = desksList.find((d) => (d._id || d.id) === resId);
      setFormData({
        ...formData,
        resource_id: resId,
        resource_name: found ? found.desk_code : "Desk",
      });
    }
  };

  const handleCreateMaintenance = async () => {
    if (!formData.resource_id || !formData.issue_title) {
      showFeedback("Please select a resource and enter an issue title.", "error");
      return;
    }

    try {
      const res = await api.post("/api/v1/facility/maintenance", formData);
      showFeedback(res.data?.message || "Maintenance record created successfully!");
      if (res.data?.conflicting_reservations_count > 0) {
        showFeedback(
          `Warning: ${res.data.conflicting_reservations_count} future reservation(s) exist for this resource during maintenance!`,
          "warning"
        );
      }
      setOpenModal(false);
      fetchMaintenance();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to create maintenance record", "error");
    }
  };

  const handleUpdateStatus = async (recordId, newStatus) => {
    try {
      await api.patch(`/api/v1/facility/maintenance/${recordId}`, {
        status: newStatus,
        resolution_notes: newStatus === "Completed" ? "Resolved by Facility Team." : undefined,
      });
      showFeedback(`Maintenance status updated to '${newStatus}'!`);
      fetchMaintenance();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to update maintenance status", "error");
    }
  };

  return (
    <Box>
      {/* Header Bar */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Facility Maintenance Management
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track maintenance requests, assign priorities, update task progress, and manage resource availability.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            sx={{ bgcolor: "#ED6C02", color: "#FFFFFF", fontWeight: 700, borderRadius: "10px", textTransform: "none", px: 2.5 }}
          >
            Report Issue
          </Button>
        </Stack>

        {/* Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
          <TextField
            size="small"
            placeholder="Search issue, resource name, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }} />,
            }}
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Open">Open</MenuItem>
              <MenuItem value="Scheduled">Scheduled</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select value={priorityFilter} label="Priority" onChange={(e) => setPriorityFilter(e.target.value)}>
              <MenuItem value="All">All Priorities</MenuItem>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {feedbackMsg.text && (
        <Alert severity={feedbackMsg.type || "info"} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFeedbackMsg({ type: "", text: "" })}>
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Maintenance Tasks Table */}
      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress sx={{ color: "#ED6C02" }} />
        </Box>
      ) : maintenanceList.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px dashed #CBD5E1", bgcolor: "#FFFFFF" }}>
          <BuildIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#475569">
            No Maintenance Records Found
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All office facilities are running smoothly with zero active issues.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E2E8F0" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Resource</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Issue Title & Description</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Reported Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", textAlign: "right" }}>Workflow Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceList.map((m) => {
                const isDone = m.status === "Completed" || m.status === "Cancelled";

                return (
                  <TableRow key={m.id} hover>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>
                      {m.resource_name}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={m.resource_type === "meeting_room" ? "Meeting Room" : "Workspace Desk"}
                        size="small"
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600, bgcolor: m.resource_type === "meeting_room" ? "#ECFDF5" : "#ECFDF5", color: m.resource_type === "meeting_room" ? "#059669" : "#047857" }}
                      />
                    </TableCell>

                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" fontWeight={700} color="#1E293B">
                        {m.issue_title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {m.issue_description}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={m.priority}
                        size="small"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          bgcolor: m.priority === "Critical" ? "#FFEBEE" : m.priority === "High" ? "#FFF3E0" : "#E8F5E9",
                          color: m.priority === "Critical" ? "#C62828" : m.priority === "High" ? "#EF6C00" : "#2E7D32",
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={m.status}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 24,
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          borderColor: m.status === "In Progress" ? "#047857" : m.status === "Completed" ? "#2E7D32" : "#ED6C02",
                          color: m.status === "In Progress" ? "#047857" : m.status === "Completed" ? "#2E7D32" : "#ED6C02",
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ color: "#64748B", fontSize: "0.78rem" }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}
                    </TableCell>

                    <TableCell textAlign="right">
                      {!isDone ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {m.status === "Open" && (
                            <Button size="small" variant="outlined" startIcon={<CalendarMonthIcon fontSize="small" />} onClick={() => handleUpdateStatus(m.id, "Scheduled")} sx={{ textTransform: "none", fontSize: "0.75rem" }}>
                              Schedule
                            </Button>
                          )}
                          {(m.status === "Open" || m.status === "Scheduled") && (
                            <Button size="small" variant="contained" startIcon={<PlayArrowIcon fontSize="small" />} onClick={() => handleUpdateStatus(m.id, "In Progress")} sx={{ textTransform: "none", fontSize: "0.75rem", bgcolor: "#047857" }}>
                              Start Work
                            </Button>
                          )}
                          {m.status === "In Progress" && (
                            <Button size="small" variant="contained" startIcon={<CheckCircleIcon fontSize="small" />} onClick={() => handleUpdateStatus(m.id, "Completed")} sx={{ textTransform: "none", fontSize: "0.75rem", bgcolor: "#2E7D32" }}>
                              Complete
                            </Button>
                          )}
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Workflow Finished
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Maintenance Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#ED6C02", pb: 1 }}>
          Report Facility Maintenance Issue
        </DialogTitle>
        <DialogContent sx={{ overflowY: "visible", pt: "16px !important" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(12, 1fr)" },
              gap: 2.5,
              pt: 1,
              pb: 1,
            }}
          >
            <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="resource-type-label">Resource Type</InputLabel>
                <Select
                  labelId="resource-type-label"
                  value={formData.resource_type}
                  label="Resource Type"
                  onChange={(e) => setFormData({ ...formData, resource_type: e.target.value, resource_id: "", resource_name: "" })}
                >
                  <MenuItem value="meeting_room">Meeting Room</MenuItem>
                  <MenuItem value="workspace">Workspace Desk</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: "span 12", sm: "span 6" } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="specific-resource-label">Select Specific Resource</InputLabel>
                <Select
                  labelId="specific-resource-label"
                  value={formData.resource_id}
                  label="Select Specific Resource"
                  onChange={(e) => handleResourceSelect(e.target.value)}
                >
                  {formData.resource_type === "meeting_room"
                    ? roomsList.map((r) => (
                        <MenuItem key={r._id || r.id} value={r._id || r.id}>{r.name} (Floor {r.floor})</MenuItem>
                      ))
                    : desksList.map((d) => (
                        <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.desk_code} ({d.workspace_type})</MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: { xs: "span 12", sm: "span 8" } }}>
              <TextField fullWidth size="small" label="Issue Title" value={formData.issue_title} onChange={(e) => setFormData({ ...formData, issue_title: e.target.value })} />
            </Box>

            <Box sx={{ gridColumn: { xs: "span 12", sm: "span 4" } }}>
              <FormControl fullWidth size="small">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: "span 12" }}>
              <TextField fullWidth multiline rows={3} size="small" label="Detailed Description of the Issue" value={formData.issue_description} onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateMaintenance} sx={{ bgcolor: "#ED6C02", "&:hover": { bgcolor: "#D95D00" }, fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>Create Record</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
