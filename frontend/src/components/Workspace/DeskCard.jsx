import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Monitor,
  Wifi,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  Layers,
  MapPin,
  Accessibility,
  Info,
  CalendarCheck,
} from "lucide-react";

export default function DeskCard({ desk, onSelectDetails, onSelectReserve, onSelectEdit }) {
  const {
    desk_code,
    desk_name,
    floor,
    zone,
    location,
    building,
    workspace_type,
    is_accessible,
    facilities = [],
    current_status = "Available Now",
    status = "Available",
    image_url,
  } = desk;

  const isAvailable = current_status === "Available Now" || current_status === "Available";
  const isMaintenance = current_status === "Maintenance" || status === "Maintenance";
  const isReserved = current_status === "Reserved";
  const isInactive = current_status === "Inactive" || !desk.is_active;

  // Status Chip Config
  const getStatusChip = () => {
    if (isInactive) {
      return <Chip label="Inactive" size="small" color="default" sx={{ fontWeight: 700 }} />;
    }
    if (isMaintenance) {
      return <Chip label="Under Maintenance" size="small" color="warning" sx={{ fontWeight: 700 }} />;
    }
    if (isReserved) {
      return <Chip label="Reserved Today" size="small" color="info" sx={{ fontWeight: 700 }} />;
    }
    return <Chip label="Available Now" size="small" color="success" sx={{ fontWeight: 700 }} />;
  };

  const disabledReason = isMaintenance
    ? "Desk is currently under maintenance"
    : isInactive
    ? "Desk is inactive"
    : isReserved
    ? "Desk is currently reserved"
    : "";

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E4E4E7",
        bgcolor: "#FFFFFF",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s ease-in-out",
        "&:hover": {
          boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.08)",
          transform: "translateY(-3px)",
          borderColor: "#10B981",
        },
      }}
    >
      {/* Header Banner / Image Preview */}
      <Box
        sx={{
          height: 120,
          bgcolor: "#F4F4F5",
          backgroundImage: image_url ? `url(${image_url})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Chip
          label={desk_code}
          size="small"
          sx={{
            bgcolor: "#09090B",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        />

        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
          {is_accessible && (
            <Tooltip title="Wheelchair Accessible Desk">
              <Chip
                icon={<Accessibility size={14} color="#10B981" />}
                label="Accessible"
                size="small"
                sx={{ bgcolor: "#ECFDF5", color: "#10B981", fontWeight: 700 }}
              />
            </Tooltip>
          )}
          {getStatusChip()}
        </Box>
      </Box>

      {/* Card Content Body */}
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" fontWeight={800} color="#09090B" gutterBottom noWrap>
          {desk_name}
        </Typography>

        {/* Location & Floor Info */}
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#52525B" }}>
            <Layers size={15} color="#10B981" />
            <Typography variant="body2" fontWeight={600}>
              Floor {floor} • {zone}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#71717A" }}>
            <Building size={15} />
            <Typography variant="caption" fontWeight={500}>
              {building} ({location})
            </Typography>
          </Box>
        </Stack>

        {/* Workspace Type Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            label={workspace_type || "Standard Desk"}
            size="small"
            variant="outlined"
            sx={{
              borderColor: "#10B981",
              color: "#10B981",
              fontWeight: 700,
              fontSize: "11px",
            }}
          />
        </Box>

        {/* Facilities Chips */}
        <Typography variant="caption" fontWeight={700} color="#71717A" sx={{ mb: 1, display: "block" }}>
          INCLUDED FACILITIES
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2, flexGrow: 1 }}>
          {facilities.length > 0 ? (
            facilities.slice(0, 4).map((facility, idx) => (
              <Chip
                key={idx}
                label={facility}
                size="small"
                sx={{
                  bgcolor: "#F4F4F5",
                  color: "#3F3F46",
                  fontSize: "11px",
                  fontWeight: 600,
                  height: "22px",
                }}
              />
            ))
          ) : (
            <Typography variant="caption" color="#A1A1AA">
              Standard workspace setup
            </Typography>
          )}
          {facilities.length > 4 && (
            <Chip
              label={`+${facilities.length - 4} more`}
              size="small"
              sx={{ bgcolor: "#E4E4E7", color: "#27272A", fontSize: "11px", height: "22px" }}
            />
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, mt: "auto" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => onSelectDetails(desk)}
            startIcon={<Info size={16} />}
            sx={{
              borderRadius: "10px",
              borderColor: "#D4D4D8",
              color: "#27272A",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { borderColor: "#10B981", bgcolor: "#F4F4F5" },
            }}
          >
            Details
          </Button>

          <Tooltip title={!isAvailable ? disabledReason : ""}>
            <span>
              <Button
                fullWidth
                variant="contained"
                disabled={!isAvailable}
                onClick={() => onSelectReserve(desk)}
                startIcon={<CalendarCheck size={16} />}
                aria-label={`Reserve Desk ${desk_code}`}
                sx={{
                  borderRadius: "10px",
                  bgcolor: "#10B981",
                  color: "#FFFFFF",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#059669" },
                  "&.Mui-disabled": { bgcolor: "#E4E4E7", color: "#A1A1AA" },
                }}
              >
                Reserve
              </Button>
            </span>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
}
