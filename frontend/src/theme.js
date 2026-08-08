import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode = "light") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976D2",
        light: "#42A5F5",
        dark: "#1565C0",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: "#00ACC1",
        light: "#26C6DA",
        dark: "#00838F",
        contrastText: "#FFFFFF",
      },
      success: {
        main: "#2E7D32",
        light: "#4CAF50",
        dark: "#1B5E20",
        contrastText: "#FFFFFF",
      },
      background: {
        default: isDark ? "#0F172A" : "#F5F7FA",
        paper: isDark ? "#1E293B" : "#FFFFFF",
        subtle: isDark ? "#182234" : "#EEF2F6",
      },
      text: {
        primary: isDark ? "#F8FAFC" : "#1E293B",
        secondary: isDark ? "#94A3B8" : "#64748B",
      },
      divider: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
    },
    typography: {
      fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      h3: {
        fontWeight: 700,
        letterSpacing: "-0.5px",
      },
      h4: {
        fontWeight: 700,
        letterSpacing: "-0.5px",
      },
      h5: {
        fontWeight: 600,
        letterSpacing: "-0.3px",
      },
      h6: {
        fontWeight: 600,
      },
      subtitle1: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        textTransform: "none",
      },
    },
    shape: {
      borderRadius: 14,
    },
    shadows: [
      "none",
      "0px 2px 4px rgba(15, 23, 42, 0.03)",
      "0px 4px 8px rgba(15, 23, 42, 0.04)",
      "0px 6px 12px rgba(15, 23, 42, 0.05)",
      "0px 8px 16px rgba(15, 23, 42, 0.06)",
      "0px 10px 20px rgba(15, 23, 42, 0.07)",
      "0px 12px 24px rgba(15, 23, 42, 0.08)",
      "0px 16px 32px rgba(15, 23, 42, 0.09)",
      "0px 20px 40px rgba(15, 23, 42, 0.10)",
      ...Array(16).fill("0px 24px 48px rgba(15, 23, 42, 0.12)"),
    ],
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            borderRadius: 16,
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? "0px 10px 30px rgba(0, 0, 0, 0.4)"
              : "0px 10px 30px rgba(25, 118, 210, 0.08)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: "0.95rem",
            boxShadow: "none",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0px 6px 16px rgba(25, 118, 210, 0.25)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          containedPrimary: {
            background: "linear-gradient(135deg, #1976D2 0%, #1565C0 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #1E88E5 0%, #1976D2 100%)",
            },
          },
          containedSuccess: {
            background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #388E3C 0%, #2E7D32 100%)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#E2E8F0",
              },
              "&:hover fieldset": {
                borderColor: "#1976D2",
              },
              "&.Mui-focused fieldset": {
                borderWidth: 2,
                borderColor: "#1976D2",
                boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.12)",
              },
            },
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
    },
  });
};
