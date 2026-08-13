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
      const userId = String(user?.id || user?.user_id || localStorage.getItem("user_id") || "");

      if (userEmail || userCode || userId) {
        const filtered = records.filter((rec) => {
          const recEmail = (rec.email || "").toLowerCase();
          const recCode = (rec.employee_code || rec.employee_id || "").toLowerCase();
          const recUserId = rec.user_id ? String(rec.user_id) : "";

          const matchEmail = Boolean(recEmail && userEmail && recEmail === userEmail);
          const matchCode = Boolean(recCode && userCode && recCode === userCode);
          const matchUserId = Boolean(recUserId && userId && recUserId === userId);

          return matchEmail || matchCode || matchUserId;
        });

        // Use filtered set if matches found, or fallback to all records if none filtered specifically
        setHistory(filtered.length > 0 ? filtered : records);
      } else {
        setHistory(records);
      }
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
      let str = String(val).trim();
      if (str.includes("T") && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
        str += "Z";
      } else if (!str.includes("T") && str.includes(":") && !str.includes("Z")) {
        const todayUtc = new Date().toISOString().split("T")[0];
        str = `${todayUtc}T${str}Z`;
      }
      const d = new Date(str);
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
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Table Header Controls */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          mb={2.5}
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
            border: "1px solid #E4E4E7",
            borderRadius: "12px",
            overflowX: "auto",
            maxHeight: 380,
            overflowY: "auto",
            flexGrow: 1,
          }}
        >
          <Table stickyHeader sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#09090B", py: 1.5, bgcolor: "#F4F4F5" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#09090B", py: 1.5, bgcolor: "#F4F4F5" }}>Check-In</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#09090B", py: 1.5, bgcolor: "#F4F4F5" }}>Check-Out</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#09090B", py: 1.5, bgcolor: "#F4F4F5" }}>Working Hours</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#09090B", py: 1.5, bgcolor: "#F4F4F5" }}>
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
                      <FileSpreadsheet size={40} color="#71717A" />
                      <Typography variant="subtitle2" color="#71717A" mt={1}>
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
                        "&:hover": { bgcolor: "#FAFAFA" },
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#09090B" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={15} color="#71717A" />
                          <span>{formatDateOnly(row.attendance_date || row.created_at)}</span>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ color: "#09090B" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Clock size={14} color="#09090B" />
                          <span>{formatDateTime(row.check_in)}</span>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ color: "#09090B" }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Clock size={14} color="#71717A" />
                          <span>{formatDateTime(row.check_out)}</span>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ fontWeight: 600, color: "#09090B" }}>
                        {row.working_hours ? `${row.working_hours} hrs` : "--"}
                      </TableCell>

                      <TableCell align="right">
                        <Chip
                          icon={
                            isComplete ? (
                              <CheckCircle2 size={13} style={{ color: "#09090B" }} />
                            ) : (
                              <AlertCircle size={13} style={{ color: "#09090B" }} />
                            )
                          }
                          label={isComplete ? "Completed" : row.status || "Present"}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            bgcolor: isComplete ? "#F4F4F5" : "#FAFAFA",
                            color: "#09090B",
                            border: "1px solid #E4E4E7",
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
          sx={{ borderTop: "1px solid #F4F4F5", mt: "auto", pt: 0.5 }}
        />
      </CardContent>
    </Card>
  );
}
