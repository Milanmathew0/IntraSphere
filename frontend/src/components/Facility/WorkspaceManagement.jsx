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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tooltip,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BuildIcon from "@mui/icons-material/Build";
import SearchIcon from "@mui/icons-material/Search";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WheelchairPickupIcon from "@mui/icons-material/WheelchairPickup";

import api from "../../api/axios";

export default function WorkspaceManagement({ openAddSignal, onResetAddSignal, onRefreshStats }) {
  const [desks, setDesks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add / Edit Modal state
  const [openDeskModal, setOpenDeskModal] = useState(false);
  const [editingDesk, setEditingDesk] = useState(null);
  const [deskFormData, setDeskFormData] = useState({
    desk_code: "",
    desk_name: "",
    floor: 1,
    zone: "Zone A",
    building: "Main Building",
    location: "Floor 1, East Wing",
    workspace_type: "Standard Desk",
    facilities: "Dual Monitor, Ergonomic Chair, Power Dock",
    is_accessible: false,
    description: "",
    status: "Available",
    is_active: true,
  });

  // Maintenance Dialog state
  const [openMaintModal, setOpenMaintModal] = useState(false);
  const [selectedDeskForMaint, setSelectedDeskForMaint] = useState(null);
  const [maintReason, setMaintReason] = useState("");
  const [maintPriority, setMaintPriority] = useState("Medium");

  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  const workspaceTypes = [
    "Standard Desk",
    "Standing Desk",
    "Quiet Desk",
    "Collaborative Desk",
    "Accessible Desk",
    "Executive Desk",
  ];

  const fetchDesks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (typeFilter !== "All") params.workspace_type = typeFilter;
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await api.get("/api/v1/facility/workspaces", { params });
      setDesks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to load workspace desks", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesks();
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    if (openAddSignal) {
      handleOpenAddModal();
      if (onResetAddSignal) onResetAddSignal();
    }
  }, [openAddSignal]);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: "", text: "" }), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingDesk(null);
    setDeskFormData({
      desk_code: `DSK-${Math.floor(100 + Math.random() * 900)}`,
      desk_name: "Hot Desk",
      floor: 1,
      zone: "Zone A",
      building: "Main Building",
      location: "Floor 1, East Wing",
      workspace_type: "Standard Desk",
      facilities: "Dual Monitor, Ergonomic Chair, Power Dock",
      is_accessible: false,
      description: "",
      status: "Available",
      is_active: true,
    });
    setOpenDeskModal(true);
  };

  const handleOpenEditModal = (desk) => {
    setEditingDesk(desk);
    setDeskFormData({
      desk_code: desk.desk_code || "",
      desk_name: desk.desk_name || "",
      floor: desk.floor || 1,
      zone: desk.zone || "Zone A",
      building: desk.building || "Main Building",
      location: desk.location || "",
      workspace_type: desk.workspace_type || "Standard Desk",
      facilities: Array.isArray(desk.facilities) ? desk.facilities.join(", ") : desk.facilities || "",
      is_accessible: desk.is_accessible ?? false,
      description: desk.description || "",
      status: desk.status || "Available",
      is_active: desk.is_active ?? true,
    });
    setOpenDeskModal(true);
  };

  const handleSaveDesk = async () => {
    if (!deskFormData.desk_code) {
      showFeedback("Desk Code is required.", "error");
      return;
    }

    try {
      const facilitiesList = typeof deskFormData.facilities === "string"
        ? deskFormData.facilities.split(",").map((s) => s.trim()).filter(Boolean)
        : deskFormData.facilities;

      const payload = {
        ...deskFormData,
        floor: Number(deskFormData.floor),
        facilities: facilitiesList,
      };

      if (editingDesk) {
        await api.patch(`/api/v1/facility/workspaces/${editingDesk._id || editingDesk.id}`, payload);
        showFeedback("Workspace desk updated successfully!");
      } else {
        await api.post("/api/v1/facility/workspaces", payload);
        showFeedback("New workspace desk created successfully!");
      }

      setOpenDeskModal(false);
      fetchDesks();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to save workspace desk", "error");
    }
  };

  const handleToggleActive = async (desk) => {
    try {
      await api.patch(`/api/v1/facility/workspaces/${desk._id || desk.id}/deactivate`);
      showFeedback(`Desk ${desk.is_active ? "deactivated" : "activated"} successfully!`);
      fetchDesks();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback("Failed to update desk active state", "error");
    }
  };

  const handleOpenMaintenanceModal = (desk) => {
    setSelectedDeskForMaint(desk);
    setMaintReason("");
    setMaintPriority("Medium");
    setOpenMaintModal(true);
  };

  const handleSaveMaintenance = async () => {
    if (!selectedDeskForMaint) return;
    try {
      const targetStatus = selectedDeskForMaint.status === "Maintenance" ? "Available" : "Maintenance";

      await api.patch(`/api/v1/facility/workspaces/${selectedDeskForMaint._id || selectedDeskForMaint.id}/maintenance`, {
        status: targetStatus,
        issue_title: maintReason || "Scheduled Desk Maintenance Check",
        issue_description: maintReason || "Facility routine desk maintenance.",
        priority: maintPriority,
      });

      showFeedback(`Desk status updated to ${targetStatus}!`);
      setOpenMaintModal(false);
      fetchDesks();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to update maintenance status", "error");
    }
  };

  return (
    <Box>
      {/* Header & Controls Bar */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#FFFFFF", mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Workspace & Desk Management
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage desk codes, zone allocations, workspace types, accessibility, and maintenance statuses.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddModal}
            sx={{ bgcolor: "#0288D1", color: "#FFFFFF", fontWeight: 700, borderRadius: "10px", textTransform: "none", px: 2.5 }}
          >
            Add Workspace Desk
          </Button>
        </Stack>

        {/* Filter Row */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={3}>
          <TextField
            size="small"
            placeholder="Search desk code, zone, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }} />,
            }}
            sx={{ flex: 1 }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Workspace Type</InputLabel>
            <Select value={typeFilter} label="Workspace Type" onChange={(e) => setTypeFilter(e.target.value)}>
              <MenuItem value="All">All Types</MenuItem>
              {workspaceTypes.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status Filter</InputLabel>
            <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Available">Available</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {feedbackMsg.text && (
        <Alert severity={feedbackMsg.type || "info"} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFeedbackMsg({ type: "", text: "" })}>
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Workspace Desks Grid */}
      {loading ? (
        <Box textAlign="center" py={6}>
          <CircularProgress sx={{ color: "#0288D1" }} />
        </Box>
      ) : desks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px dashed #CBD5E1", bgcolor: "#FFFFFF" }}>
          <DesktopWindowsIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#475569">
            No Workspace Desks Found
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Try adjusting your search query or add a new workspace desk.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {desks.map((desk) => {
            const isMaint = desk.status === "Maintenance";
            const isInactive = !desk.is_active || desk.status === "Inactive";

            return (
              <Grid item xs={12} sm={6} md={4} key={desk._id || desk.id}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `1px solid ${isMaint ? "#FFE0B2" : isInactive ? "#E2E8F0" : "#E2E8F0"}`,
                    bgcolor: isMaint ? "#FFFBF5" : isInactive ? "#F8FAFC" : "#FFFFFF",
                    position: "relative",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                      borderColor: "#0288D1",
                    },
                  }}
                >
                  {/* Top Status & Controls */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Chip
                      icon={isMaint ? <BuildIcon sx={{ fontSize: "14px !important" }} /> : <CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                      label={isInactive ? "Inactive" : desk.status || "Available"}
                      size="small"
                      sx={{
                        height: 24,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: isInactive ? "#F1F5F9" : isMaint ? "#FFF3E0" : "#E8F5E9",
                        color: isInactive ? "#64748B" : isMaint ? "#E65100" : "#2E7D32",
                      }}
                    />

                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Edit Desk">
                        <IconButton size="small" onClick={() => handleOpenEditModal(desk)} sx={{ color: "#475569" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isMaint ? "Clear Maintenance" : "Mark Maintenance"}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenMaintenanceModal(desk)}
                          sx={{ color: isMaint ? "#E65100" : "#94A3B8" }}
                        >
                          <BuildIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={desk.is_active ? "Deactivate" : "Activate"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleActive(desk)}
                          sx={{ color: desk.is_active ? "#2E7D32" : "#D32F2F" }}
                        >
                          <PowerSettingsNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {/* Desk Info */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="h6" fontWeight={800} color="#0F172A">
                      {desk.desk_code}
                    </Typography>
                    {desk.is_accessible && (
                      <Chip icon={<WheelchairPickupIcon sx={{ fontSize: "14px !important" }} />} label="Accessible" size="small" sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#E1F5FE", color: "#0288D1" }} />
                    )}
                  </Stack>

                  <Typography variant="subtitle2" color="#475569" fontWeight={600} mb={1}>
                    {desk.workspace_type || "Standard Desk"}
                  </Typography>

                  <Stack direction="row" spacing={2} color="#64748B" mb={2}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocationOnIcon sx={{ fontSize: 16 }} />
                      <Typography variant="caption" fontWeight={600}>
                        Floor {desk.floor} • {desk.zone || "Zone A"}
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Facilities Chips */}
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" gap={0.8}>
                    {(Array.isArray(desk.facilities) ? desk.facilities : (desk.facilities || "").split(",")).slice(0, 3).map((f, i) => (
                      <Chip key={i} label={f.trim()} size="small" sx={{ height: 20, fontSize: "0.68rem", bgcolor: "#F1F5F9", color: "#475569" }} />
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add / Edit Desk Dialog */}
      <Dialog open={openDeskModal} onClose={() => setOpenDeskModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
          {editingDesk ? "Edit Workspace Desk" : "Add New Workspace Desk"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} pt={1}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth size="small" label="Desk Code (e.g. DSK-101)" value={deskFormData.desk_code} onChange={(e) => setDeskFormData({ ...deskFormData, desk_code: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Workspace Type</InputLabel>
                <Select value={deskFormData.workspace_type} label="Workspace Type" onChange={(e) => setDeskFormData({ ...deskFormData, workspace_type: e.target.value })}>
                  {workspaceTypes.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="number" label="Floor" value={deskFormData.floor} onChange={(e) => setDeskFormData({ ...deskFormData, floor: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Zone" value={deskFormData.zone} onChange={(e) => setDeskFormData({ ...deskFormData, zone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" label="Building" value={deskFormData.building} onChange={(e) => setDeskFormData({ ...deskFormData, building: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth size="small" label="Facilities (comma-separated)" value={deskFormData.facilities} onChange={(e) => setDeskFormData({ ...deskFormData, facilities: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} size="small" label="Description" value={deskFormData.description} onChange={(e) => setDeskFormData({ ...deskFormData, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDeskModal(false)} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveDesk} sx={{ bgcolor: "#0288D1", fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>Save Desk</Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={openMaintModal} onClose={() => setOpenMaintModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#E65100" }}>
          {selectedDeskForMaint?.status === "Maintenance" ? "Clear Desk Maintenance" : "Mark Desk For Maintenance"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B" mb={2}>
            {selectedDeskForMaint?.status === "Maintenance"
              ? `Are you sure you want to restore '${selectedDeskForMaint?.desk_code}' back to Available status?`
              : `Marking '${selectedDeskForMaint?.desk_code}' under maintenance will prevent new reservations during the maintenance window.`}
          </Typography>

          {selectedDeskForMaint?.status !== "Maintenance" && (
            <Stack spacing={2}>
              <TextField fullWidth size="small" label="Reason / Issue Description" value={maintReason} onChange={(e) => setMaintReason(e.target.value)} />
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select value={maintPriority} label="Priority" onChange={(e) => setMaintPriority(e.target.value)}>
                  <MenuItem value="Low">Low Priority</MenuItem>
                  <MenuItem value="Medium">Medium Priority</MenuItem>
                  <MenuItem value="High">High Priority</MenuItem>
                  <MenuItem value="Critical">Critical Priority</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenMaintModal(false)} sx={{ textTransform: "none", color: "#64748B" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMaintenance} sx={{ bgcolor: "#ED6C02", fontWeight: 700, textTransform: "none", borderRadius: "8px" }}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
