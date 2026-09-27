import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Divider,
} from "@mui/material";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Info,
} from "lucide-react";
import api from "../../api/axios";

export default function ApplyLeaveModal({ open, onClose, onSuccess, leaveTypes = [] }) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState("First Half");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  // Live Calculation & Preview State
  const [preview, setPreview] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Validation & Error States
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Confirmation & Success Dialog States
  const [showConfirm, setShowConfirm] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Available leave types (support all active types)
  const availableLeaveTypes = leaveTypes.length > 0 ? leaveTypes : [];

  // Selected Leave Type Object
  const selectedType = availableLeaveTypes.find((t) => (t._id || t.id) === leaveTypeId) || null;

  useEffect(() => {
    if (open) {
      // Reset form state on open
      setErrorMsg("");
      setFieldErrors({});
      setTouched({});
      setSubmittedData(null);
      setShowConfirm(false);
      if (availableLeaveTypes.length > 0) {
        const firstId = availableLeaveTypes[0]._id || availableLeaveTypes[0].id;
        if (!leaveTypeId || !availableLeaveTypes.some((t) => (t._id || t.id) === leaveTypeId)) {
          setLeaveTypeId(firstId);
        }
      }
    }
  }, [open, availableLeaveTypes]);

  // Recalculate working days and balance preview from backend whenever inputs change
  useEffect(() => {
    if (!startDate || !endDate || !open) return;

    // Fast client-side date ordering check
    if (startDate > endDate && !isHalfDay) {
      setPreview(null);
      setFieldErrors((prev) => ({ ...prev, endDate: "End date must be on or after the start date." }));
      return;
    } else {
      setFieldErrors((prev) => ({ ...prev, endDate: "" }));
    }

    const fetchDuration = async () => {
      setCalcLoading(true);
      try {
        const res = await api.post("/api/v1/leave-requests/calculate-days", null, {
          params: {
            start_date: startDate,
            end_date: endDate,
            is_half_day: isHalfDay,
            leave_type_id: leaveTypeId || undefined,
          },
        });
        setPreview(res.data);
        setErrorMsg("");
      } catch (err) {
        setPreview(null);
        setErrorMsg(err.response?.data?.detail || "Invalid date selection or duration calculation error.");
      } finally {
        setCalcLoading(false);
      }
    };

    fetchDuration();
  }, [startDate, endDate, isHalfDay, leaveTypeId, open]);

  // Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/api/v1/leave-requests/upload-attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAttachmentUrl(res.data.attachment_url);
      setAttachmentName(res.data.filename || file.name);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to upload file attachment.");
    } finally {
      setUploading(false);
    }
  };

  // Form Field Live Validation
  const validateForm = () => {
    const errors = {};
    if (!leaveTypeId) errors.leaveTypeId = "Please select a leave type.";
    if (!startDate) errors.startDate = "Please select a start date.";
    if (!endDate) errors.endDate = "Please select an end date.";
    if (startDate > endDate && !isHalfDay) errors.endDate = "End date must be on or after start date.";
    if (endDate < todayStr) errors.endDate = "You cannot apply for leave for a date that has already passed.";
    
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      errors.reason = "Reason for leave is required.";
    } else if (trimmedReason.length < 10) {
      errors.reason = "Reason must be at least 10 characters long.";
    } else if (trimmedReason.length > 500) {
      errors.reason = "Reason cannot exceed 500 characters.";
    }

    if (selectedType?.requires_attachment && !attachmentUrl) {
      errors.attachment = `Medical certificate or supporting document is required for ${selectedType.name}.`;
    }

    setFieldErrors(errors);
    setTouched({ leaveTypeId: true, startDate: true, endDate: true, reason: true, attachment: true });
    return Object.keys(errors).length === 0;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (preview && preview.working_days >= 3) {
      setShowConfirm(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    setShowConfirm(false);

    try {
      const res = await api.post("/api/v1/leave-requests/", {
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        is_half_day: isHalfDay,
        half_day_session: isHalfDay ? halfDaySession : null,
        reason: reason.trim(),
        contact_number: null,
        attachment_url: attachmentUrl || null,
      });

      setSubmittedData({
        leaveTypeName: selectedType?.name || "Leave",
        startDate,
        endDate,
        workingDays: preview?.working_days || res.data.total_days || 1,
        status: res.data.status || "Pending",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      const detail = err.response?.data?.detail;
      let msg = "Failed to submit leave request.";
      if (typeof detail === "string") msg = detail;
      else if (Array.isArray(detail)) msg = detail.map((d) => d.msg).join(", ");
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid =
    leaveTypeId &&
    startDate &&
    endDate &&
    startDate <= endDate &&
    endDate >= todayStr &&
    reason.trim().length >= 10 &&
    reason.trim().length <= 500 &&
    (!selectedType?.requires_attachment || attachmentUrl) &&
    preview &&
    preview.working_days > 0;

  return (
    <>
      <Dialog
        open={open}
        onClose={submitting ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            p: 1,
            fontFamily: "'Inter', sans-serif",
            border: "1px solid #E2E8F0",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#1E293B", display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              bgcolor: "#1976D2",
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

        {submittedData ? (
          /* Success Card View */
          <DialogContent sx={{ py: 3, textAlign: "center" }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <CheckCircle size={56} color="#2E7D32" />
            </Box>
            <Typography variant="h6" fontWeight={800} color="#1E293B" gutterBottom>
              Leave Request Submitted Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Your application has been logged and forwarded to your reporting manager for approval.
            </Typography>

            <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#F8FAFC", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "left", mb: 3 }}>
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>LEAVE TYPE</Typography>
                  <Chip label={submittedData.leaveTypeName} color="primary" size="small" sx={{ fontWeight: 700 }} />
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>DATES</Typography>
                  <Typography variant="body2" fontWeight={700} color="#1E293B">
                    {submittedData.startDate} — {submittedData.endDate}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>WORKING DAYS</Typography>
                  <Typography variant="body2" fontWeight={800} color="#1976D2">
                    {submittedData.workingDays} Day(s)
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>STATUS</Typography>
                  <Chip label={submittedData.status} color="warning" size="small" sx={{ fontWeight: 700 }} />
                </Box>
              </Stack>
            </Paper>

            <Button
              variant="contained"
              fullWidth
              onClick={onClose}
              sx={{
                py: 1.2,
                borderRadius: "12px",
                bgcolor: "#1976D2",
                fontWeight: 700,
                textTransform: "none",
                "&:hover": { bgcolor: "#1565C0" },
              }}
            >
              Done
            </Button>
          </DialogContent>
        ) : (
          /* Leave Application Form */
          <form onSubmit={handlePreSubmit}>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
              {errorMsg && (
                <Alert severity="error" sx={{ borderRadius: "12px" }}>
                  {errorMsg}
                </Alert>
              )}

              {/* Leave Type Selector */}
              <TextField
                select
                fullWidth
                label="Leave Type"
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                required
                error={!!fieldErrors.leaveTypeId}
                helperText={selectedType?.description || fieldErrors.leaveTypeId}
              >
                {availableLeaveTypes.map((t) => {
                  const id = t._id || t.id;
                  return (
                    <MenuItem key={id} value={id}>
                      <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
                        <Typography variant="body2" fontWeight={600}>{t.name}</Typography>
                        {t.requires_attachment && (
                          <Chip label="Doc Required" size="small" color="warning" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }} />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>

              {/* Leave Duration Option: Full Day vs Half Day */}
              <FormControl component="fieldset">
                <FormLabel component="legend" sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#475569", mb: 0.5 }}>
                  Leave Duration Type
                </FormLabel>
                <RadioGroup
                  row
                  value={isHalfDay ? "half" : "full"}
                  onChange={(e) => {
                    const isHalf = e.target.value === "half";
                    setIsHalfDay(isHalf);
                    if (isHalf) setEndDate(startDate);
                  }}
                >
                  <FormControlLabel value="full" control={<Radio size="small" color="primary" />} label={<Typography variant="body2" fontWeight={600}>Full Day</Typography>} />
                  <FormControlLabel value="half" control={<Radio size="small" color="primary" />} label={<Typography variant="body2" fontWeight={600}>Half Day (0.5 Day)</Typography>} />
                </RadioGroup>
              </FormControl>

              {isHalfDay && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    label="Half Day Session"
                    value={halfDaySession}
                    onChange={(e) => setHalfDaySession(e.target.value)}
                  >
                    <MenuItem value="First Half">First Half (Morning Session)</MenuItem>
                    <MenuItem value="Second Half">Second Half (Afternoon Session)</MenuItem>
                  </TextField>
                </Paper>
              )}

              {/* Date Selection Row */}
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
                  error={!!fieldErrors.startDate}
                  helperText={fieldErrors.startDate}
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
                  error={!!fieldErrors.endDate}
                  helperText={fieldErrors.endDate}
                />
              </Stack>

              {/* Real-Time Duration & Balance Preview Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: "14px",
                  bgcolor: preview && preview.working_days > 0 ? "#F0F9FF" : "#FEF2F2",
                  border: `1px solid ${preview && preview.working_days > 0 ? "#BAE6FD" : "#FCA5A5"}`,
                }}
              >
                {calcLoading ? (
                  <Box display="flex" alignItems="center" gap={1.5} py={1}>
                    <CircularProgress size={18} color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      Calculating working days and remaining balance...
                    </Typography>
                  </Box>
                ) : preview ? (
                  <Stack spacing={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={800} color="#0369A1">
                        Leave Duration
                      </Typography>
                      <Typography variant="body1" fontWeight={900} color="#0284C7">
                        {preview.working_days} working day(s)
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 0.5, borderColor: "#E0F2FE" }} />

                    <Stack spacing={0.5}>
                      {preview.weekends_excluded > 0 && (
                        <Typography variant="caption" color="#0369A1" display="flex" alignItems="center" gap={0.5}>
                          <Info size={13} /> Weekend days excluded: <strong>{preview.weekends_excluded}</strong>
                        </Typography>
                      )}
                      {preview.holidays_excluded > 0 && (
                        <Typography variant="caption" color="#0369A1" display="flex" alignItems="center" gap={0.5}>
                          <Info size={13} /> Company holidays excluded: <strong>{preview.holidays_excluded}</strong>
                        </Typography>
                      )}
                      {preview.remaining_balance !== null && (
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                          <Typography variant="caption" color="#0369A1" fontWeight={600}>
                            Remaining balance: <strong>{preview.remaining_balance} day(s)</strong>
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            color={preview.balance_after_request < 0 && !selectedType?.allow_negative_balance ? "#DC2626" : "#0369A1"}
                          >
                            After this request: <strong>{preview.balance_after_request} day(s)</strong>
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="#B91C1C" display="flex" alignItems="center" gap={1}>
                    <AlertCircle size={16} /> Select valid working dates to calculate leave duration.
                  </Typography>
                )}
              </Paper>

              {/* Reason Field with Real-Time Character Counter */}
              <Box>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  label="Reason for Leave"
                  placeholder="Provide a detailed explanation for your leave request (min 10 chars)..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (fieldErrors.reason) {
                      setFieldErrors((prev) => ({ ...prev, reason: "" }));
                    }
                  }}
                  required
                  error={!!fieldErrors.reason}
                  helperText={fieldErrors.reason}
                />
                <Box display="flex" justifyContent="flex-end" mt={0.5}>
                  <Typography
                    variant="caption"
                    color={reason.length > 500 || (reason.length > 0 && reason.length < 10) ? "error" : "text.secondary"}
                    fontWeight={600}
                  >
                    {reason.length}/500
                  </Typography>
                </Box>
              </Box>

              {/* File Attachment Upload (Conditional) */}
              {(selectedType?.requires_attachment || attachmentUrl) && (
                <Paper elevation={0} sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                  <Typography variant="body2" fontWeight={700} color="#1E293B" mb={1} display="flex" alignItems="center" gap={1}>
                    <FileText size={16} color="#1976D2" />
                    Medical Certificate / Supporting Document {selectedType?.requires_attachment && <span style={{ color: "#DC2626" }}>*</span>}
                  </Typography>

                  {attachmentUrl ? (
                    <Box display="flex" justifyContent="space-between" alignItems="center" p={1.5} sx={{ borderRadius: "8px", bgcolor: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                      <Typography variant="caption" fontWeight={600} color="#1E293B" noWrap sx={{ maxWidth: 300 }}>
                        {attachmentName || "Attached Document"}
                      </Typography>
                      <Button size="small" color="error" onClick={() => { setAttachmentUrl(""); setAttachmentName(""); }}>
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      disabled={uploading}
                      startIcon={uploading ? <CircularProgress size={16} /> : <Upload size={16} />}
                      sx={{ textTransform: "none", borderRadius: "8px" }}
                    >
                      {uploading ? "Uploading..." : "Upload Document (PDF, JPG, PNG)"}
                      <input type="file" hidden accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} />
                    </Button>
                  )}
                  {fieldErrors.attachment && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                      {fieldErrors.attachment}
                    </Typography>
                  )}
                </Paper>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button onClick={onClose} disabled={submitting} sx={{ color: "#64748B", textTransform: "none", fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || calcLoading || !isFormValid}
                sx={{
                  borderRadius: "12px",
                  px: 3.5,
                  py: 1,
                  bgcolor: "#1976D2",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1565C0", boxShadow: "none" },
                }}
              >
                {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Application"}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Confirmation Prompt Dialog for Requests >= 3 days */}
      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Leave Application</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are applying for <strong>{preview?.working_days} working day(s)</strong> of <strong>{selectedType?.name}</strong> from <strong>{startDate}</strong> to <strong>{endDate}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to submit this request?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowConfirm(false)} disabled={submitting} sx={{ textTransform: "none" }}>
            Review
          </Button>
          <Button
            onClick={executeSubmit}
            variant="contained"
            disabled={submitting}
            sx={{ bgcolor: "#1976D2", borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
          >
            {submitting ? <CircularProgress size={18} color="inherit" /> : "Confirm & Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
