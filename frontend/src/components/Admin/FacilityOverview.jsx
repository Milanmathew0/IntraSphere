import React from "react";
import { Paper, Box, Typography, Stack, Grid, Skeleton } from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";

export default function FacilityOverview({ data, loading }) {
  const fac = data?.facility || {};

  const items = [
    { label: "Total Rooms", value: fac.total_rooms ?? 0, color: "#0F172A", bg: "#F8FAFC" },
    { label: "Active Rooms", value: fac.active_rooms ?? 0, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Maintenance", value: fac.maintenance_rooms ?? 0, color: "#D32F2F", bg: "#FFEBEE" },
    { label: "Inactive Rooms", value: fac.inactive_rooms ?? 0, color: "#64748B", bg: "#F1F5F9" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "#E0F2F1",
              color: "#00796B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ApartmentIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Facility Status Overview
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        ) : (
          <Grid container spacing={1.5}>
            {items.map((item, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: "center", bgcolor: item.bg, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {item.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={item.color} sx={{ mt: 0.5 }}>
                    {item.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Paper>
  );
}
