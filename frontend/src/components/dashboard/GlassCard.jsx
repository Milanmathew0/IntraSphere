import React from "react";
import { Box, Paper } from "@mui/material";

export default function GlassCard({
  children,
  sx = {},
  glowColor = "rgba(46, 125, 50, 0.15)",
  borderColor = "rgba(255, 255, 255, 0.12)",
  hoverGlow = true,
  ...props
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        color: "#0F172A",
        position: "relative",
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${borderColor}`,
        boxShadow: `0 10px 30px 0 rgba(15, 23, 42, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.9)`,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": hoverGlow
          ? {
              transform: "translateY(-4px)",
              borderColor: "rgba(46, 125, 50, 0.3)",
              boxShadow: `0 20px 40px 0 ${glowColor}, 0 10px 30px 0 rgba(15, 23, 42, 0.08)`,
            }
          : {},
        ...sx,
      }}
      {...props}
    >
      {/* Decorative inner gradient sheen */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)",
          pointerEvents: "none",
        }}
      />
      {children}
    </Paper>
  );
}
