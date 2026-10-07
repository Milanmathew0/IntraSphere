import React, { useState, useEffect } from "react";
import { Box, Typography, Stack, Container, Snackbar, Alert, Paper } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import UpcomingMeetings from "../components/dashboard/UpcomingMeetings";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import MyWorkspaceReservations from "../components/Workspace/MyWorkspaceReservations";
import api from "../api/axios";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const [todayScheduleItems, setTodayScheduleItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTodayScheduleData = async () => {
      try {
        const [meetingRes, deskRes] = await Promise.allSettled([
          api.get("/api/v1/meeting-bookings/my"),
          api.get("/api/v1/workspace-reservations/my"),
        ]);

        const nowStr = new Date().toDateString();
        let items = [];

        if (meetingRes.status === "fulfilled" && Array.isArray(meetingRes.value.data)) {
          const todayMeetings = meetingRes.value.data
            .filter((b) => b.status !== "Cancelled" && new Date(b.start_time).toDateString() === nowStr)
            .map((b) => ({
              type: "meeting",
              title: b.title || b.room_name || "Meeting Room Booking",
              time: `${new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              location: `${b.room_name || "Conference Room"}${b.location ? " • " + b.location : ""}`,
              start_time: b.start_time,
            }));
          items = [...items, ...todayMeetings];
        }

        if (deskRes.status === "fulfilled" && Array.isArray(deskRes.value.data)) {
          const todayDesks = deskRes.value.data
            .filter((b) => b.status !== "Cancelled" && new Date(b.start_time || b.reservation_date).toDateString() === nowStr)
            .map((b) => ({
              type: "workspace",
              title: b.desk_name || b.zone_name || "Workspace Desk Reservation",
              time: b.start_time
                ? `${new Date(b.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(b.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Full Day Access",
              location: `Desk ${b.desk_number || "A-101"}${b.floor ? " • Floor " + b.floor : ""}`,
              start_time: b.start_time || b.reservation_date,
            }));
          items = [...items, ...todayDesks];
        }

        if (isMounted) {
          setTodayScheduleItems(items);
        }
      } catch (err) {
        console.error("Error fetching schedule data:", err);
      }
    };

    fetchTodayScheduleData();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  return (
    <AppLayout activeTabOverride="my-bookings">
      <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
        {/* Top Header */}
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px", mb: 0.5 }}>
            My Bookings & Reservations
          </Typography>
          <Typography variant="body1" color="#64748B">
            Manage your meeting room reservations, desk bookings, and view today's schedule timeline.
          </Typography>
        </Box>

        <Stack spacing={3.5}>
          {/* Today's Schedule Timeline */}
          <TodaySchedule scheduleItems={todayScheduleItems} />

          {/* Meeting Room Bookings */}
          <UpcomingMeetings />

          {/* Workspace Desk Reservations */}
          <MyWorkspaceReservations refreshKey={refreshKey} showToast={showToast} />
        </Stack>

        {/* Feedback Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast({ ...toast, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setToast({ ...toast, open: false })}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Box>
    </AppLayout>
  );
}
