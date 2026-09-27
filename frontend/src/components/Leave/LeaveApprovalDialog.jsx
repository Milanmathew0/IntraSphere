import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Alert,
  Chip,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { UserCheck, CheckCircle2, XCircle, FileText, Calendar, User } from "lucide-react";
import api from "../../api/axios";

export default function LeaveApprovalDialog({ open, onClose, request, onSuccess }) {
  const [actionType, setActionType] = useState("approve"); // "approve" | "reject"
  const [comment, setComment] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!request) return null;

  const handleAction = async () => {
    setErrorMsg("");
    if (actionType === "reject" && !rejectionReason.trim()) {
      setErrorMsg("A valid rejection reason is required.");
      return;
    }

    setSubmitting(true);

    try {
      if (actionType === "approve") {
        await api.patch(`/api/v1/leave-requests/${request._id}/approve`, {
          approval_comment: comment.trim() || "Approved",
        });
      } else {
        await api.patch(`/api/v1/leave-requests/${request._id}/reject`, {
          rejection_reason: rejectionReason.trim(),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || `Failed to ${actionType} request.`);
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
      <DialogTitle sx={{ fontWeight: 800, color: "#0F172A", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "12px",
            bgcolor: "#E8F0FE",
            color: "#C2410C",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserCheck size={22} />
        </Box>
        Review Leave Request
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {errorMsg}
          </Alert>
        )}

        {/* Applicant Overview Card */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: "16px", bgcolor: "#FAFAFA", border: "1px solid #E4E4E7" }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#09090B">
                {request.employee_name}
              </Typography>
              <Typography variant="caption" color="#71717A" fontWeight={600}>
                {request.employee_code} • {request.department}
              </Typography>
            </Box>
            <Chip
              label={`${request.total_days} Day(s)`}
              sx={{ bgcolor: "#09090B", color: "#FFFFFF", fontWeight: 800, fontSize: "0.85rem" }}
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Stack spacing={1.2}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="#71717A">
                Leave Category:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="#09090B">
                {request.leave_type_name} {request.is_half_day ? `(${request.half_day_session} Half-Day)` : ""}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="#71717A">
                Dates Requested:
              </Typography>
              <Typography variant="body2" fontWeight={700} color="#09090B">
                {request.start_date} to {request.end_date}
              </Typography>
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="#71717A">
                Applicant Remaining Balance:
              </Typography>
              <Typography variant="body2" fontWeight={800} color="#09090B">
                {request.remaining_balance ?? "N/A"} day(s) remaining
              </Typography>
            </Box>

            {request.reason && (
              <Box mt={1}>
                <Typography variant="caption" color="#71717A" fontWeight={600} display="block">
                  Reason for Request:
                </Typography>
                <Typography variant="body2" color="#09090B" sx={{ fontStyle: "italic", mt: 0.3 }}>
                  "{request.reason}"
                </Typography>
              </Box>
            )}

            {request.attachment_url && (
              <Box mt={1}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FileText size={14} />}
                  href={`http://localhost:8000${request.attachment_url}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700, color: "#09090B", borderColor: "#E4E4E7" }}
                >
                  View Attached Document
                </Button>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Action Toggle Buttons */}
        <Box display="flex" gap={2}>
          <Button
            fullWidth
            variant={actionType === "approve" ? "contained" : "outlined"}
            startIcon={<CheckCircle2 size={18} />}
            onClick={() => setActionType("approve")}
            sx={{
              borderRadius: "12px",
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: actionType === "approve" ? "#09090B" : "#FFFFFF",
              color: actionType === "approve" ? "#FFFFFF" : "#09090B",
              borderColor: "#09090B",
              "&:hover": { bgcolor: actionType === "approve" ? "#27272A" : "#F4F4F5" }
            }}
          >
            Approve Request
          </Button>

          <Button
            fullWidth
            variant={actionType === "reject" ? "contained" : "outlined"}
            startIcon={<XCircle size={18} />}
            onClick={() => setActionType("reject")}
            sx={{
              borderRadius: "12px",
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              bgcolor: actionType === "reject" ? "#27272A" : "#FFFFFF",
              color: actionType === "reject" ? "#FFFFFF" : "#09090B",
              borderColor: "#27272A",
              "&:hover": { bgcolor: actionType === "reject" ? "#3F3F46" : "#F4F4F5" }
            }}
          >
            Reject Request
          </Button>
        </Box>

        {/* Action Form Inputs */}
        {actionType === "approve" ? (
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Approval Comment (Optional)"
            placeholder="e.g. Approved. Have a smooth leave."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        ) : (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (Required)"
            placeholder="Explain why this request is being rejected..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            error={!rejectionReason.trim()}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} disabled={submitting} sx={{ color: "#64748B", textTransform: "none", fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          onClick={handleAction}
          variant="contained"
          color={actionType === "approve" ? "success" : "error"}
          disabled={submitting || (actionType === "reject" && !rejectionReason.trim())}
          sx={{ borderRadius: "12px", px: 3.5, py: 1, fontWeight: 800, textTransform: "none" }}
        >
          {submitting ? <CircularProgress size={20} color="inherit" /> : actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
