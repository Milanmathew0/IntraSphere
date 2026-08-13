import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
  RotateCw,
} from "lucide-react";
import api from "../../api/axios";

export function LeaveApplicationCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Leave Types & Data from Backend
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState("");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("2026-12-11");
  const [endDate, setEndDate] = useState("2026-12-12");
  const [reason, setReason] = useState("");

  // Leave Applications List
  const [leaveData, setLeaveData] = useState([
    {
      id: "1",
      leaveType: "Leave",
      startDate: "11/12/2026",
      endDate: "12/12/2026",
      duration: "14 hours",
      status: "Approved",
      statusColor: "#10B981",
    },
    {
      id: "2",
      leaveType: "Leave",
      startDate: "02/01/2027",
      endDate: "05/01/2027",
      duration: "-",
      status: "Pending",
      statusColor: "#F59E0B",
    },
    {
      id: "3",
      leaveType: "Leave",
      startDate: "06/02/2027",
      endDate: "07/02/2027",
      duration: "5 hours",
      status: "Approved",
      statusColor: "#10B981",
    },
  ]);

  // Format Helper: ISO date string to DD/MM/YYYY
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // Status Color Mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#10B981"; // Green
      case "Pending":
        return "#F59E0B"; // Amber
      case "Declined":
      case "Rejected":
        return "#3B82F6"; // Blue/Red
      case "Cancelled":
        return "#71717A"; // Gray
      default:
        return "#F59E0B";
    }
  };

  // Fetch Leave Types & Employee's My Leave Requests from Backend
  const fetchLeaveData = async () => {
    setLoading(true);
    try {
      // 1. Fetch available leave types
      const typesRes = await api.get("/api/v1/leave-requests/types/");
      const fetchedTypes = (typesRes.data || []).filter((t) => {
        const name = t.name?.toLowerCase() || "";
        return !name.includes("unpaid") && !name.includes("earned");
      });
      setLeaveTypes(fetchedTypes);
      if (fetchedTypes.length > 0) {
        setSelectedLeaveTypeId(fetchedTypes[0]._id || fetchedTypes[0].id);
        setLeaveType(fetchedTypes[0].name);
      }

      // 2. Fetch employee's leave requests from MongoDB
      const requestsRes = await api.get("/api/v1/leave-requests/my");
      const backendRequests = requestsRes.data || [];

      if (backendRequests.length > 0) {
        const mapped = backendRequests.map((req) => ({
          id: req.id || req._id,
          leaveType: req.leave_type_name || req.leave_type || "Leave",
          startDate: formatDateDisplay(req.start_date),
          endDate: formatDateDisplay(req.end_date),
          duration: req.total_days ? `${req.total_days} day(s)` : "-",
          status: req.status || "Pending",
          statusColor: getStatusColor(req.status),
        }));
        setLeaveData(mapped);
      }
    } catch (err) {
      console.warn("Using offline leave data fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleOpenModal = (row = null) => {
    setErrorMessage("");
    if (row) {
      setEditingId(row.id);
      setLeaveType(row.leaveType || "Casual Leave");
    } else {
      setEditingId(null);
      if (leaveTypes.length > 0) {
        setSelectedLeaveTypeId(leaveTypes[0]._id || leaveTypes[0].id);
        setLeaveType(leaveTypes[0].name);
      }
    }
    setIsModalOpen(true);
  };

  const handleSaveLeave = async () => {
    setErrorMessage("");
    setSubmitting(true);

    try {
      // Find matching leave type ObjectId
      const targetType =
        leaveTypes.find(
          (t) => (t._id || t.id) === selectedLeaveTypeId || t.name === leaveType
        ) || leaveTypes[0];

      const typeIdToUse = targetType ? targetType._id || targetType.id : null;

      if (typeIdToUse) {
        // Send real API request to backend so MongoDB stores it for Manager Approval!
        const payload = {
          leave_type_id: typeIdToUse,
          start_date: startDate,
          end_date: endDate,
          is_half_day: false,
          reason: reason.trim() || "Leave Application",
        };

        await api.post("/api/v1/leave-requests/", payload);
        // Refresh data from server
        await fetchLeaveData();
        setIsModalOpen(false);
      } else {
        // Fallback local update if no backend type found
        const newItem = {
          id: String(Date.now()),
          leaveType: leaveType || "Leave",
          startDate: startDate.split("-").reverse().join("/"),
          endDate: endDate.split("-").reverse().join("/"),
          duration: "1 day(s)",
          status: "Pending",
          statusColor: "#F59E0B",
        };
        setLeaveData((prev) => [newItem, ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      const detail =
        err.response?.data?.detail || "Failed to submit leave application.";
      setErrorMessage(detail);

      // Fallback local optimistic append on error
      const newItem = {
        id: String(Date.now()),
        leaveType: leaveType || "Leave",
        startDate: startDate.split("-").reverse().join("/"),
        endDate: endDate.split("-").reverse().join("/"),
        duration: "1 day(s)",
        status: "Pending",
        statusColor: "#F59E0B",
      };
      setLeaveData((prev) => [newItem, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id) => {
    try {
      await api.patch(`/api/v1/leave-requests/${id}/cancel`, {
        cancellation_reason: "Cancelled by employee",
      });
      await fetchLeaveData();
    } catch (err) {
      setLeaveData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E4E4E7",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Header Row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h6" fontWeight={800} color="#09090B">
              Leave Applications
            </Typography>
            <Typography variant="caption" color="#71717A">
              Submit requests and track leave approval history
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              onClick={fetchLeaveData}
              disabled={loading}
              sx={{ border: "1px solid #E4E4E7", borderRadius: "8px", p: 1 }}
            >
              <RotateCw size={16} className={loading ? "animate-spin" : ""} />
            </IconButton>

            <Button
              variant="contained"
              onClick={() => handleOpenModal()}
              startIcon={<Plus size={16} />}
              sx={{
                borderRadius: "8px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                fontWeight: 700,
                textTransform: "none",
                px: 2.5,
                py: 1,
                boxShadow: "none",
                "&:hover": { bgcolor: "#27272A", boxShadow: "none" },
              }}
            >
              Apply for Leave
            </Button>
          </Stack>
        </Stack>

        {/* Leave Applications Table View (Matching Screenshot 2) */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #E4E4E7",
            borderRadius: "12px",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: "#FAFAFA" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#09090B", py: 1.8, fontSize: "13px" }}>
                  Leave Type
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#09090B", py: 1.8, fontSize: "13px" }}>
                  Start Date
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#09090B", py: 1.8, fontSize: "13px" }}>
                  End Date
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#09090B", py: 1.8, fontSize: "13px" }}>
                  Duration
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#09090B", py: 1.8, fontSize: "13px" }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: "#09090B", py: 1.8, fontSize: "13px" }}>
                  Edit/Delete
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} sx={{ color: "#09090B" }} />
                  </TableCell>
                </TableRow>
              ) : leaveData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <FileSpreadsheet size={40} color="#71717A" />
                      <Typography variant="subtitle2" color="#71717A" mt={1}>
                        No leave application records found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                leaveData.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      "&:hover": { bgcolor: "#FAFAFA" },
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: "#09090B", fontSize: "14px" }}>
                      {row.leaveType}
                    </TableCell>

                    <TableCell sx={{ color: "#27272A", fontSize: "14px" }}>
                      {row.startDate}
                    </TableCell>

                    <TableCell sx={{ color: "#27272A", fontSize: "14px" }}>
                      {row.endDate}
                    </TableCell>

                    <TableCell sx={{ color: "#27272A", fontSize: "14px" }}>
                      {row.duration}
                    </TableCell>

                    <TableCell sx={{ fontSize: "14px" }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: row.statusColor,
                          }}
                        />
                        <Typography variant="body2" fontWeight={600} color="#09090B">
                          {row.status}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenModal(row)}
                          sx={{
                            color: "#52525B",
                            p: 0.8,
                            "&:hover": { bgcolor: "#F4F4F5", color: "#09090B" },
                          }}
                        >
                          <Edit3 size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLeave(row.id)}
                          sx={{
                            color: "#52525B",
                            p: 0.8,
                            "&:hover": { bgcolor: "#F4F4F5", color: "#09090B" },
                          }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal: Apply / Edit Leave */}
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: "16px", p: 1 },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: "#09090B", pb: 1 }}>
            {editingId ? "Edit Leave Application" : "Apply for Leave"}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2.5} pt={1}>
              {errorMessage && (
                <Alert severity="error" sx={{ borderRadius: "8px" }}>
                  {errorMessage}
                </Alert>
              )}

              <TextField
                select
                fullWidth
                size="small"
                label="Leave Type"
                value={selectedLeaveTypeId || leaveType}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedLeaveTypeId(val);
                  const found = leaveTypes.find((t) => (t._id || t.id) === val);
                  if (found) setLeaveType(found.name);
                }}
              >
                {leaveTypes.length > 0 ? (
                  leaveTypes.map((t) => (
                    <MenuItem key={t._id || t.id} value={t._id || t.id}>
                      {t.name}
                    </MenuItem>
                  ))
                ) : (
                  [
                    <MenuItem key="casual" value="Casual Leave">Casual Leave</MenuItem>,
                    <MenuItem key="sick" value="Sick Leave">Sick Leave</MenuItem>,
                  ]
                )}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                label="Reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              onClick={() => setIsModalOpen(false)}
              variant="outlined"
              sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600, borderColor: "#09090B", color: "#09090B" }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSaveLeave}
              disabled={submitting}
              variant="contained"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#09090B",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "#27272A" },
              }}
            >
              {submitting ? <CircularProgress size={20} sx={{ color: "#FFF" }} /> : "Submit Application"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default LeaveApplicationCard;
