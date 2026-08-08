import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  TablePagination,
  Skeleton,
  Stack,
  Alert,
  Tooltip,
} from "@mui/material";
import {
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

export default function AttendanceHistoryTable({ user, refreshTrigger }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      let records = [];
      const res = await api.get("/api/v1/attendance/");
      records = res.data.attendance || [];

      // Filter history for current logged in user
      const userEmail = (user?.email || localStorage.getItem("email") || "").toLowerCase();
      const userCode = (user?.employee_code || localStorage.getItem("employee_code") || "").toLowerCase();
      const userId = user?.id || user?.user_id;

      if (userEmail || userCode || userId) {
        records = records.filter((rec) => {
          const recEmail = (rec.email || "").toLowerCase();
          const recCode = (rec.employee_id || rec.employee_code || "").toLowerCase();
          return (
            (recEmail && userEmail && recEmail === userEmail) ||
            (recCode && userCode && recCode === userCode) ||
            (recCode && userId && recCode === userId)
          );
        });
      }

      setHistory(records);
    } catch (err) {
      console.error("Failed to load attendance history:", err);
      setError("Unable to load attendance history from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]);

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    return history
      .filter((row) => {
        if (!searchTerm) return true;
        const query = searchTerm.toLowerCase();
        const dateStr = row.attendance_date ? new Date(row.attendance_date).toLocaleDateString() : "";
        const status = (row.status || "").toLowerCase();
        const empName = (row.employee_name || "").toLowerCase();
        return dateStr.includes(query) || status.includes(query) || empName.includes(query);
      })
      .sort((a, b) => {
        const dateA = new Date(a.attendance_date || a.created_at || 0).getTime();
        const dateB = new Date(b.attendance_date || b.created_at || 0).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [history, searchTerm, sortOrder]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSorted.slice(start, start + rowsPerPage);
  }, [filteredAndSorted, page, rowsPerPage]);

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const formatDateTime = (val) => {
    if (!val) return "--:--";
    try {
      const d = new Date(val);
      return isNaN(d.getTime())
        ? val
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return val;
    }
  };

  const formatDateOnly = (val) => {
    if (!val) return "N/A";
    try {
      const d = new Date(val);
      return isNaN(d.getTime())
        ? val
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return val;
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {/* Table Header Controls */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={3}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Attendance History
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Logs of your past check-ins, check-outs, and logged hours
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by date or status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#64748B" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", sm: 240 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  bgcolor: "#F8FAFC",
                },
              }}
            />

            <Tooltip title="Sort Date">
              <IconButton
                onClick={toggleSort}
                sx={{
                  bgcolor: "#F1F5F9",
                  borderRadius: "10px",
                  p: 1,
                }}
              >
                <ArrowUpDown size={18} color="#475569" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Refresh History">
              <IconButton
                onClick={fetchHistory}
                sx={{
                  bgcolor: "#F1F5F9",
                  borderRadius: "10px",
                  p: 1,
                }}
              >
                <RefreshCw size={18} color="#475569" className={loading ? "spin" : ""} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        {/* Table View */}
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            border: "1px solid #E2E8F0",
            borderRadius: "12px",
            overflowX: "auto",
          }}
        >
          <Table sx={{ minWidth: 600 }}>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.8 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.8 }}>Check-In</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.8 }}>Check-Out</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569", py: 1.8 }}>Working Hours</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569", py: 1.8 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell><Skeleton variant="text" width={70} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                    <TableCell align="right"><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: "6px", ml: "auto" }} /></TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <FileSpreadsheet size={40} color="#94A3B8" />
                      <Typography variant="subtitle2" color="text.secondary" mt={1}>
                        No attendance records found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const isComplete = Boolean(row.check_in && row.check_out);
                  return (
                    <TableRow
                      key={row._id || index}
                      sx={{
                        "&:hover": { bgcolor: "#F8FAFC" },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#0F172A" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={15} color="#64748B" />
                          <span>{formatDateOnly(row.attendance_date || row.created_at)}</span>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ color: "#334155" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Clock size={14} color="#16A34A" />
                          <span>{formatDateTime(row.check_in)}</span>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ color: "#334155" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Clock size={14} color="#DC2626" />
                          <span>{formatDateTime(row.check_out)}</span>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600, color: "#2563EB" }}>
                        {row.working_hours ? `${row.working_hours} hrs` : "--"}
                      </TableCell>

                      <TableCell align="right">
                        <Chip
                          icon={
                            isComplete ? (
                              <CheckCircle2 size={13} style={{ color: "#15803D" }} />
                            ) : (
                              <AlertCircle size={13} style={{ color: "#0284C7" }} />
                            )
                          }
                          label={isComplete ? "Completed" : row.status || "Present"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            bgcolor: isComplete ? "#DCFCE7" : "#E0F2FE",
                            color: isComplete ? "#15803D" : "#0284C7",
                            borderRadius: "6px",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredAndSorted.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
          sx={{ borderTop: "none", pt: 1 }}
        />
      </CardContent>
    </Card>
  );
}
