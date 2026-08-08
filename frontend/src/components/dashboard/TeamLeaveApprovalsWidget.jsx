import React, { useState } from "react";
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
  Clock,
  User,
} from "lucide-react";

export default function TeamLeaveApprovalsWidget({ showToast }) {
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "leave-1",
      employeeName: "David Chen",
      role: "DevOps Engineer",
      leaveType: "Annual Leave",
      dates: "Aug 12 - Aug 14, 2026 (3 Days)",
      reason: "Personal family event & travel.",
      status: "pending",
    },
    {
      id: "leave-2",
      employeeName: "Elena Rostova",
      role: "QA Specialist",
      leaveType: "Casual Leave",
      dates: "Aug 18, 2026 (1 Day)",
      reason: "Medical appointment & checkup.",
      status: "pending",
    },
  ]);

  const handleApprove = (id) => {
    setLeaveRequests(leaveRequests.filter((item) => item.id !== id));
    if (showToast) {
      showToast("Employee leave application approved!", "success");
    }
  };

  const handleReject = (id) => {
    setLeaveRequests(leaveRequests.filter((item) => item.id !== id));
    if (showToast) {
      showToast("Leave application rejected.", "info");
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "rgba(147, 51, 234, 0.1)",
                color: "#7E22CE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                Team Leave Approvals
              </Typography>
              <Typography variant="caption" color="#64748B">
                Review & approve employee leave requests
              </Typography>
            </Box>
          </Box>

          <Chip
            label={`${leaveRequests.length} Pending`}
            size="small"
            sx={{
              bgcolor: leaveRequests.length > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
              color: leaveRequests.length > 0 ? "#D97706" : "#15803D",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {leaveRequests.length === 0 ? (
          <Box
            p={3}
            borderRadius="16px"
            textAlign="center"
            sx={{ bgcolor: "#F1F5F9", border: "1px dashed #CBD5E1", my: "auto" }}
          >
            <CheckCircle2 size={36} color="#15803D" style={{ marginBottom: 8 }} />
            <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
              No Pending Leave Requests
            </Typography>
            <Typography variant="caption" color="#64748B">
              All employee leave applications have been reviewed.
            </Typography>
          </Box>
        ) : (
          <Stack
            spacing={2}
            sx={{
              overflowY: "auto",
              maxHeight: 320,
              pr: 0.8,
              "&::-webkit-scrollbar": { width: "5px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "4px" },
            }}
          >
            {leaveRequests.map((req) => (
              <Box
                key={req.id}
                p={2}
                borderRadius="16px"
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.03)",
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ bgcolor: "#7E22CE", width: 32, height: 32, fontSize: "0.8rem", fontWeight: 700 }}>
                      {req.employeeName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                        {req.employeeName}
                      </Typography>
                      <Typography variant="caption" color="#64748B">
                        {req.role}
                      </Typography>
                    </Box>
                  </Box>

                  <Chip
                    label={req.leaveType}
                    size="small"
                    sx={{ bgcolor: "rgba(147, 51, 234, 0.1)", color: "#7E22CE", fontWeight: 600, fontSize: "0.7rem" }}
                  />
                </Box>

                {/* Dates & Reason */}
                <Typography variant="caption" color="#10B981" fontWeight={700} display="block" mb={0.5}>
                  Dates: {req.dates}
                </Typography>

                <Typography
                  variant="caption"
                  color="#475569"
                  sx={{
                    display: "block",
                    fontStyle: "italic",
                    bgcolor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    p: 1,
                    borderRadius: "8px",
                    mb: 1.5,
                    fontSize: "0.73rem",
                  }}
                >
                  "{req.reason}"
                </Typography>

                {/* Action Buttons Side-by-Side */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "nowrap" }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<CheckCircle2 size={15} />}
                    onClick={() => handleApprove(req.id)}
                    sx={{
                      borderRadius: "12px",
                      background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "0.78rem",
                      py: 0.7,
                      px: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                      },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    startIcon={<XCircle size={15} />}
                    onClick={() => handleReject(req.id)}
                    sx={{
                      borderRadius: "12px",
                      color: "#EF4444",
                      borderColor: "rgba(239, 68, 68, 0.3)",
                      fontWeight: 700,
                      textTransform: "none",
                      fontSize: "0.78rem",
                      py: 0.7,
                      px: 1,
                      minWidth: 0,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        bgcolor: "rgba(239, 68, 68, 0.08)",
                        borderColor: "#EF4444",
                      },
                    }}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
