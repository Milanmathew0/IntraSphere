import { Box, Typography, Container } from "@mui/material";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

export function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#F8FAFC",
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
        py: { xs: 4, sm: 6 },
        px: 2,
        boxSizing: "border-box",
      }}
    >
      {/* Centered Brand Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: "#F97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(249, 115, 22, 0.35)",
          }}
        >
          <SparklesIcon sx={{ color: "#FFFFFF", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            color="#0F172A"
            sx={{ letterSpacing: -0.5, lineHeight: 1.1 }}
          >
            IntraSphere
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#64748B", fontWeight: 600, fontSize: "0.75rem" }}
          >
            Smart Office System
          </Typography>
        </Box>
      </Box>

      {/* Centered Content Container */}
      <Container
        maxWidth="sm"
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 1, sm: 2 },
        }}
      >
        {children}
      </Container>

      {/* Footer */}
      <Typography
        variant="caption"
        color="#94A3B8"
        align="center"
        sx={{ mt: 4, fontWeight: 500 }}
      >
        © 2026 IntraSphere Inc. All rights reserved.
      </Typography>
    </Box>
  );
}
