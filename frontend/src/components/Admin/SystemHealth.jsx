import React from "react";
import { Paper, Box, Typography, Stack, Grid, Chip, Skeleton } from "@mui/material";
import DnsIcon from "@mui/icons-material/Dns";

export default function SystemHealth({ data, loading }) {
  const sh = data?.system_health || {};

  const services = [
    { name: "Backend API", status: sh.backend || "Online", color: "#2E7D32", bg: "#E8F5E9" },
    { name: "Database (MongoDB)", status: sh.database || "Connected", color: sh.database === "Connected" ? "#2E7D32" : "#D32F2F", bg: sh.database === "Connected" ? "#E8F5E9" : "#FFEBEE" },
    { name: "Authentication (JWT & Argon2)", status: sh.authentication || "Operational", color: "#2E7D32", bg: "#E8F5E9" },
    { name: "Notifications Engine", status: sh.notifications || "Operational", color: "#2E7D32", bg: "#E8F5E9" },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
        mb: 4,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "#E8F5E9",
            color: "#2E7D32",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DnsIcon fontSize="small" />
        </Box>
        <Typography variant="h6" fontWeight={700} color="#0F172A">
          IntraSphere System Health
        </Typography>
      </Stack>

      {loading ? (
        <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
      ) : (
        <Grid container spacing={2}>
          {services.map((srv, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "#F8FAFC",
                  border: "1px solid #F1F5F9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2" fontWeight={700} color="#1E293B">
                  {srv.name}
                </Typography>

                <Chip
                  label={`● ${srv.status}`}
                  size="small"
                  sx={{
                    bgcolor: srv.bg,
                    color: srv.color,
                    fontWeight: 800,
                    fontSize: "0.75rem",
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}
