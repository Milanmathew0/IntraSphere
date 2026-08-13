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
  TextField,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import api from "../../api/axios";

export default function RoomManagementModal({ open, onClose, roomToEdit, onSuccess }) {
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [floor, setFloor] = useState(1);
  const [location, setLocation] = useState("North Wing");
  const [capacity, setCapacity] = useState(10);
  const [description, setDescription] = useState("");
  const [statusVal, setStatusVal] = useState("Available");
  const [imageUrl, setImageUrl] = useState("");
  const [facilities, setFacilities] = useState([
    "Projector",
    "Video Conferencing",
    "Whiteboard",
    "Smart Display",
    "Air Conditioning",
    "Wi-Fi",
    "Power Outlets",
  ]);
  const [selectedFacilities, setSelectedFacilities] = useState(["Projector", "Whiteboard", "Wi-Fi"]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (roomToEdit) {
      setRoomName(roomToEdit.room_name || "");
      setRoomCode(roomToEdit.room_code || "");
      setFloor(roomToEdit.floor || 1);
      setLocation(roomToEdit.location || "");
      setCapacity(roomToEdit.capacity || 10);
      setDescription(roomToEdit.description || "");
      setStatusVal(roomToEdit.status || "Available");
      setImageUrl(roomToEdit.image_url || "");
      setSelectedFacilities(roomToEdit.facilities || ["Projector", "Whiteboard"]);
    } else {
      setRoomName("");
      setRoomCode("");
      setFloor(1);
      setLocation("North Wing");
      setCapacity(10);
      setDescription("");
      setStatusVal("Available");
      setImageUrl("");
      setSelectedFacilities(["Projector", "Whiteboard"]);
    }
  }, [roomToEdit, open]);

  const handleFacilityToggle = (fac) => {
    if (selectedFacilities.includes(fac)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== fac));
    } else {
      setSelectedFacilities([...selectedFacilities, fac]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!roomName.trim() || !roomCode.trim()) {
      setErrorMsg("Room Name and Room Code are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        room_name: roomName.trim(),
        room_code: roomCode.trim(),
        floor: Number(floor),
        location: location.trim(),
        capacity: Number(capacity),
        description: description.trim(),
        facilities: selectedFacilities,
        status: statusVal,
        image_url: imageUrl.trim() || null,
        is_active: true,
      };

      if (roomToEdit) {
        const id = roomToEdit.id || roomToEdit._id;
        await api.patch(`/api/v1/meeting-rooms/${id}`, payload);
        if (onSuccess) onSuccess("Meeting room updated successfully!");
      } else {
        await api.post("/api/v1/meeting-rooms/", payload);
        if (onSuccess) onSuccess("New meeting room added successfully!");
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.response?.data?.detail || "Failed to save room details.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "20px" } }}>
      <DialogTitle sx={{ p: 3, pb: 2 }}>
        <Typography variant="h5" fontWeight={900} color="#09090B">
          {roomToEdit ? "Edit Meeting Room" : "Add New Meeting Room"}
        </Typography>
        <Typography variant="body2" color="#71717A" mt={0.5}>
          Facility Manager & Admin room configuration panel.
        </Typography>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Room Name"
                placeholder="e.g. Conference Room A"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Room Code"
                placeholder="CR-A-201"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={6} sm={4}>
              <TextField
                type="number"
                fullWidth
                label="Floor"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={6} sm={4}>
              <TextField
                type="number"
                fullWidth
                label="Capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
              >
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Maintenance">Under Maintenance</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location / Building Wing"
                placeholder="e.g. Floor 2 · North Wing"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL (Optional)"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                placeholder="Room features, display equipment, or usage guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>

            {/* Facilities Checkboxes */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={800} color="#71717A" mb={1}>
                FACILITIES & AMENITIES
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {facilities.map((fac) => {
                  const isSelected = selectedFacilities.includes(fac);
                  return (
                    <Chip
                      key={fac}
                      label={fac}
                      onClick={() => handleFacilityToggle(fac)}
                      sx={{
                        fontWeight: 700,
                        borderRadius: "8px",
                        bgcolor: isSelected ? "#09090B" : "#F4F4F5",
                        color: isSelected ? "#FFFFFF" : "#09090B",
                        border: isSelected ? "1px solid #09090B" : "1px solid #E4E4E7",
                      }}
                    />
                  );
                })}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5, px: 3, justifyContent: "space-between" }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: "10px", fontWeight: 700, borderColor: "#09090B", color: "#09090B" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: "10px",
              fontWeight: 800,
              bgcolor: "#09090B",
              color: "#FFFFFF",
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#27272A", boxShadow: "none" }
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : roomToEdit ? "Save Changes" : "Create Room"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
