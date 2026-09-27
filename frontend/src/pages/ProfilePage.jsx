import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Paper,
} from "@mui/material";
import AppLayout from "../components/layout/AppLayout";
import {
  Home,
  LayoutGrid,
  Utensils,
  ShoppingBag,
  Clock,
  PieChart,
  Bell,
  Settings,
  User,
  Lock,
  LogOut,
  Pencil,
  Calendar,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Dynamic logged in user info fallback
  const authEmail = user?.email || localStorage.getItem("email") || "rolandDonald@mail.com";
  const authUsername = user?.username || localStorage.getItem("username") || "Tom Shibu";
  const authRole = user?.role || localStorage.getItem("role") || "Cashier";
  const authEmpCode = user?.employee_code || localStorage.getItem("employee_code") || user?.id || "6a6f4585c0b0fe8983e77c8";

  const nameParts = authUsername.trim().split(" ");
  const defaultFirstName = nameParts[0] || "Roland";
  const defaultLastName = nameParts.slice(1).join(" ") || "Donald";

  const [activeNav, setActiveNav] = useState("profile");
  const [activeSubTab, setActiveSubTab] = useState("personal");

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("user_profile_details");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      gender: "male",
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: authEmail,
      address: "3605 Parker Rd.",
      phone: "(405) 555-0128",
      dob: "1 Feb, 1995",
      location: "Atlanta, USA",
      postalCode: "30301",
      designation: authRole === "User" ? "Cashier" : authRole,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
      emailVerified: true,
    };
  });

  const [formData, setFormData] = useState({ ...profileData });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    enable2FA: true,
  });

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setToast({ open: true, message, severity });
  };

  useEffect(() => {
    const fetchBackendProfile = async () => {
      if (!authEmail) return;
      try {
        const response = await api.get("/api/v1/employees");
        const employees = response.data?.employees || [];
        const matched = employees.find(
          (emp) => emp.email?.toLowerCase() === authEmail.toLowerCase()
        );

        if (matched) {
          const fetched = {
            gender: matched.gender?.toLowerCase() || "male",
            firstName: matched.first_name || defaultFirstName,
            lastName: matched.last_name || defaultLastName,
            email: matched.email || authEmail,
            address: matched.address || "3605 Parker Rd.",
            phone: matched.phone || "(405) 555-0128",
            dob: matched.dob || "1 Feb, 1995",
            location: matched.location || "Atlanta, USA",
            postalCode: matched.postal_code || "30301",
            designation: matched.designation_id || (authRole === "User" ? "Cashier" : authRole),
            avatarUrl: matched.profile_image || profileData.avatarUrl,
            emailVerified: true,
          };
          setProfileData(fetched);
          setFormData(fetched);
          localStorage.setItem("user_profile_details", JSON.stringify(fetched));
        }
      } catch (err) {
        console.log("Using cached profile data:", err);
      }
    };

    fetchBackendProfile();
  }, [authEmail]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setFormData((prev) => ({ ...prev, avatarUrl: newAvatar }));
        setProfileData((prev) => ({ ...prev, avatarUrl: newAvatar }));
        showToast("Profile picture updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    setProfileData({ ...formData });
    localStorage.setItem("user_profile_details", JSON.stringify(formData));

    const newFullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (newFullName) {
      localStorage.setItem("username", newFullName);
    }
    if (formData.email) {
      localStorage.setItem("email", formData.email);
    }

    showToast("Profile changes saved successfully!");
  };

  const handleDiscardChanges = () => {
    setFormData({ ...profileData });
    showToast("Changes discarded.", "info");
  };

  const handleSaveSecurity = () => {
    if (!securityData.currentPassword) {
      showToast("Please enter your current password.", "error");
      return;
    }
    if (securityData.newPassword.length < 6) {
      showToast("New password must be at least 6 characters.", "error");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      showToast("New password and confirm password do not match.", "error");
      return;
    }
    showToast("Password updated successfully!");
    setSecurityData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSidebarNav = (id) => {
    setActiveNav(id);
    if (id === "home") navigate("/dashboard");
    else if (id === "table") navigate("/workspaces");
    else if (id === "menu") navigate("/meeting-rooms");
    else if (id === "order") navigate("/leave");
    else if (id === "history") navigate("/dashboard");
    else if (id === "report") navigate("/employees");
    else if (id === "alert") showToast("Notification center opened", "info");
    else if (id === "settings") setActiveNav("profile");
    else if (id === "profile") setActiveNav("profile");
  };

  return (
    <AppLayout activeTabOverride="profile">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <Box sx={{ width: "100%" }}>
        {/* Header Title */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight={800} color="#0F172A" letterSpacing={-0.5}>
            My Profile & Account Settings
          </Typography>
          <Typography variant="body2" color="#64748B" mt={0.25}>
            Manage your personal profile, credentials, preferences, and password.
          </Typography>
        </Box>

        {/* Main Container Card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            bgcolor: "#FFFFFF",
            borderRadius: "20px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            p: { xs: 2, md: 3 },
          }}
        >
        {/* Main Content Area: Side-by-Side Flex Box */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "flex-start",
            gap: { xs: 3, md: 3.5 },
            width: "100%",
          }}
        >
          {/* Left Sub-Panel: Options Card */}
          <Box
            sx={{
              width: { xs: "100%", md: "310px", lg: "330px" },
              flexShrink: 0,
              bgcolor: "#FFFFFF",
              borderRadius: "24px",
              p: { xs: 3, md: 3.5 },
              border: "1px solid #F1F5F9",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              minHeight: { md: 520 },
            }}
          >
            <Box sx={{ position: "relative", mb: 2 }}>
              <Avatar
                src={formData.avatarUrl}
                sx={{
                  width: 110,
                  height: 110,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "4px solid #FFFFFF",
                }}
              >
                {formData.firstName.charAt(0)}
              </Avatar>

              <Box
                onClick={handleAvatarClick}
                sx={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "#ED6C02",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 4px 10px rgba(237, 108, 2, 0.4)",
                  transition: "all 0.2s ease",
                  border: "2.5px solid #FFFFFF",
                  "&:hover": {
                    transform: "scale(1.1)",
                    bgcolor: "#D95B16",
                  },
                }}
              >
                <Pencil size={15} color="#FFFFFF" />
              </Box>
            </Box>

            <Typography
              variant="h6"
              fontWeight={700}
              color="#0F172A"
              sx={{ fontSize: "1.15rem", mb: 0.3 }}
            >
              {`${formData.firstName} ${formData.lastName}`}
            </Typography>
            <Typography
              variant="body2"
              color="#64748B"
              fontWeight={500}
              sx={{ fontSize: "0.85rem", mb: 3.5, wordBreak: "break-all" }}
            >
              {formData.designation || authEmpCode}
            </Typography>

            <Stack spacing={1.5} width="100%">
              <Box
                onClick={() => setActiveSubTab("personal")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1.4,
                  borderRadius: "30px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  bgcolor: activeSubTab === "personal" ? "#FFF0E6" : "transparent",
                  color: activeSubTab === "personal" ? "#ED6C02" : "#475569",
                  border: activeSubTab === "personal" ? "1px solid #FFD8C2" : "1px solid transparent",
                  "&:hover": {
                    bgcolor: activeSubTab === "personal" ? "#FFF0E6" : "#F8FAFC",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: activeSubTab === "personal" ? "#ED6C02" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={16} color={activeSubTab === "personal" ? "#FFFFFF" : "#64748B"} />
                </Box>
                <Typography fontWeight={600} sx={{ fontSize: "0.92rem" }}>
                  Personal Information
                </Typography>
              </Box>



              <Box
                onClick={handleLogout}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1.4,
                  borderRadius: "30px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  color: "#64748B",
                  "&:hover": {
                    bgcolor: "#FEF2F2",
                    color: "#EF4444",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LogOut size={16} />
                </Box>
                <Typography fontWeight={600} sx={{ fontSize: "0.92rem" }}>
                  Log Out
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right Main Panel: Form Content RIGHT NEXT TO Options */}
          <Box
            sx={{
              flex: 1,
              width: "100%",
              minWidth: 0,
              bgcolor: "#FFFFFF",
              borderRadius: "24px",
              p: { xs: 3, md: 4 },
              border: "1px solid #F1F5F9",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.03)",
              minHeight: { md: 520 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {activeSubTab === "personal" ? (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#0F172A"
                    sx={{ fontSize: "1.35rem", mb: 2 }}
                  >
                    Personal Information
                  </Typography>

                  <Stack direction="row" spacing={3} alignItems="center" mb={2}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleChange("gender", "male")}
                    >
                      <Typography fontWeight={500} color="#334155" sx={{ fontSize: "0.92rem" }}>
                        Male
                      </Typography>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: "2px solid #ED6C02",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {formData.gender === "male" && (
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: "#ED6C02",
                            }}
                          />
                        )}
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleChange("gender", "female")}
                    >
                      <Typography fontWeight={500} color="#334155" sx={{ fontSize: "0.92rem" }}>
                        Female
                      </Typography>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          border: formData.gender === "female" ? "2px solid #ED6C02" : "2px solid #CBD5E1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {formData.gender === "female" && (
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: "#ED6C02",
                            }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2.5,
                    width: "100%",
                  }}
                >
                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      First Name
                    </Typography>
                    <Box
                      component="input"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Last Name
                    </Typography>
                    <Box
                      component="input"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Email
                    </Typography>
                    <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Box
                        component="input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        sx={{
                          width: "100%",
                          py: 1.3,
                          pl: 2,
                          pr: 12,
                          borderRadius: "14px",
                          bgcolor: "#F4F5F7",
                          border: "1px solid transparent",
                          outline: "none",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "#0F172A",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          "&:focus": {
                            bgcolor: "#FFFFFF",
                            borderColor: "#ED6C02",
                            boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          right: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: "#F97316",
                          fontWeight: 600,
                          fontSize: "0.82rem",
                        }}
                      >
                        <CheckCircle2 size={16} color="#F97316" />
                        <Typography variant="caption" fontWeight={600} color="#F97316">
                          Verified
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Address
                    </Typography>
                    <Box
                      component="input"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Phone Number
                    </Typography>
                    <Box
                      component="input"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Date of Birth
                    </Typography>
                    <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Box
                        component="input"
                        value={formData.dob}
                        onChange={(e) => handleChange("dob", e.target.value)}
                        sx={{
                          width: "100%",
                          py: 1.3,
                          pl: 2,
                          pr: 5,
                          borderRadius: "14px",
                          bgcolor: "#F4F5F7",
                          border: "1px solid transparent",
                          outline: "none",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "#0F172A",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          "&:focus": {
                            bgcolor: "#FFFFFF",
                            borderColor: "#ED6C02",
                            boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          right: 14,
                          color: "#64748B",
                          display: "flex",
                          pointerEvents: "none",
                        }}
                      >
                        <Calendar size={18} />
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Location
                    </Typography>
                    <Box sx={{ position: "relative", display: "flex", alignItems: "center" }}>
                      <Box
                        component="input"
                        value={formData.location}
                        onChange={(e) => handleChange("location", e.target.value)}
                        sx={{
                          width: "100%",
                          py: 1.3,
                          pl: 2,
                          pr: 5,
                          borderRadius: "14px",
                          bgcolor: "#F4F5F7",
                          border: "1px solid transparent",
                          outline: "none",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          color: "#0F172A",
                          fontFamily: "inherit",
                          transition: "all 0.2s ease",
                          "&:focus": {
                            bgcolor: "#FFFFFF",
                            borderColor: "#ED6C02",
                            boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          right: 14,
                          color: "#64748B",
                          display: "flex",
                          pointerEvents: "none",
                        }}
                      >
                        <ChevronDown size={18} />
                      </Box>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Postal Code
                    </Typography>
                    <Box
                      component="input"
                      value={formData.postalCode}
                      onChange={(e) => handleChange("postalCode", e.target.value)}
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2} mt={3}>
                  <Box
                    component="button"
                    onClick={handleDiscardChanges}
                    sx={{
                      py: 1.3,
                      px: 4,
                      borderRadius: "30px",
                      border: "2px solid #ED6C02",
                      bgcolor: "transparent",
                      color: "#ED6C02",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#FFF0E6",
                      },
                    }}
                  >
                    Discard Changes
                  </Box>

                  <Box
                    component="button"
                    onClick={handleSaveChanges}
                    sx={{
                      py: 1.3,
                      px: 5,
                      borderRadius: "30px",
                      border: "none",
                      bgcolor: "#ED6C02",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(237, 108, 2, 0.35)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#D95B16",
                        boxShadow: "0 8px 24px rgba(237, 108, 2, 0.45)",
                      },
                    }}
                  >
                    Save Changes
                  </Box>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#0F172A"
                    sx={{ fontSize: "1.35rem", mb: 0.5 }}
                  >
                    Login & Password
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    Manage your account authentication credentials and security settings.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2.5,
                    width: "100%",
                  }}
                >
                  <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Current Password
                    </Typography>
                    <Box
                      component="input"
                      type="password"
                      placeholder="••••••••"
                      value={securityData.currentPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      New Password
                    </Typography>
                    <Box
                      component="input"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={securityData.newPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" color="#64748B" fontWeight={500} display="block" mb={0.6}>
                      Confirm Password
                    </Typography>
                    <Box
                      component="input"
                      type="password"
                      placeholder="Re-enter new password"
                      value={securityData.confirmPassword}
                      onChange={(e) =>
                        setSecurityData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      sx={{
                        width: "100%",
                        py: 1.3,
                        px: 2,
                        borderRadius: "14px",
                        bgcolor: "#F4F5F7",
                        border: "1px solid transparent",
                        outline: "none",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                        color: "#0F172A",
                        fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        "&:focus": {
                          bgcolor: "#FFFFFF",
                          borderColor: "#ED6C02",
                          boxShadow: "0 0 0 3px rgba(237, 108, 2, 0.15)",
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography fontWeight={600} color="#0F172A" sx={{ fontSize: "0.92rem" }}>
                          Two-Factor Authentication (2FA)
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          Add an extra layer of security to your account upon login.
                        </Typography>
                      </Box>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={securityData.enable2FA}
                            onChange={(e) =>
                              setSecurityData((prev) => ({
                                ...prev,
                                enable2FA: e.target.checked,
                              }))
                            }
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": { color: "#ED6C02" },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                backgroundColor: "#ED6C02",
                              },
                            }}
                          />
                        }
                        label=""
                      />
                    </Box>
                  </Box>
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2} mt={3}>
                  <Box
                    component="button"
                    onClick={() =>
                      setSecurityData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                        enable2FA: true,
                      })
                    }
                    sx={{
                      py: 1.3,
                      px: 4,
                      borderRadius: "30px",
                      border: "2px solid #ED6C02",
                      bgcolor: "transparent",
                      color: "#ED6C02",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": { bgcolor: "#FFF0E6" },
                    }}
                  >
                    Discard Changes
                  </Box>

                  <Box
                    component="button"
                    onClick={handleSaveSecurity}
                    sx={{
                      py: 1.3,
                      px: 5,
                      borderRadius: "30px",
                      border: "none",
                      bgcolor: "#ED6C02",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      cursor: "pointer",
                      boxShadow: "0 6px 18px rgba(237, 108, 2, 0.35)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: "#D95B16",
                        boxShadow: "0 8px 24px rgba(237, 108, 2, 0.45)",
                      },
                    }}
                  >
                    Save Password
                  </Box>
                </Stack>
              </Stack>
            )}
          </Box>
        </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          severity={toast.severity}
          sx={{
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            fontWeight: 600,
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
        </Paper>
      </Box>
    </AppLayout>
  );
}
