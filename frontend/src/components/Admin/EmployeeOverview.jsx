import React from "react";
import { Paper, Box, Typography, Button, LinearProgress, Stack, Chip, Skeleton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";

export default function EmployeeOverview({ data, loading }) {
  const navigate = useNavigate();

  const emp = data?.employees || {};
  const total = emp.total || 0;
  const active = emp.active || 0;
  const invited = emp.invited || 0;
  const inactive = emp.inactive || 0;
  const suspended = emp.suspended || 0;

  const getPct = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);

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
                bgcolor: "#E3F2FD",
                color: "#1976D2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PeopleIcon fontSize="small" />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              Employee Overview
            </Typography>
          </Stack>

          <Chip
            label={`${emp.new_this_month || 0} New This Month`}
            size="small"
            sx={{ bgcolor: "#E8F5E9", color: "#2E7D32", fontWeight: 700 }}
          />
        </Box>

        {loading ? (
          <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
        ) : (
          <Box sx={{ my: 2 }}>
            <Stack spacing={2}>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    Active Workforce ({active})
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#2E7D32">
                    {getPct(active)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPct(active)}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#2E7D32" } }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    Invited / Pending ({invited})
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#ED6C02">
                    {getPct(invited)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPct(invited)}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#ED6C02" } }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" fontWeight={600} color="#1E293B">
                    Inactive ({inactive})
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="#64748B">
                    {getPct(inactive)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getPct(inactive)}
                  sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#64748B" } }}
                />
              </Box>

              {suspended > 0 && (
                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} color="#1E293B">
                      Suspended ({suspended})
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="#D32F2F">
                      {getPct(suspended)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getPct(suspended)}
                    sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", "& .MuiLinearProgress-bar": { bgcolor: "#D32F2F" } }}
                  />
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Button
          variant="contained"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/employees")}
          sx={{
            bgcolor: "#1976D2",
            "&:hover": { bgcolor: "#1565C0" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.2,
          }}
        >
          View Employees
        </Button>
      </Box>
    </Paper>
  );
}
