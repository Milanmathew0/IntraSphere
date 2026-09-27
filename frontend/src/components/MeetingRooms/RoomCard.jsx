import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import {
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Wrench,
  Monitor,
  Video,
  Tv,
  Wind,
  Wifi,
  Zap,
} from "lucide-react";

export default function RoomCard({ room, onSelectRoom, onBookRoom }) {
  const getStatusChip = (statusStr) => {
    switch (statusStr) {
      case "Available Now":
      case "Available":
        return (
          <Chip
            size="small"
            icon={<CheckCircle2 size={14} style={{ color: "#2E7D32" }} />}
            label="Available Now"
            sx={{
              bgcolor: "rgba(46, 125, 50, 0.1)",
              color: "#2E7D32",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "8px",
            }}
          />
        );
      case "Occupied":
        return (
          <Chip
            size="small"
            icon={<AlertCircle size={14} style={{ color: "#D32F2F" }} />}
            label="Occupied"
            sx={{
              bgcolor: "rgba(211, 47, 47, 0.1)",
              color: "#D32F2F",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "8px",
            }}
          />
        );
      case "Maintenance":
        return (
          <Chip
            size="small"
            icon={<Wrench size={14} style={{ color: "#757575" }} />}
            label="Under Maintenance"
            sx={{
              bgcolor: "rgba(117, 117, 117, 0.1)",
              color: "#616161",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "8px",
            }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label={statusStr}
            sx={{ bgcolor: "#F1F5F9", color: "#475569", fontWeight: 700, fontSize: "0.75rem" }}
          />
        );
    }
  };

  const getFacilityIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes("video")) return <Video size={13} />;
    if (lower.includes("display") || lower.includes("tv")) return <Tv size={13} />;
    if (lower.includes("projector")) return <Monitor size={13} />;
    if (lower.includes("air") || lower.includes("ac")) return <Wind size={13} />;
    if (lower.includes("wifi")) return <Wifi size={13} />;
    if (lower.includes("power")) return <Zap size={13} />;
    return <CheckCircle2 size={13} />;
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "18px",
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 30px rgba(16, 185, 129, 0.12)",
          borderColor: "#10B981",
        },
      }}
    >
      {/* Image Banner or Styled Fallback Header */}
      <Box sx={{ position: "relative", height: 160, overflow: "hidden", bgcolor: "#0F172A" }}>
        {room.image_url ? (
          <CardMedia
            component="img"
            height="160"
            image={room.image_url}
            alt={room.room_name}
            sx={{ objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              p: 3,
            }}
          >
            <Typography variant="h5" fontWeight={800} textAlign="center">
              {room.room_name}
            </Typography>
          </Box>
        )}

        {/* Floating Room Code Badge */}
        <Chip
          label={room.room_code}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            bgcolor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(8px)",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.72rem",
            letterSpacing: "0.5px",
          }}
        />

        {/* Floating Status Pill */}
        <Box sx={{ position: "absolute", bottom: 12, right: 12 }}>
          {getStatusChip(room.current_status || room.status)}
        </Box>
      </Box>

      {/* Card Content Details */}
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box mb={1}>
          <Typography variant="h6" fontWeight={800} color="#1E293B" sx={{ lineHeight: 1.25 }}>
            {room.room_name}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
            <MapPin size={14} color="#64748B" />
            <Typography variant="caption" color="#64748B" fontWeight={600}>
              Floor {room.floor} • {room.location}
            </Typography>
          </Stack>
        </Box>

        {/* Capacity Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "#F8FAFC",
            p: 1.2,
            borderRadius: "10px",
            border: "1px solid #F1F5F9",
            my: 1.5,
          }}
        >
          <Users size={16} color="#10B981" />
          <Typography variant="body2" fontWeight={700} color="#1E293B">
            Capacity: {room.capacity} People
          </Typography>
        </Box>

        {/* Facilities Badges */}
        <Box mb={2} sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="#64748B" fontWeight={700} display="block" mb={0.8}>
            FEATURES & AMENITIES
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.6}>
            {(room.facilities || []).slice(0, 4).map((fac, idx) => (
              <Chip
                key={idx}
                icon={getFacilityIcon(fac)}
                label={fac}
                size="small"
                sx={{
                  bgcolor: "#ECFDF5",
                  color: "#047857",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: 22,
                  "& .MuiChip-icon": { color: "#047857" },
                }}
              />
            ))}
            {(room.facilities || []).length > 4 && (
              <Chip
                label={`+${room.facilities.length - 4} more`}
                size="small"
                sx={{ bgcolor: "#F1F5F9", color: "#64748B", fontSize: "0.68rem", height: 22 }}
              />
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 1.5, borderColor: "#F1F5F9" }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.2}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            onClick={() => onSelectRoom(room)}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              borderColor: "#CBD5E1",
              color: "#475569",
              "&:hover": { bgcolor: "#F8FAFC", borderColor: "#94A3B8" },
            }}
          >
            View Details
          </Button>

          <Button
            variant="contained"
            size="small"
            fullWidth
            disabled={room.status === "Maintenance" || !room.is_active}
            onClick={() => onBookRoom(room)}
            sx={{
              borderRadius: "10px",
              fontWeight: 700,
              textTransform: "none",
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #10B981 0%, #10B981 100%)",
                boxShadow: "0 6px 16px rgba(16, 185, 129, 0.35)",
              },
            }}
          >
            Book Room
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
