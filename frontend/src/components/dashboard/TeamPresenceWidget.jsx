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
} from "@mui/material";
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Laptop,
  Building,
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
        const emps = res.data.employees.slice(0, 5).map((e) => ({
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
        borderRadius: 4,
        border: "1px solid #E2E8F0",
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                bgcolor: "rgba(37, 99, 235, 0.1)",
                color: "#1D4ED8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={20} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#0F172A">
                Team Presence Today
              </Typography>
              <Typography variant="caption" color="#64748B">
                Department headcount & attendance status
              </Typography>
            </Box>
          </Box>

          <Chip
            label="93% Present"
            size="small"
            sx={{
              bgcolor: "rgba(34, 197, 94, 0.12)",
              color: "#15803D",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          />
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Attendance Progress Bar */}
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography variant="caption" color="#64748B" fontWeight={600}>
              Checked-in Headcount:
            </Typography>
            <Typography variant="caption" color="#10B981" fontWeight={700}>
              {teamMembers.length} Active Staff
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={88}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#E2E8F0",
              "& .MuiLinearProgress-bar": { bgcolor: "#10B981" },
            }}
          />
        </Box>

        {/* Member Status List */}
        <Stack
          spacing={1.5}
          sx={{
            overflowY: "auto",
            maxHeight: 280,
            mb: 2,
            pr: 0.8,
            "&::-webkit-scrollbar": { width: "5px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#CBD5E1", borderRadius: "4px" },
          }}
        >
          {teamMembers.map((member, idx) => (
            <Box
              key={idx}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              p={1.5}
              borderRadius="12px"
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #E2E8F0",
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    bgcolor: idx % 2 === 0 ? "#0288D1" : "#7B1FA2",
                    width: 32,
                    height: 32,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {member.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {member.name}
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    {member.role}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={member.status}
                size="small"
                sx={{
                  bgcolor:
                    member.status === "In Office"
                      ? "rgba(34, 197, 94, 0.12)"
                      : "rgba(59, 130, 246, 0.12)",
                  color: member.status === "In Office" ? "#15803D" : "#1D4ED8",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          ))}
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          endIcon={<ArrowRight size={16} />}
          onClick={() => navigate("/employees")}
          sx={{
            mt: "auto",
            borderRadius: "12px",
            color: "#0288D1",
            borderColor: "rgba(2, 136, 209, 0.3)",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": { bgcolor: "rgba(2, 136, 209, 0.05)" },
          }}
        >
          View Full Team Directory
        </Button>
      </CardContent>
    </Card>
  );
}
