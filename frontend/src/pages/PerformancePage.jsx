import React from "react";
import { Box, Typography, Container } from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import EmployeePerformanceOverview from "../components/Admin/EmployeePerformanceOverview";
import PunctualityReportTable from "../components/Admin/PunctualityReportTable";

export default function PerformancePage() {
  return (
    <AppLayout activeTabOverride="performance">
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* Top Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.5px", mb: 0.5 }}>
            Performance & Punctuality
          </Typography>
          <Typography variant="body1" color="#64748B">
            Evaluate team attendance trends, punctuality ratings, working hours, and download management review reports.
          </Typography>
        </Box>

        {/* Performance Overview Component */}
        <Box sx={{ mb: 4 }}>
          <EmployeePerformanceOverview />
        </Box>

        {/* Punctuality Report Table Component */}
        <Box sx={{ mb: 4 }}>
          <PunctualityReportTable />
        </Box>
      </Box>
    </AppLayout>
  );
}
