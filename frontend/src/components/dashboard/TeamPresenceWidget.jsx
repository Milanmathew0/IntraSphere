import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  IconButton
} from "@mui/material";
import {
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function TeamPresenceWidget() {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState([
    { name: "Alex Rivera", role: "Senior Engineer", status: "In Office", zone: "Floor 2 West" },
    { name: "Sarah Jenkins", role: "UI/UX Designer", status: "In Office", zone: "Floor 3 Hub" },
    { name: "David Chen", role: "DevOps Engineer", status: "Remote", zone: "Home Office" },
    { name: "Elena Rostova", role: "QA Lead", status: "In Office", zone: "Quiet Zone B" },
  ]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const res = await api.get("/api/v1/employees");
      if (res.data && res.data.employees) {
        const emps = res.data.employees.map((e) => ({
          name: e.name || `${e.first_name || ""} ${e.last_name || ""}`.trim() || e.email,
          role: e.designation || e.department || "Employee",
          status: e.employment_status === "Active" ? "In Office" : "Offline",
          zone: e.department || "Floor 2 Alpha",
        }));
        if (emps.length > 0) setTeamMembers(emps);
      }
    } catch (err) {
      console.log("Using default team presence list", err);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid #E4E4E7",
        bgcolor: "#FFFFFF",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Row */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} color="#09090B">
                Team Presence Today
              </Typography>
              <Typography variant="caption" color="#71717A">
                Department headcount & attendance status
              </Typography>
            </Box>
          </Box>

          <Chip
            label="93% Present"
            size="small"
            sx={{
              bgcolor: "#F4F4F5",
              color: "#09090B",
              border: "1px solid #E4E4E7",
              fontWeight: 700,
              fontSize: "0.75rem",
              borderRadius: "6px"
            }}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Headcount Progress Bar */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 0.75 }}>
            <Typography variant="caption" color="#71717A" fontWeight={600}>
              Checked-in Headcount:
            </Typography>
            <Typography variant="caption" color="#09090B" fontWeight={800}>
              {teamMembers.length} Active Staff
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={93}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#E4E4E7",
              "& .MuiLinearProgress-bar": { bgcolor: "#09090B" },
            }}
          />
        </Box>

        {/* Table Header Row (Monochrome) */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "2fr 1.5fr 1fr", sm: "2.5fr 2fr 1.2fr 1.5fr" },
            px: 2,
            py: 1.25,
            bgcolor: "#F4F4F5",
            border: "1px solid #E4E4E7",
            borderRadius: "8px",
            mb: 1,
            alignItems: "center"
          }}
        >
          <Typography variant="caption" fontWeight={800} color="#09090B">
            Member Name
          </Typography>
          <Typography variant="caption" fontWeight={800} color="#09090B">
            Role / Department
          </Typography>
          <Typography variant="caption" fontWeight={800} color="#09090B">
            Status
          </Typography>
          <Typography variant="caption" fontWeight={800} color="#09090B" textAlign="right">
            Actions
          </Typography>
        </Box>

        {/* Table Content Rows (Monochrome) */}
        <Stack spacing={0} sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 320 }}>
          {teamMembers.map((member, idx) => (
            <Box
              key={idx}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "2fr 1.5fr 1fr", sm: "2.5fr 2fr 1.2fr 1.5fr" },
                px: 2,
                py: 1.75,
                borderBottom: "1px solid #E4E4E7",
                alignItems: "center",
                transition: "background-color 0.15s ease",
                "&:hover": { bgcolor: "#FAFAFA" }
              }}
            >
              {/* Member Avatar & Name */}
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    bgcolor: "#09090B",
                    color: "#FFFFFF",
                    width: 32,
                    height: 32,
                    fontSize: "0.8rem",
                    fontWeight: 800,
                  }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" fontWeight={800} color="#09090B">
                  {member.name}
                </Typography>
              </Box>

              {/* Role */}
              <Typography variant="body2" color="#71717A" fontWeight={500}>
                {member.role}
              </Typography>

              {/* Status Badge */}
              <Box>
                <Chip
                  label={member.status}
                  size="small"
                  sx={{
                    bgcolor: "#F4F4F5",
                    color: "#09090B",
                    border: "1px solid #E4E4E7",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    borderRadius: "6px"
                  }}
                />
              </Box>

              {/* Action Buttons */}
              <Box display="flex" gap={1} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/employees")}
                  sx={{
                    borderRadius: "6px",
                    borderColor: "#09090B",
                    color: "#09090B",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "none",
                    px: 1.5,
                    py: 0.25,
                    minWidth: 0,
                    "&:hover": { bgcolor: "#F4F4F5", borderColor: "#09090B" }
                  }}
                >
                  View
                </Button>
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Footer Bar (Monochrome) */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            mt: "auto",
            borderTop: "1px solid #E4E4E7"
          }}
        >
          <Button
            variant="text"
            size="small"
            endIcon={<ArrowRight size={16} />}
            onClick={() => navigate("/employees")}
            sx={{
              color: "#09090B",
              fontWeight: 800,
              textTransform: "none",
              fontSize: "13px",
              p: 0,
              "&:hover": { bgcolor: "transparent", color: "#27272A" }
            }}
          >
            View Full Team Directory
          </Button>

          {/* Right Pagination Buttons */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton size="small" sx={{ border: "1px solid #E4E4E7", borderRadius: "6px", p: 0.5 }}>
              <ChevronLeft size={14} color="#09090B" />
            </IconButton>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "6px",
                bgcolor: "#09090B",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              1
            </Box>
            <IconButton size="small" sx={{ border: "1px solid #E4E4E7", borderRadius: "6px", p: 0.5 }}>
              <ChevronRight size={14} color="#09090B" />
            </IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

