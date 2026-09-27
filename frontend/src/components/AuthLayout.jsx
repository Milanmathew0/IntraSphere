import { Box, Typography, Container } from "@mui/material";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

export function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        bgcolor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          minHeight: "100vh",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* Left Side: Modern Enterprise Slate Hero */}
        <Box
          sx={{
            flex: { xs: "none", md: "1.1" },
            bgcolor: "#0F172A",
            color: "#FFFFFF",
            p: { xs: 4, sm: 6, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background Gradient Accent */}
          <Box
            sx={{
              position: "absolute",
              top: "-15%",
              left: "-10%",
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, rgba(15, 23, 42, 0) 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Top Brand Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, zIndex: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                bgcolor: "#F97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(249, 115, 22, 0.4)",
              }}
            >
              <SparklesIcon sx={{ color: "#FFFFFF", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} color="#FFFFFF" sx={{ letterSpacing: -0.3, lineHeight: 1.2 }}>
                IntraSphere
              </Typography>
              <Typography variant="caption" sx={{ color: "#94A3B8", fontWeight: 600 }}>
                Enterprise Smart Office System
              </Typography>
            </Box>
          </Box>

          {/* Center Hero Showcase */}
          <Box sx={{ my: "auto", py: 6, maxWidth: 480, zIndex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: "1.8rem", sm: "2.4rem", md: "2.75rem" },
                letterSpacing: "-0.8px",
                color: "#FFFFFF",
                lineHeight: 1.2,
              }}
            >
              Intelligent Workspace & Office Automation
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#94A3B8",
                fontSize: "1rem",
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Streamline desk bookings, meeting rooms, attendance tracking, and facility management in one unified platform.
            </Typography>

            {/* Key Value Points */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.8 }}>
              {[
                "Smart Workspace & Desk Reservations",
                "Instant Meeting Room Booking & Scheduling",
                "Automated Attendance & Leave Management",
              ].map((text, idx) => (
                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CheckCircleOutlinedIcon sx={{ color: "#F97316", fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={600} color="#E2E8F0">
                    {text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Footer Copyright */}
          <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500, zIndex: 1 }}>
            © 2026 IntraSphere Inc. All rights reserved.
          </Typography>
        </Box>

        {/* Right Side: Clean Professional Form Area */}
        <Box
          sx={{
            flex: { xs: "1", md: "1" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 3, sm: 6 },
            bgcolor: "#F8FAFC",
          }}
        >
          <Container maxWidth="xs" disableGutters sx={{ width: "100%" }}>
            {children}
          </Container>

          <Typography
            variant="caption"
            color="#94A3B8"
            align="center"
            sx={{ mt: 4, display: { xs: "block", md: "none" }, fontWeight: 500 }}
          >
            © 2026 IntraSphere Smart Office
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
