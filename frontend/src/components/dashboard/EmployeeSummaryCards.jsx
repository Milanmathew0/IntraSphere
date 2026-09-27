import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  Button,
  Stack,
  Skeleton,
} from "@mui/material";
import {
  CheckCircle,
  AccessTime,
  CalendarMonth,
  Event,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function EmployeeSummaryCards({ user, onNavigateTab }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(18);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);

  const employeeCode =
    user?.email ||
    localStorage.getItem("email") ||
    user?.employee_code ||
    localStorage.getItem("employee_code") ||
    user?.username;

  useEffect(() => {
    let isMounted = true;
    const fetchSummaryMetrics = async () => {
      setLoading(true);
      try {
        // 1. Fetch Today's Attendance
        const attRes = await api.get("/api/v1/attendance/today");
        const records = attRes.data.attendance || [];
        const userEmail = (user?.email || localStorage.getItem("email") || "").toLowerCase();
        const userCode = (employeeCode || "").toLowerCase();
        const userId = user?.id || user?.user_id;

        const myAtt = records.find((rec) => {
          const recEmail = (rec.email || "").toLowerCase();
          const recCode = (rec.employee_code || "").toLowerCase();
          const recEmpId = rec.employee_id;
          return (
            (recEmail && userEmail && recEmail === userEmail) ||
            (recCode && userCode && recCode === userCode) ||
            (recEmpId && userId && recEmpId === userId)
          );
        });

        if (isMounted) setTodayAttendance(myAtt || null);

        // 2. Fetch Leave Balance
        try {
          const balRes = await api.get("/api/v1/leave-requests/balances/me");
          const balances = Array.isArray(balRes.data) ? balRes.data : [];
          const totalRemaining = balances.reduce(
            (acc, curr) => acc + (parseFloat(curr.remaining) || 0),
            0
          );
          if (isMounted) setLeaveBalance(totalRemaining > 0 ? totalRemaining : 18);
        } catch {
          if (isMounted) setLeaveBalance(18);
        }

        // 3. Fetch Active Bookings (Meeting + Workspaces)
        try {
          const [meetingsRes, desksRes] = await Promise.allSettled([
            api.get("/api/v1/meeting-bookings/my"),
            api.get("/api/v1/workspace-reservations/my"),
          ]);

          let meetingCount = 0;
          if (meetingsRes.status === "fulfilled" && Array.isArray(meetingsRes.value.data)) {
            meetingCount = meetingsRes.value.data.filter(
              (b) => b.status === "Confirmed" || b.status === "In Progress"
            ).length;
          }

          let deskCount = 0;
          if (desksRes.status === "fulfilled" && Array.isArray(desksRes.value.data)) {
            deskCount = desksRes.value.data.filter(
              (b) => b.status === "Confirmed" || b.status === "In Progress"
            ).length;
          }

          if (isMounted) setActiveBookingsCount(meetingCount + deskCount);
        } catch {
          if (isMounted) setActiveBookingsCount(0);
        }
      } catch (err) {
        console.error("Summary metrics load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSummaryMetrics();
    return () => {
      isMounted = false;
    };
  }, [user, employeeCode]);

  // Format punch times
  const formatPunchTime = (timeStr) => {
    if (!timeStr) return "--:--";
    try {
      let str = String(timeStr).trim();
      if (str.includes("T") && !str.endsWith("Z") && !str.includes("+") && !str.includes("-", 10)) {
        str += "Z";
      }
      const d = new Date(str);
      return isNaN(d.getTime())
        ? timeStr
        : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const hasCheckedIn = Boolean(todayAttendance && todayAttendance.check_in);
  const hasCheckedOut = Boolean(todayAttendance && todayAttendance.check_out);

  const checkInTimeDisplay = hasCheckedIn ? formatPunchTime(todayAttendance.check_in) : "Not Checked In";
  const checkOutTimeDisplay = hasCheckedOut ? formatPunchTime(todayAttendance.check_out) : "Pending";

  const cardsData = [
    {
      title: "Check-In",
      icon: <CheckCircle sx={{ fontSize: 24, color: "#16A34A" }} />,
      iconBg: "#DCFCE7",
      data: checkInTimeDisplay,
      status: hasCheckedIn ? "Present" : "Not Checked In",
      statusColor: hasCheckedIn ? { bg: "#DCFCE7", text: "#15803D" } : { bg: "#FEF2F2", text: "#DC2626" },
      actionLabel: "Attendance Log",
      onAction: () => onNavigateTab ? onNavigateTab("attendance") : navigate("/attendance"),
    },
    {
      title: "Check-Out",
      icon: <AccessTime sx={{ fontSize: 24, color: "#1976D2" }} />,
      iconBg: "#E0F2FE",
      data: checkOutTimeDisplay,
      status: hasCheckedOut ? "Checked Out" : hasCheckedIn ? "In Shift" : "Not Started",
      statusColor: hasCheckedOut
        ? { bg: "#E0F2FE", text: "#0369A1" }
        : hasCheckedIn
        ? { bg: "#FEF3C7", text: "#B45309" }
        : { bg: "#F1F5F9", text: "#64748B" },
      actionLabel: "Punch Log",
      onAction: () => onNavigateTab ? onNavigateTab("attendance") : navigate("/attendance"),
    },
    {
      title: "Leave Balance",
      icon: <CalendarMonth sx={{ fontSize: 24, color: "#9333EA" }} />,
      iconBg: "#F3E8FF",
      data: `${leaveBalance} Days`,
      status: "Available",
      statusColor: { bg: "#F3E8FF", text: "#7E22CE" },
      actionLabel: "Apply Leave",
      onAction: () => navigate("/leave"),
    },
    {
      title: "My Bookings",
      icon: <Event sx={{ fontSize: 24, color: "#EA580C" }} />,
      iconBg: "#FFEDD5",
      data: `${activeBookingsCount} Active`,
      status: activeBookingsCount > 0 ? "Upcoming" : "No Bookings",
      statusColor: activeBookingsCount > 0 ? { bg: "#FFEDD5", text: "#C2410C" } : { bg: "#F1F5F9", text: "#64748B" },
      actionLabel: "View Bookings",
      onAction: () => navigate("/meeting-rooms"),
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {cardsData.map((card, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "18px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.04)",
              transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              boxSizing: "border-box",
              "&:hover": {
                borderColor: "#CBD5E1",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* Card Header: Title & Icon */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="body2" fontWeight={700} color="#64748B" sx={{ fontSize: "0.82rem" }}>
                {card.title}
              </Typography>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "12px",
                  bgcolor: card.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {card.icon}
              </Box>
            </Box>

            {/* Main Value & Status Badge */}
            {loading ? (
              <Box py={1}>
                <Skeleton variant="text" width="70%" height={36} />
                <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: "6px", mt: 0.5 }} />
              </Box>
            ) : (
              <Box mb={2}>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="#0F172A"
                  lineHeight={1.2}
                  sx={{ fontSize: { xs: "1.3rem", lg: "1.45rem" } }}
                >
                  {card.data}
                </Typography>
                <Chip
                  label={card.status}
                  size="small"
                  sx={{
                    mt: 0.8,
                    height: 22,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    bgcolor: card.statusColor.bg,
                    color: card.statusColor.text,
                    borderRadius: "6px",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
              </Box>
            )}

            {/* Bottom Action Link */}
            <Button
              size="small"
              onClick={card.onAction}
              endIcon={<ArrowForward sx={{ fontSize: "14px !important" }} />}
              sx={{
                p: 0,
                justifyContent: "flex-start",
                color: "#1976D2",
                fontWeight: 700,
                fontSize: "0.78rem",
                textTransform: "none",
                "&:hover": { bgcolor: "transparent", color: "#1565C0" },
              }}
            >
              {card.actionLabel}
            </Button>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
