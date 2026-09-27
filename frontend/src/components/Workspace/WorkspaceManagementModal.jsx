import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import { X, Wrench, Plus, CheckCircle2 } from "lucide-react";
import api from "../../api/axios";

const WORKSPACE_TYPES = [
  "Standard Desk",
  "Standing Desk",
  "Quiet Desk",
  "Collaborative Desk",
  "Accessible Desk",
  "Executive Desk",
];

const AVAILABLE_FACILITIES = [
  "Monitor",
  "Dual Monitor",
  "Keyboard",
  "Mouse",
  "Docking Station",
  "USB-C",
  "Power Outlet",
  "Wi-Fi",
  "Ergonomic Chair",
  "Standing Desk",
];

export default function WorkspaceManagementModal({ open, onClose, deskToEdit, onSuccess }) {
  const isEdit = !!deskToEdit;

  const [deskCode, setDeskCode] = useState("");
  const [deskName, setDeskName] = useState("");
  const [building, setBuilding] = useState("Main Office");
  const [floor, setFloor] = useState(2);
  const [zone, setZone] = useState("Engineering");
  const [location, setLocation] = useState("North Wing");
  const [workspaceType, setWorkspaceType] = useState("Standard Desk");
  const [isAccessible, setIsAccessible] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Available");

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (open) {
      if (deskToEdit) {
        setDeskCode(deskToEdit.desk_code || "");
        setDeskName(deskToEdit.desk_name || "");
        setBuilding(deskToEdit.building || "Main Office");
        setFloor(deskToEdit.floor || 1);
        setZone(deskToEdit.zone || "");
        setLocation(deskToEdit.location || "");
        setWorkspaceType(deskToEdit.workspace_type || "Standard Desk");
        setIsAccessible(!!deskToEdit.is_accessible);
        setSelectedFacilities(deskToEdit.facilities || []);
        setDescription(deskToEdit.description || "");
        setStatus(deskToEdit.status || "Available");
      } else {
        setDeskCode("");
        setDeskName("");
        setBuilding("Main Office");
        setFloor(2);
        setZone("Engineering");
        setLocation("North Wing");
        setWorkspaceType("Standard Desk");
        setIsAccessible(false);
        setSelectedFacilities(["Monitor", "USB-C", "Wi-Fi"]);
        setDescription("");
        setStatus("Available");
      }
      setErrorMessage("");
    }
  }, [open, deskToEdit]);

  const toggleFacility = (fac) => {
    if (selectedFacilities.includes(fac)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== fac));
    } else {
      setSelectedFacilities([...selectedFacilities, fac]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!deskCode.trim() || !deskName.trim()) {
      setErrorMessage("Desk Code and Desk Name are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        desk_code: deskCode.trim(),
        desk_name: deskName.trim(),
        building: building.trim(),
        floor: Number(floor),
        zone: zone.trim(),
        location: location.trim(),
        workspace_type: workspaceType,
        is_accessible: isAccessible,
        facilities: selectedFacilities,
        description: description.trim(),
        status: status,
      };

      if (isEdit) {
        await api.patch(`/api/v1/workspaces/${deskToEdit.id}`, payload);
      } else {
        await api.post("/api/v1/workspaces/", payload);
      }

      if (onSuccess) {
        onSuccess(isEdit ? "Desk updated successfully!" : "New workspace desk created successfully!");
      }
      onClose();
    } catch (err) {
      console.error("Workspace save error:", err);
      setErrorMessage(err.response?.data?.detail || "Failed to save workspace desk.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth paperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle sx={{ m: 0, p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Wrench size={22} color="#F97316" />
          <Typography variant="h6" fontWeight={800} color="#09090B">
            {isEdit ? `Edit Desk ${deskToEdit.desk_code}` : "Add New Workspace Desk"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#71717A" }}>
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage("")} sx={{ mb: 2, borderRadius: "12px" }}>
              {errorMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Desk Code (Unique)"
                fullWidth
                value={deskCode}
                onChange={(e) => setDeskCode(e.target.value)}
                placeholder="e.g. D-2-015"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Desk Name"
                fullWidth
                value={deskName}
                onChange={(e) => setDeskName(e.target.value)}
                placeholder="e.g. Desk 015"
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Building"
                fullWidth
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Floor Number"
                type="number"
                fullWidth
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Zone / Department Area"
                fullWidth
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                placeholder="e.g. Engineering"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Wing / Detailed Location"
                fullWidth
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. North Wing - 2nd Floor"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Workspace Type"
                fullWidth
                value={workspaceType}
                onChange={(e) => setWorkspaceType(e.target.value)}
              >
                {WORKSPACE_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Administrative Status"
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isAccessible}
                    onChange={(e) => setIsAccessible(e.target.checked)}
                    color="primary"
                  />
                }
                label={<Typography fontWeight={700}>Wheelchair Accessible Desk</Typography>}
              />
            </Grid>

            {/* Facilities Checkboxes */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={800} color="#09090B" gutterBottom>
                Included Facilities & Hardware
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {AVAILABLE_FACILITIES.map((fac) => {
                  const isSelected = selectedFacilities.includes(fac);
                  return (
                    <Chip
                      key={fac}
                      label={fac}
                      onClick={() => toggleFacility(fac)}
                      color={isSelected ? "primary" : "default"}
                      variant={isSelected ? "filled" : "outlined"}
                      sx={{ fontWeight: 600, cursor: "pointer" }}
                    />
                  );
                })}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Desk Description"
                multiline
                rows={3}
                fullWidth
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed notes regarding workstation position, monitors, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CheckCircle2 size={18} />}
            sx={{
              bgcolor: "#F97316",
              color: "#FFFFFF",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": { bgcolor: "#EA580C" },
            }}
          >
            {submitting ? "Saving..." : isEdit ? "Update Desk" : "Create Desk"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
