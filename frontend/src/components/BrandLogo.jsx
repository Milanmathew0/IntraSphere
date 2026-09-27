import { Box, Typography } from "@mui/material";

export function BrandLogo({ size = "medium", lightText = false }) {
  const iconSize = size === "large" ? 40 : 32;
  const fontSize = size === "large" ? "1.5rem" : "1.25rem";

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1.25,
        userSelect: "none",
      }}
    >
      {/* Sleek Minimal Office Icon */}
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: "10px",
          backgroundColor: "#F97316",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize * 0.6}
          height={iconSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9" />
          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8" />
        </svg>
      </Box>

      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: fontSize,
          letterSpacing: "-0.3px",
          color: lightText ? "#FFFFFF" : "#1E293B",
        }}
      >
        Intra<span style={{ color: "#F97316" }}>Sphere</span>
      </Typography>
    </Box>
  );
}
