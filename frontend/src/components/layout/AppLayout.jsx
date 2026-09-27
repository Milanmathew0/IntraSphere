import React, { useState } from "react";
import { Box, Snackbar, Alert } from "@mui/material";
import EmployeeSidebar from "../dashboard/EmployeeSidebar";
import EmployeeHeader from "../dashboard/EmployeeHeader";

export default function AppLayout({ children, activeTabOverride }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsCount, setNotificationsCount] = useState(0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F5F8FC", // Standard Light Blue/Gray Canvas
        display: "flex",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      {/* 1. Left Dark Navy Enterprise Sidebar */}
      <EmployeeSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        activeTab={activeTabOverride}
      />

      {/* 2. Main Work Area Canvas */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Sticky Top Header */}
        <EmployeeHeader
          onMobileToggle={() => setMobileOpen(!mobileOpen)}
          notificationsCount={notificationsCount}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
        />

        {/* Main Content Area */}
        <Box
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            flexGrow: 1,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
