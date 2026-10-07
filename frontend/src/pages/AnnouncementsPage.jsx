import React from "react";
import { Box, Typography } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import RecentAnnouncements from "../components/dashboard/RecentAnnouncements";

export default function AnnouncementsPage() {
  return (
    <AppLayout activeTabOverride="announcements">
      <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%" }}>
        {/* Top Header */}
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px", mb: 0.5 }}>
            Company Announcements & Broadcasts
          </Typography>
          <Typography variant="body1" color="#64748B">
            Stay updated with the latest company news, policy changes, events, and facility notices.
          </Typography>
        </Box>

        {/* Recent Announcements Widget */}
        <RecentAnnouncements />
      </Box>
    </AppLayout>
  );
}
