import React from "react";
import { Box, Typography } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import EmployeeNotifications from "../components/dashboard/EmployeeNotifications";

export default function NotificationsPage() {
  return (
    <AppLayout activeTabOverride="notifications">
      <Box sx={{ maxWidth: 1000, mx: "auto", width: "100%" }}>
        {/* Top Header */}
        <Box sx={{ mb: 3.5 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px", mb: 0.5 }}>
            Notifications Center
          </Typography>
          <Typography variant="body1" color="#64748B">
            Review your activity alerts, approval updates, booking confirmations, and system notifications.
          </Typography>
        </Box>

        {/* Employee Notifications Widget */}
        <EmployeeNotifications />
      </Box>
    </AppLayout>
  );
}
