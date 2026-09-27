import { Box, Typography, Container, Paper } from "@mui/material";
import { BrandLogo } from "./BrandLogo";

export function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        backgroundColor: "#FAFAFA",
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
        {/* Left Side: Minimal Black & White Hero */}
        <Box
          sx={{
            flex: { xs: "none", md: "1" },
            bgcolor: "#09090B",
            color: "#FFFFFF",
            p: { xs: 4, sm: 6, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* Top Brand Logo */}
          <Box>
            <BrandLogo size="medium" lightText />
          </Box>

          {/* Center Content: Title, Subtitle, Tagline, & Minimal Graphic */}
          <Box sx={{ my: "auto", py: 4, maxWidth: 480 }}>
            {/* Minimal SVG Graphic Icon */}
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                <path d="M5 21V7L13 3V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 21V11L13 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 10H10" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 14H10" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1.5,
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                letterSpacing: "-0.5px",
                color: "#FFFFFF",
              }}
            >
              IntraSphere
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#A1A1AA",
                mb: 2,
                fontSize: "1.1rem",
              }}
            >
              Smart Office Management System
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.75)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              }}
            >
              "Securely manage employees, workspaces, meetings and office operations."
            </Typography>
          </Box>

          {/* Bottom Footer Note */}
          <Typography variant="caption" sx={{ color: "rgba(255, 255, 255, 0.4)" }}>
            © 2026 IntraSphere. All rights reserved.
          </Typography>
        </Box>

        {/* Right Side: Clean Login / Registration Card */}
        <Box
          sx={{
            flex: { xs: "1", md: "1" },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 3, sm: 6 },
            backgroundColor: "#F5F7FA",
          }}
        >
          <Container maxWidth="xs" disableGutters sx={{ width: "100%" }}>
            {children}
          </Container>

          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            sx={{ mt: 4, display: { xs: "block", md: "none" } }}
          >
            © 2026 IntraSphere
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
