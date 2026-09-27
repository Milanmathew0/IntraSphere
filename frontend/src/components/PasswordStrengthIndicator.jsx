import { Box, LinearProgress, Typography, Stack } from "@mui/material";

export function PasswordStrengthIndicator({ password = "" }) {
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "inherit" };

    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 25;
    if (/\d/.test(pwd)) score += 25;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { score: 25, label: "Weak", color: "#D32F2F" };
    if (score <= 50) return { score: 50, label: "Fair", color: "#ED6C02" };
    if (score <= 75) return { score: 75, label: "Good", color: "#047857" };
    return { score: 100, label: "Strong", color: "#2E7D32" };
  };

  const { score, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <Box sx={{ mt: 1, mb: 1, width: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Password strength:
        </Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ color }}>
          {label}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: color,
            borderRadius: 3,
            transition: "all 0.3s ease",
          },
        }}
      />
    </Box>
  );
}
