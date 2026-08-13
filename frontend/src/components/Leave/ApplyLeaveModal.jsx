import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Calendar } from "lucide-react";
import api from "../../api/axios";

export default function ApplyLeaveModal({ open, onClose, onSuccess, leaveTypes = [] }) {
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState("Morning");
  const [reason, setReason] = useState("");

  // Calculation & Loading State
  const [calculatedDays, setCalculatedDays] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Available paid leave types (excluding unpaid and earned leave)
  const availableLeaveTypes = leaveTypes.filter((t) => {
    const name = t.name?.toLowerCase() || "";
    return !name.includes("unpaid") && !name.includes("earned");
  });

  // Selected Leave Type Object
  const selectedType = availableLeaveTypes.find((t) => t._id === leaveTypeId) || null;

  useEffect(() => {
    if (availableLeaveTypes.length > 0 && (!leaveTypeId || !availableLeaveTypes.some((t) => t._id === leaveTypeId))) {
      setLeaveTypeId(availableLeaveTypes[0]._id);
    }
  }, [availableLeaveTypes, leaveTypeId]);

  // Recalculate working days from backend whenever dates/halfday change
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchDuration = async () => {
      setCalcLoading(true);
      setErrorMsg("");
      try {
        const res = await api.post("/api/v1/leave-requests/calculate-days", null, {
          params: {
            start_date: startDate,
            end_date: endDate,
            is_half_day: isHalfDay,
          },
        });
        setCalculatedDays(res.data.total_days);
      } catch (err) {
        setCalculatedDays(null);
        setErrorMsg(err.response?.data?.detail || "Invalid date selection or duration error.");
      } finally {
        setCalcLoading(false);
      }
    };

    fetchDuration();
  }, [startDate, endDate, isHalfDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!leaveTypeId) {
      setErrorMsg("Please select a leave type.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please provide a reason for your leave request.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.post("/api/v1/leave-requests/", {
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        is_half_day: isHalfDay,
        half_day_session: isHalfDay ? halfDaySession : null,
        reason: reason.trim(),
        contact_number: null,
        attachment_url: null,
      });

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to submit leave request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          p: 1,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, color: "#09090B", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: "#09090B",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Calendar size={22} />
        </Box>
        Apply for Leave
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
          {errorMsg && (
            <Alert severity="error" sx={{ borderRadius: "12px" }}>
              {errorMsg}
            </Alert>
          )}

          {/* Leave Type Dropdown */}
          <TextField
            select
            fullWidth
            label="Leave Type"
            value={leaveTypeId}
            onChange={(e) => setLeaveTypeId(e.target.value)}
            required
            helperText={selectedType?.description}
          >
            {availableLeaveTypes.map((t) => (
              <MenuItem key={t._id} value={t._id}>
                {t.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Date Picker Row */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              type="date"
              label="Start Date"
              fullWidth
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (isHalfDay || e.target.value > endDate) {
                  setEndDate(e.target.value);
                }
              }}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              type="date"
              label="End Date"
              fullWidth
              value={endDate}
              disabled={isHalfDay}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Stack>

          {/* Half Day Checkbox */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: "#FAFAFA", borderRadius: "14px", border: "1px solid #E4E4E7" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isHalfDay}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsHalfDay(checked);
                    if (checked) setEndDate(startDate);
                  }}
                  sx={{ color: "#09090B", "&.Mui-checked": { color: "#09090B" } }}
                />
              }
              label={
                <Typography variant="body2" fontWeight={700} color="#09090B">
                  Apply for Half-Day Only (0.5 Working Day)
                </Typography>
              }
            />

            {isHalfDay && (
              <Box mt={1.5} pl={4}>
                <TextField
                  select
                  size="small"
                  label="Session"
                  value={halfDaySession}
                  onChange={(e) => setHalfDaySession(e.target.value)}
                  sx={{ width: 200 }}
                >
                  <MenuItem value="Morning">Morning Session</MenuItem>
                  <MenuItem value="Afternoon">Afternoon Session</MenuItem>
                </TextField>
              </Box>
            )}
          </Paper>

          {/* Reason */}
          <TextField
            multiline
            rows={3}
            fullWidth
            label="Reason for Leave"
            placeholder="Provide a brief explanation for your leave request..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={onClose} disabled={submitting} sx={{ color: "#09090B", textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || calcLoading || (calculatedDays !== null && calculatedDays <= 0)}
            sx={{
              borderRadius: "12px",
              px: 3.5,
              py: 1,
              bgcolor: "#09090B",
              color: "#FFFFFF",
              fontWeight: 800,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#27272A", boxShadow: "none" },
            }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Request"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
