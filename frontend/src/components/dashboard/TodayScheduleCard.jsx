import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Paper,
  Divider,
} from "@mui/material";
import {
  Calendar,
  CalendarX,
  Video,
  Building2,
  CalendarOff,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";

export default function TodayScheduleCard({ scheduleItems = [] }) {
  const getScheduleIcon = (type) => {
    switch (type) {
      case "meeting":
        return <Video size={18} color="#09090B" />;
      case "workspace":
        return <Building2 size={18} color="#09090B" />;
      case "leave":
        return <CalendarOff size={18} color="#09090B" />;
      default:
        return <Calendar size={18} color="#09090B" />;
    }
  };

  const getBadgeColor = () => {
    return { bg: "#F4F4F5", text: "#09090B", border: "#E4E4E7" };
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E4E4E7",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 3.5 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1.2,
                borderRadius: "12px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={22} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#09090B">
                Today's Schedule
              </Typography>
              <Typography variant="caption" color="#71717A">
                Your bookings, reservations & leave schedule
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`${scheduleItems.length} Events`}
            size="small"
            sx={{
              bgcolor: "#F4F4F5",
              color: "#09090B",
              border: "1px solid #E4E4E7",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "8px",
            }}
          />
        </Stack>

        {scheduleItems.length === 0 ? (
          /* Attractive Empty State */
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: "14px",
              bgcolor: "#FAFAFA",
              border: "1px dashed #D4D4D8",
              textAlign: "center",
              my: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: "50%",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                mb: 1.5,
              }}
            >
              <Sparkles size={28} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} color="#09090B" mb={0.5}>
              No Events Scheduled Today
            </Typography>
            <Typography variant="body2" color="#71717A" maxWidth={280}>
              You have no active meeting room bookings, desk reservations, or approved leaves for today.
            </Typography>
          </Paper>
        ) : (
          /* Schedule Item List */
          <Stack spacing={2}>
            {scheduleItems.map((item, idx) => {
              const badge = getBadgeColor();
              return (
                <Paper
                  key={idx}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid #E4E4E7",
                    bgcolor: "#FFFFFF",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateX(2px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: "10px",
                        bgcolor: badge.bg,
                        border: `1px solid ${badge.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {getScheduleIcon(item.type)}
                    </Box>

                    <Box flexGrow={1}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" fontWeight={700} color="#09090B">
                          {item.title}
                        </Typography>
                        <Chip
                          label={item.time || "Today"}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            bgcolor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`
                          }}
                        />
                      </Stack>
                      <Typography variant="caption" color="#71717A" display="flex" alignItems="center" gap={0.5} mt={0.3}>
                        <MapPin size={12} /> {item.location || "Main Office"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
