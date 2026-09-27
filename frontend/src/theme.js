import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#10B981", // Crisp Emerald Green
        light: "#34D399",
        dark: "#059669",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#0F172A",
        light: "#1E293B",
        dark: "#020617",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#10B981",
        light: "#34D399",
        dark: "#059669",
        contrastText: "#FFFFFF",
      },
      warning: {
        main: "#F59E0B",
        light: "#FCD34D",
        dark: "#D97706",
        contrastText: "#FFFFFF",
      },
      error: {
        main: "#EF4444",
        light: "#F87171",
        dark: "#DC2626",
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? "#0F172A" : "#F4F7F5",
        paper: isDark ? "#1E293B" : "#FFFFFF",
        subtle: isDark ? "#182234" : "#F8FAFC",
      },
      text: {
        primary: isDark ? "#F8FAFC" : "#0F172A",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
    },
    typography: {
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h1: { fontWeight: 800, letterSpacing: "-1px" },
      h2: { fontWeight: 800, letterSpacing: "-0.8px" },
      h3: { fontWeight: 800, letterSpacing: "-0.6px" },
      h4: { fontWeight: 800, letterSpacing: "-0.5px" },
      h5: { fontWeight: 700, letterSpacing: "-0.3px" },
      h6: { fontWeight: 700, letterSpacing: "-0.2px" },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { fontWeight: 400, lineHeight: 1.6 },
      body2: { fontWeight: 400, lineHeight: 1.5 },
      button: {
        fontWeight: 700,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 14,
    },
    shadows: [
      "none",
      "0px 2px 8px rgba(15, 23, 42, 0.03)",
      "0px 4px 12px rgba(15, 23, 42, 0.04)",
      "0px 6px 16px rgba(15, 23, 42, 0.05)",
      "0px 8px 20px rgba(15, 23, 42, 0.06)",
      "0px 10px 24px rgba(15, 23, 42, 0.07)",
      "0px 12px 28px rgba(15, 23, 42, 0.08)",
      "0px 16px 32px rgba(15, 23, 42, 0.09)",
      "0px 20px 40px rgba(15, 23, 42, 0.10)",
      ...Array(16).fill("0px 24px 48px rgba(15, 23, 42, 0.12)"),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isDark ? "#0F172A" : "#F4F7F5",
            fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 16,
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: isDark
              ? "0px 10px 30px rgba(0, 0, 0, 0.4)"
              : "0px 4px 20px rgba(15, 23, 42, 0.04)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #E2E8F0",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: "10px 20px",
            fontSize: "0.88rem",
            fontWeight: 700,
            boxShadow: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0px 6px 16px rgba(16, 185, 129, 0.25)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          containedPrimary: {
            backgroundColor: "#10B981",
            "&:hover": {
              backgroundColor: "#059669",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 12,
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
              },
              "&:hover fieldset": {
                borderColor: "#10B981",
              },
              "&.Mui-focused fieldset": {
                borderWidth: 2,
                borderColor: "#10B981",
                boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.15)",
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 700,
          },
        },
      },
    },
  });
};
