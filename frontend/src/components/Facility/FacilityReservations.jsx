import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Box,
  Typography,
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
  MenuItem,
  CircularProgress,
  Alert,
  Checkbox,
  Popover,
  IconButton,
  Tooltip,
  Divider,
  Menu,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";

import api from "../../api/axios";

export default function FacilityReservations({ onRefreshStats }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Sort Menu state
  const [sortAnchorEl, setSortAnchorEl] = useState(null);

  // "Approve as" Popover state
  const [approveAnchorEl, setApproveAnchorEl] = useState(null);
  const [activeResForApprove, setActiveResForApprove] = useState(null);

  // View Details Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedResForView, setSelectedResForView] = useState(null);

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedResForEdit, setSelectedResForEdit] = useState(null);
  const [editForm, setEditForm] = useState({
    purpose: "",
    notes: "",
    status: "Confirmed",
  });

  // Cancel / Delete Modal state
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [selectedResForCancel, setSelectedResForCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState({ type: "", text: "" });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (resourceTypeFilter !== "All") params.resource_type = resourceTypeFilter;

      const res = await api.get("/api/v1/facility/reservations", { params });
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to load facility reservations", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [search, resourceTypeFilter]);

  const showFeedback = (text, type = "success") => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg({ type: "", text: "" }), 4000);
  };

  // Sorted reservations
  const sortedReservations = useMemo(() => {
    const list = [...reservations];
    switch (sortBy) {
      case "newest":
        return list.sort((a, b) => new Date(b.start_time || 0) - new Date(a.start_time || 0));
      case "oldest":
        return list.sort((a, b) => new Date(a.start_time || 0) - new Date(b.start_time || 0));
      case "name_asc":
        return list.sort((a, b) => (a.employee_name || "").localeCompare(b.employee_name || ""));
      case "resource_asc":
        return list.sort((a, b) => (a.resource_name || "").localeCompare(b.resource_name || ""));
      case "status":
        return list.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
      default:
        return list;
    }
  }, [reservations, sortBy]);

  // Checkbox handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(sortedReservations.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Export CSV handler
  const handleExportCSV = () => {
    const rowsToExport =
      selectedIds.length > 0
        ? sortedReservations.filter((r) => selectedIds.includes(r.id))
        : sortedReservations;

    if (rowsToExport.length === 0) {
      showFeedback("No reservation records to export", "warning");
      return;
    }

    const headers = [
      "#",
      "Employee Name",
      "Email",
      "Department",
      "Resource",
      "Type",
      "Floor",
      "Building",
      "Start Time",
      "End Time",
      "Purpose",
      "Status",
    ];

    const csvRows = [
      headers.join(","),
      ...rowsToExport.map((r, idx) =>
        [
          idx + 1,
          `"${(r.employee_name || "").replace(/"/g, '""')}"`,
          `"${(r.employee_email || "").replace(/"/g, '""')}"`,
          `"${(r.department || "").replace(/"/g, '""')}"`,
          `"${(r.resource_name || "").replace(/"/g, '""')}"`,
          r.resource_type === "meeting_room" ? "Room" : "Desk",
          r.floor || 1,
          `"${(r.building || "").replace(/"/g, '""')}"`,
          `"${r.start_time || ""}"`,
          `"${r.end_time || ""}"`,
          `"${(r.purpose || "").replace(/"/g, '""')}"`,
          `"${r.status || ""}"`,
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `facility_reservations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback(`Exported ${rowsToExport.length} reservation(s) to CSV.`);
  };

  // "Approve as" Popover handlers
  const handleOpenApproveMenu = (event, resItem) => {
    setApproveAnchorEl(event.currentTarget);
    setActiveResForApprove(resItem);
  };

  const handleCloseApproveMenu = () => {
    setApproveAnchorEl(null);
    setActiveResForApprove(null);
  };

  const handleMarkStatus = async (newStatus) => {
    if (!activeResForApprove) return;
    const target = activeResForApprove;
    handleCloseApproveMenu();

    try {
      await api.patch(
        `/api/v1/facility/reservations/${target.id}/status`,
        {
          status: newStatus,
          cancellation_reason:
            newStatus === "Cancelled" ? "Cancelled by Facility Manager" : undefined,
        },
        { params: { resource_type: target.resource_type } }
      );

      showFeedback(`Reservation marked as ${newStatus}`);
      fetchReservations();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to update reservation status", "error");
    }
  };

  // View Modal handlers
  const handleOpenViewModal = (resItem) => {
    setSelectedResForView(resItem);
    setViewModalOpen(true);
  };

  // Edit Modal handlers
  const handleOpenEditModal = (resItem) => {
    setSelectedResForEdit(resItem);
    setEditForm({
      purpose: resItem.purpose || "",
      notes: resItem.notes || "",
      status: resItem.status || "Confirmed",
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedResForEdit) return;
    try {
      await api.patch(
        `/api/v1/facility/reservations/${selectedResForEdit.id}/status`,
        {
          status: editForm.status,
          purpose: editForm.purpose,
          notes: editForm.notes,
        },
        { params: { resource_type: selectedResForEdit.resource_type } }
      );
      showFeedback("Reservation details updated successfully!");
      setEditModalOpen(false);
      fetchReservations();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to update reservation", "error");
    }
  };

  // Cancel / Delete Modal handlers
  const handleOpenCancelModal = (resItem) => {
    setSelectedResForCancel(resItem);
    setCancelReason("");
    setOpenCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedResForCancel) return;
    try {
      await api.patch(
        `/api/v1/facility/reservations/${selectedResForCancel.id}/cancel`,
        { cancellation_reason: cancelReason.trim() || "Cancelled by Facility Policy" },
        {
          params: {
            resource_type: selectedResForCancel.resource_type,
          },
        }
      );

      showFeedback("Reservation cancelled successfully and user notified!");
      setOpenCancelModal(false);
      fetchReservations();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to cancel reservation", "error");
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!selectedResForCancel) return;
    try {
      await api.delete(`/api/v1/facility/reservations/${selectedResForCancel.id}`, {
        params: { resource_type: selectedResForCancel.resource_type },
      });
      showFeedback("Reservation record deleted permanently.");
      setOpenCancelModal(false);
      setSelectedIds((prev) => prev.filter((id) => id !== selectedResForCancel.id));
      fetchReservations();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      showFeedback(err.response?.data?.detail || "Failed to delete reservation", "error");
    }
  };

  const formatSchedule = (startStr, endStr) => {
    if (!startStr) return "—";
    const start = new Date(startStr);
    const startFmt = start.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
    if (!endStr) return startFmt;
    const end = new Date(endStr);
    const endTimeFmt = end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `${startFmt} - ${endTimeFmt}`;
  };

  return (
    <Box>
      {feedbackMsg.text && (
        <Alert
          severity={feedbackMsg.type || "info"}
          sx={{ mb: 2.5, borderRadius: "12px" }}
          onClose={() => setFeedbackMsg({ type: "", text: "" })}
        >
          {feedbackMsg.text}
        </Alert>
      )}

      {/* Main White Card Container */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "20px",
          border: "1px solid #F1F5F9",
          bgcolor: "#FFFFFF",
          boxShadow: "0 4px 24px rgba(15, 23, 42, 0.04)",
        }}
      >
        {/* Top Control Toolbar (Search left, Sort / Filter / Export right) */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          {/* Left Search Input */}
          <TextField
            size="small"
            placeholder="Search by name, email, resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#94A3B8", mr: 1, fontSize: 19 }} />,
            }}
            sx={{
              width: { xs: "100%", md: 320 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
                fontSize: "0.85rem",
                "& fieldset": { borderColor: "#E2E8F0" },
                "&:hover fieldset": { borderColor: "#CBD5E1" },
              },
            }}
          />

          {/* Right Action Controls */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {/* Resource Type Filter */}
            <TextField
              select
              size="small"
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              sx={{
                minWidth: 145,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#334155",
                  "& fieldset": { borderColor: "#E2E8F0" },
                },
              }}
            >
              <MenuItem value="All">All Resources</MenuItem>
              <MenuItem value="meeting_room">Meeting Rooms</MenuItem>
              <MenuItem value="workspace">Workspace Desks</MenuItem>
            </TextField>

            {/* Sort By Dropdown Button */}
            <Button
              variant="outlined"
              startIcon={<FilterListIcon sx={{ fontSize: "17px !important" }} />}
              endIcon={<KeyboardArrowDownIcon sx={{ fontSize: "17px !important" }} />}
              onClick={(e) => setSortAnchorEl(e.currentTarget)}
              sx={{
                textTransform: "none",
                color: "#1E293B",
                borderColor: "#E2E8F0",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2,
                py: 0.85,
                "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
              }}
            >
              Sort by
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={() => setSortAnchorEl(null)}
              PaperProps={{
                sx: {
                  borderRadius: "12px",
                  mt: 0.5,
                  minWidth: 185,
                  boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
                },
              }}
            >
              <MenuItem
                selected={sortBy === "newest"}
                onClick={() => {
                  setSortBy("newest");
                  setSortAnchorEl(null);
                }}
                sx={{ fontSize: "0.82rem", fontWeight: 500 }}
              >
                Date (Newest first)
              </MenuItem>
              <MenuItem
                selected={sortBy === "oldest"}
                onClick={() => {
                  setSortBy("oldest");
                  setSortAnchorEl(null);
                }}
                sx={{ fontSize: "0.82rem", fontWeight: 500 }}
              >
                Date (Oldest first)
              </MenuItem>
              <MenuItem
                selected={sortBy === "name_asc"}
                onClick={() => {
                  setSortBy("name_asc");
                  setSortAnchorEl(null);
                }}
                sx={{ fontSize: "0.82rem", fontWeight: 500 }}
              >
                Employee Name (A–Z)
              </MenuItem>
              <MenuItem
                selected={sortBy === "resource_asc"}
                onClick={() => {
                  setSortBy("resource_asc");
                  setSortAnchorEl(null);
                }}
                sx={{ fontSize: "0.82rem", fontWeight: 500 }}
              >
                Resource Name (A–Z)
              </MenuItem>
              <MenuItem
                selected={sortBy === "status"}
                onClick={() => {
                  setSortBy("status");
                  setSortAnchorEl(null);
                }}
                sx={{ fontSize: "0.82rem", fontWeight: 500 }}
              >
                Status
              </MenuItem>
            </Menu>

            {/* Export CSV Button */}
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: "18px !important" }} />}
              onClick={handleExportCSV}
              sx={{
                textTransform: "none",
                color: "#1E293B",
                borderColor: "#E2E8F0",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2,
                py: 0.85,
                "&:hover": { borderColor: "#CBD5E1", bgcolor: "#F8FAFC" },
              }}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>

        {/* Reservations Table */}
        {loading ? (
          <Box textAlign="center" py={6}>
            <CircularProgress sx={{ color: "#EA580C" }} />
          </Box>
        ) : sortedReservations.length === 0 ? (
          <Box
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: "14px",
              border: "1px dashed #CBD5E1",
              bgcolor: "#FAFAFA",
            }}
          >
            <EventNoteIcon sx={{ fontSize: 42, color: "#94A3B8", mb: 1 }} />
            <Typography variant="subtitle1" fontWeight={700} color="#475569">
              No Reservations Found
            </Typography>
            <Typography variant="caption" color="text.secondary">
              No meeting room bookings or desk reservations match your filters.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: "12px", border: "1px solid #F1F5F9" }}>
            <Table sx={{ minWidth: 960 }}>
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ borderBottom: "1px solid #F1F5F9" }}>
                    <Checkbox
                      size="small"
                      indeterminate={
                        selectedIds.length > 0 && selectedIds.length < sortedReservations.length
                      }
                      checked={
                        sortedReservations.length > 0 &&
                        selectedIds.length === sortedReservations.length
                      }
                      onChange={handleSelectAll}
                      sx={{ color: "#CBD5E1" }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                      width: 48,
                    }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Employee / Organizer
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Resource
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Type
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Location & Floor
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Date & Schedule
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Approve as
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 600,
                      color: "#64748B",
                      fontSize: "0.78rem",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedReservations.map((r, index) => {
                  const now = new Date();
                  const isCancelled = r.status === "Cancelled" || r.status === "Red";
                  const isPending = r.status === "Pending" || r.status === "Yellow";
                  const isEnded = r.end_time ? new Date(r.end_time) < now : false;
                  const isCompleted =
                    r.status === "Completed" || (isEnded && !isCancelled && !isPending);

                  // Status Chip styling
                  let statusLabel = r.status || "Confirmed";
                  let statusBg = "#DCFCE7";
                  let statusColor = "#15803D";

                  if (isCancelled) {
                    statusLabel = "Cancelled";
                    statusBg = "#FEE2E2";
                    statusColor = "#DC2626";
                  } else if (isPending) {
                    statusLabel = "Pending";
                    statusBg = "#FEF9C3";
                    statusColor = "#CA8A04";
                  } else if (isCompleted) {
                    statusLabel = "Completed";
                    statusBg = "#E0F2FE";
                    statusColor = "#0369A1";
                  } else {
                    statusLabel = "Confirmed";
                    statusBg = "#DCFCE7";
                    statusColor = "#15803D";
                  }

                  // "Approve as" dropdown button appearance (matching reference screenshot)
                  let approveBtnLabel = "Approve as";
                  let approveBtnBg = "#FFFFFF";
                  let approveBtnColor = "#334155";
                  let approveBtnBorder = "1px solid #E2E8F0";
                  let approveBtnHoverBg = "#F8FAFC";

                  if (isCancelled) {
                    approveBtnLabel = "Cancelled";
                    approveBtnBg = "#EF4444";
                    approveBtnColor = "#FFFFFF";
                    approveBtnBorder = "1px solid #EF4444";
                    approveBtnHoverBg = "#DC2626";
                  } else if (isPending) {
                    approveBtnLabel = "Pending";
                    approveBtnBg = "#F59E0B";
                    approveBtnColor = "#FFFFFF";
                    approveBtnBorder = "1px solid #F59E0B";
                    approveBtnHoverBg = "#D97706";
                  }

                  const isSelected = selectedIds.includes(r.id);

                  return (
                    <TableRow
                      key={r.id}
                      hover
                      selected={isSelected}
                      sx={{
                        "& td": { borderBottom: "1px solid #F8FAFC", py: 1.6 },
                        "&:hover": { bgcolor: "#FAFAFA" },
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => handleSelectRow(r.id)}
                          sx={{ color: "#CBD5E1" }}
                        />
                      </TableCell>

                      {/* Row Index # */}
                      <TableCell sx={{ color: "#475569", fontSize: "0.82rem", fontWeight: 500 }}>
                        {index + 1}
                      </TableCell>

                      {/* Employee / Organizer */}
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.84rem" }}>
                          {r.employee_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {r.employee_email} • {r.department}
                        </Typography>
                      </TableCell>

                      {/* Resource */}
                      <TableCell sx={{ fontWeight: 700, color: "#EA580C", fontSize: "0.84rem" }}>
                        {r.resource_name}
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <Chip
                          icon={
                            r.resource_type === "meeting_room" ? (
                              <MeetingRoomIcon sx={{ fontSize: "14px !important" }} />
                            ) : (
                              <DesktopWindowsIcon sx={{ fontSize: "14px !important" }} />
                            )
                          }
                          label={r.resource_type === "meeting_room" ? "Room" : "Desk"}
                          size="small"
                          sx={{
                            height: 23,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            bgcolor: "#FFF7ED",
                            color: r.resource_type === "meeting_room" ? "#EA580C" : "#C2410C",
                          }}
                        />
                      </TableCell>

                      {/* Location & Floor */}
                      <TableCell sx={{ color: "#334155", fontSize: "0.82rem" }}>
                        Floor {r.floor} • {r.building}
                      </TableCell>

                      {/* Date & Schedule */}
                      <TableCell sx={{ color: "#334155", fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                        {formatSchedule(r.start_time, r.end_time)}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        <Chip
                          label={statusLabel}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            borderRadius: "6px",
                            bgcolor: statusBg,
                            color: statusColor,
                          }}
                        />
                      </TableCell>

                      {/* Approve as Dropdown Button */}
                      <TableCell>
                        <Button
                          size="small"
                          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: "16px !important" }} />}
                          onClick={(e) => handleOpenApproveMenu(e, r)}
                          sx={{
                            textTransform: "none",
                            fontSize: "0.76rem",
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.5,
                            minWidth: 118,
                            justifyContent: "space-between",
                            bgcolor: approveBtnBg,
                            color: approveBtnColor,
                            border: approveBtnBorder,
                            boxShadow: "none",
                            "&:hover": {
                              bgcolor: approveBtnHoverBg,
                              border: approveBtnBorder,
                            },
                          }}
                        >
                          {approveBtnLabel}
                        </Button>
                      </TableCell>

                      {/* Actions (View, Edit, Delete) */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.8} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenViewModal(r)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                border: "1px solid #E2E8F0",
                                color: "#475569",
                                "&:hover": { bgcolor: "#F8FAFC", color: "#0F172A" },
                              }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Reservation">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditModal(r)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                border: "1px solid #E2E8F0",
                                color: "#475569",
                                "&:hover": { bgcolor: "#F8FAFC", color: "#0F172A" },
                              }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Cancel / Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenCancelModal(r)}
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: "8px",
                                border: "1px solid #FECACA",
                                color: "#EF4444",
                                "&:hover": { bgcolor: "#FEF2F2", color: "#DC2626" },
                              }}
                            >
                              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* "Approve as" Floating Popover Card (Mark as Green / Yellow / Red) */}
      <Popover
        open={Boolean(approveAnchorEl)}
        anchorEl={approveAnchorEl}
        onClose={handleCloseApproveMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            p: 1.2,
            mt: 0.5,
            borderRadius: "14px",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
            border: "1px solid #F1F5F9",
            minWidth: 165,
          },
        }}
      >
        <Stack spacing={1}>
          <Button
            fullWidth
            size="small"
            startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() => handleMarkStatus("Confirmed")}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "#16A34A",
              border: "1px solid #4ADE80",
              borderRadius: "8px",
              px: 1.5,
              py: 0.6,
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#F0FDF4", borderColor: "#22C55E" },
            }}
          >
            Mark as Confirmed
          </Button>

          <Button
            fullWidth
            size="small"
            startIcon={<CheckCircleOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() => handleMarkStatus("Pending")}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "#CA8A04",
              border: "1px solid #FACC15",
              borderRadius: "8px",
              px: 1.5,
              py: 0.6,
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#FEFCE8", borderColor: "#EAB308" },
            }}
          >
            Mark as Pending
          </Button>

          <Button
            fullWidth
            size="small"
            startIcon={<CancelOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() => handleMarkStatus("Cancelled")}
            sx={{
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.78rem",
              color: "#DC2626",
              border: "1px solid #F87171",
              borderRadius: "8px",
              px: 1.5,
              py: 0.6,
              bgcolor: "#FFFFFF",
              "&:hover": { bgcolor: "#FEF2F2", borderColor: "#EF4444" },
            }}
          >
            Mark as Cancelled
          </Button>
        </Stack>
      </Popover>

      {/* View Reservation Details Modal */}
      <Dialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
          Reservation Details
        </DialogTitle>
        <Divider />
        <DialogContent>
          {selectedResForView && (
            <Stack spacing={1.8} sx={{ mt: 0.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Employee / Organizer
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#0F172A">
                  {selectedResForView.employee_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedResForView.employee_email} • {selectedResForView.department}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Resource & Location
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#EA580C">
                  {selectedResForView.resource_name} (
                  {selectedResForView.resource_type === "meeting_room" ? "Meeting Room" : "Workspace Desk"}
                  )
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Floor {selectedResForView.floor} • {selectedResForView.building}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Date & Schedule
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#334155">
                  {formatSchedule(selectedResForView.start_time, selectedResForView.end_time)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Purpose
                </Typography>
                <Typography variant="body2" color="#334155">
                  {selectedResForView.purpose || "—"}
                </Typography>
              </Box>

              {selectedResForView.notes && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Notes
                  </Typography>
                  <Typography variant="body2" color="#334155">
                    {selectedResForView.notes}
                  </Typography>
                </Box>
              )}

              {selectedResForView.cancellation_reason && (
                <Box>
                  <Typography variant="caption" color="error" fontWeight={600}>
                    Cancellation Reason
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    {selectedResForView.cancellation_reason}
                  </Typography>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  Current Status
                </Typography>
                <Chip
                  label={selectedResForView.status}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setViewModalOpen(false)}
            variant="contained"
            sx={{
              bgcolor: "#0F172A",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              "&:hover": { bgcolor: "#1E293B" },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Reservation Modal */}
      <Dialog
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#0F172A" }}>
          Edit Reservation
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Purpose / Title"
              size="small"
              fullWidth
              value={editForm.purpose}
              onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
            />
            <TextField
              select
              label="Reservation Status"
              size="small"
              fullWidth
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </TextField>
            <TextField
              label="Notes / Remarks"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setEditModalOpen(false)}
            sx={{ textTransform: "none", color: "#64748B", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{
              bgcolor: "#EA580C",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "8px",
              "&:hover": { bgcolor: "#C2410C" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel / Delete Confirmation Dialog */}
      <Dialog
        open={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#DC2626" }}>
          Cancel or Remove Reservation
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="#64748B" mb={2}>
            Manage reservation for <strong>{selectedResForCancel?.resource_name}</strong> booked by{" "}
            <strong>{selectedResForCancel?.employee_name}</strong>:
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Cancellation Reason (Sent to Employee)"
            placeholder="e.g. Facility policy adjustment or scheduled maintenance"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, justifyContent: "space-between" }}>
          <Button
            color="error"
            onClick={handleConfirmPermanentDelete}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.78rem" }}
          >
            Delete Record
          </Button>
          <Stack direction="row" spacing={1}>
            <Button
              onClick={() => setOpenCancelModal(false)}
              sx={{ textTransform: "none", color: "#64748B" }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmCancel}
              sx={{ fontWeight: 700, textTransform: "none", borderRadius: "8px" }}
            >
              Cancel Booking
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
