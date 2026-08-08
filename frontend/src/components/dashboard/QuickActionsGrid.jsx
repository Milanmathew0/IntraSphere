import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
} from "@mui/material";
import {
  Clock,
  Video,
  Building2,
  CalendarOff,
  ChevronRight,
} from "lucide-react";

export default function QuickActionsGrid({ onActionClick }) {
  const actions = [
    {
      id: "attendance",
      title: "Daily Attendance",
      desc: "Log your daily office entry and exit time with 1-click check-in.",
      icon: <Clock size={24} />,
      color: "#2563EB",
      bgColor: "#EFF6FF",
      buttonText: "Mark Attendance",
    },
    {
      id: "meeting_room",
      title: "Meeting Room Booking",
      desc: "Reserve emergency war rooms, conference pods, and video booths.",
      icon: <Video size={24} />,
      color: "#7C3AED",
      bgColor: "#F5F3FF",
      buttonText: "Book a Room",
    },
    {
      id: "workspace",
      title: "Workspace Reservation",
      desc: "Reserve quiet focus desks, ergonomic seats, and phone booths.",
      icon: <Building2 size={24} />,
      color: "#059669",
      bgColor: "#ECFDF5",
      buttonText: "Reserve Desk",
    },
    {
      id: "leave",
      title: "Apply for Leave",
      desc: "Submit PTO, sick leave, or remote work requests to HR.",
      icon: <CalendarOff size={24} />,
      color: "#D97706",
      bgColor: "#FFFBEB",
      buttonText: "Apply Leave",
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {actions.map((act) => (
        <Grid item xs={12} sm={6} md={3} key={act.id}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 24px rgba(0, 0, 0, 0.08)",
                borderColor: act.color,
              },
            }}
            onClick={() => onActionClick && onActionClick(act.id)}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
              <Box
                sx={{
                  p: 1.5,
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  bgcolor: act.bgColor,
                  color: act.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                {act.icon}
              </Box>

              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.8} fontSize="1rem">
                {act.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2.5} flexGrow={1} lineHeight={1.5}>
                {act.desc}
              </Typography>

              <Button
                size="small"
                endIcon={<ChevronRight size={16} />}
                sx={{
                  alignSelf: "flex-start",
                  fontWeight: 700,
                  color: act.color,
                  p: 0,
                  textTransform: "none",
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                {act.buttonText}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
