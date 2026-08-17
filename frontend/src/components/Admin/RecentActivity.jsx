import React from "react";
import { Paper, Box, Typography, Button, Stack, Chip, List, ListItem, ListItemText, Skeleton } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function RecentActivity({ data, loading, onOpenAuditLogs }) {
  const activities = data?.recent_activities || [];

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
              bgcolor: "#F1F5F9",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HistoryIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Recent System Activity Log
          </Typography>
        </Stack>

        {loading ? (
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        ) : activities.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center", bgcolor: "#F8FAFC", borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No recent activity recorded yet.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {activities.map((act) => (
              <ListItem
                key={act.id}
                sx={{
                  px: 2,
                  py: 1.2,
                  mb: 1.2,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  border: "1px solid #F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <CheckCircleOutlinedIcon sx={{ color: "#2E7D32", fontSize: 20 }} />
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={700} color="#0F172A">
                      {act.event}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {act.user} · {act.time}
                    </Typography>
                  }
                />
                <Chip label={act.type} size="small" sx={{ bgcolor: "#E2E8F0", color: "#334155", fontWeight: 600, fontSize: "0.7rem" }} />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid #F1F5F9", mt: 2 }}>
        <Button
          variant="outlined"
          fullWidth
          endIcon={<ArrowForwardIcon />}
          onClick={onOpenAuditLogs}
          sx={{
            borderColor: "#64748B",
            color: "#334155",
            "&:hover": { bgcolor: "#F1F5F9" },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            py: 1.2,
          }}
        >
          View Audit Logs
        </Button>
      </Box>
    </Paper>
  );
}
