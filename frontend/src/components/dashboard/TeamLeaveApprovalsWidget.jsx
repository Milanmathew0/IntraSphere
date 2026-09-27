import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
import { IconButton } from "@mui/material";

import api from "../../api/axios";

export default function TeamLeaveApprovalsWidget({ showToast }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/v1/leave-requests/pending-approvals");
      setLeaveRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching pending approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    // Auto-refresh every 10 seconds for real-time leave approval tracking
    const interval = setInterval(() => {
      fetchPendingApprovals();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/api/v1/leave-requests/${id}/approve`, { approval_comment: "Approved from dashboard" });
      setLeaveRequests(leaveRequests.filter((item) => item._id !== id));
      if (showToast) {
        showToast("Employee leave application approved!", "success");
      }
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.detail || "Approval failed", "error");
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (!reason || !reason.trim()) return;

    try {
      await api.patch(`/api/v1/leave-requests/${id}/reject`, { rejection_reason: reason.trim() });
      setLeaveRequests(leaveRequests.filter((item) => item._id !== id));
      if (showToast) {
        showToast("Leave application rejected.", "info");
      }
    } catch (err) {
      if (showToast) {
        showToast(err.response?.data?.detail || "Rejection failed", "error");
      }
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E4E4E7",
        bgcolor: "#FFFFFF",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#09090B">
                Team Leave Requests
              </Typography>
              <Typography variant="caption" color="#71717A">
                Review & approve incoming leave applications
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              size="small"
              onClick={fetchPendingApprovals}
              disabled={loading}
              sx={{ border: "1px solid #E4E4E7", borderRadius: "8px", p: 0.8, color: "#09090B" }}
            >
              <RotateCw size={15} className={loading ? "animate-spin" : ""} />
            </IconButton>

            <Chip
              label={`${leaveRequests.length} Pending`}
              size="small"
              sx={{
                bgcolor: "#F4F4F5",
                color: "#09090B",
                border: "1px solid #E4E4E7",
                fontWeight: 700,
                fontSize: "0.75rem",
                borderRadius: "6px"
              }}
            />
          </Stack>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {leaveRequests.length === 0 ? (
          <Box
            p={4}
            textAlign="center"
            sx={{ borderRadius: "12px", bgcolor: "#F8FAFC", border: "1px dashed #CBD5E1", my: "auto" }}
          >
            <CheckCircle2 size={36} color="#F97316" style={{ marginBottom: 8 }} />
            <Typography variant="subtitle2" fontWeight={700} color="#1E293B">
              No Pending Leave Requests
            </Typography>
            <Typography variant="caption" color="#64748B">
              All employee leave applications have been reviewed.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            {/* Table Header Bar (Monochrome Aligned) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1.5fr 2fr 1fr 1fr", sm: "2.2fr 2.8fr 2fr 1.8fr" },
                px: 2,
                py: 1.5,
                bgcolor: "#F4F4F5",
                border: "1px solid #E4E4E7",
                borderRadius: "8px",
                mb: 1,
                alignItems: "center"
              }}
            >
              <Typography variant="caption" fontWeight={800} color="#09090B">
                Applicant Name
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#09090B">
                Leave Type & Dates
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#09090B">
                Reason
              </Typography>
              <Typography variant="caption" fontWeight={800} color="#09090B" textAlign="right">
                Operate
              </Typography>
            </Box>

            {/* Table Rows (Monochrome Aligned) */}
            <Stack spacing={0} sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 320 }}>
              {leaveRequests.map((req) => (
                <Box
                  key={req._id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1.5fr 2fr 1fr 1fr", sm: "2.2fr 2.8fr 2fr 1.8fr" },
                    px: 2,
                    py: 1.75,
                    borderBottom: "1px solid #E4E4E7",
                    alignItems: "center",
                    transition: "background-color 0.15s ease",
                    "&:hover": { bgcolor: "#FAFAFA" }
                  }}
                >
                  {/* Member Name */}
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: "#09090B", color: "#FFFFFF", width: 34, height: 34, fontSize: "0.85rem", fontWeight: 800 }}>
                      {(req.employee_name || "E").charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={800} color="#09090B" lineHeight={1.2}>
                        {req.employee_name}
                      </Typography>
                      <Typography variant="caption" color="#71717A">
                        {req.department}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Type & Dates */}
                  <Box display="flex" flexDirection="column" gap={0.5} justifyContent="center">
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Chip
                        label={req.leave_type_name}
                        size="small"
                        sx={{
                          bgcolor: "#F4F4F5",
                          color: "#09090B",
                          border: "1px solid #E4E4E7",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          borderRadius: "4px",
                          height: "22px"
                        }}
                      />
                      <Typography variant="caption" color="#09090B" fontWeight={700}>
                        ({req.total_days}d)
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="#71717A" fontWeight={600}>
                      {req.start_date} → {req.end_date}
                    </Typography>
                  </Box>

                  {/* Reason */}
                  <Typography variant="caption" color="#09090B" fontWeight={500} sx={{ fontStyle: "italic", pr: 1, noWrap: true, textOverflow: "ellipsis", overflow: "hidden" }}>
                    "{req.reason}"
                  </Typography>

                  {/* Action Buttons */}
                  <Box display="flex" gap={1} justifyContent="flex-end" alignItems="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleApprove(req._id)}
                      sx={{
                        borderRadius: "6px",
                        bgcolor: "#09090B",
                        color: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "none",
                        px: 1.75,
                        py: 0.5,
                        minWidth: 0,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#27272A", boxShadow: "none" }
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReject(req._id)}
                      sx={{
                        borderRadius: "6px",
                        borderColor: "#09090B",
                        color: "#09090B",
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "none",
                        px: 1.75,
                        py: 0.5,
                        minWidth: 0,
                        "&:hover": { bgcolor: "#F4F4F5", borderColor: "#09090B" }
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Pagination Footer (Monochrome) */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                pt: 2,
                mt: "auto",
                borderTop: "1px solid #E4E4E7"
              }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <IconButton size="small" sx={{ border: "1px solid #E4E4E7", borderRadius: "6px", p: 0.5 }}>
                  <ChevronLeft size={14} color="#09090B" />
                </IconButton>
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "6px",
                    bgcolor: "#09090B",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  1
                </Box>
                <IconButton size="small" sx={{ border: "1px solid #E4E4E7", borderRadius: "6px", p: 0.5 }}>
                  <ChevronRight size={14} color="#09090B" />
                </IconButton>
              </Stack>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

