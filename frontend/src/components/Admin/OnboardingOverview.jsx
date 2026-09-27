import React from "react";
import { Paper, Box, Typography, Button, Stack, Grid, Chip, Skeleton } from "@mui/material";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

export default function OnboardingOverview({ data, loading }) {
  const navigate = useNavigate();
  const ob = data?.onboarding || {};

  const stats = [
    { label: "Invitations Sent", value: ob.invitations_sent ?? 0, color: "#F97316", bg: "#FFF7ED" },
    { label: "Awaiting Activation", value: ob.awaiting_activation ?? 0, color: "#ED6C02", bg: "#FFF3E0" },
    { label: "Activated Total", value: ob.activated ?? 0, color: "#2E7D32", bg: "#E8F5E9" },
    { label: "Activated This Month", value: ob.activated_this_month ?? 0, color: "#00796B", bg: "#E0F2F1" },
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: "#FFF3E0",
                color: "#ED6C02",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HowToRegIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Employee Onboarding
            </Typography>
          </Stack>

          <Chip label="Email Activation Active" size="small" sx={{ bgcolor: "#F3E5F5", color: "#7B1FA2", fontWeight: 700 }} />
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
        ) : (
          <Grid container spacing={2} sx={{ my: 1 }}>
            {stats.map((item, idx) => (
              <Grid item xs={6} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: item.bg,
                    border: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <Typography variant="caption" fontWeight={600} color="text.secondary" display="block">
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

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/employees")}
          sx={{
            borderColor: "#F97316",
            color: "#F97316",
            "&:hover": { bgcolor: "#FFF7ED", borderColor: "#EA580C" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.2,
          }}
        >
          Manage Employees
        </Button>
      </Box>
    </Paper>
  );
}
