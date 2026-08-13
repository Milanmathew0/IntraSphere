import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  IconButton
} from "@mui/material";
import {
  X,
  Copy,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ChevronDown,
  User,
  Briefcase
} from "lucide-react";
import api from "../../api/axios";

export default function AddEmployeeModal({ open, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState(0); // 0: Basic Info, 1: Employment Details
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    designation_id: "",
    joining_date: ""
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [activationData, setActivationData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department_id: "",
        designation_id: "",
        joining_date: new Date().toISOString().split("T")[0]
      });
      setError("");
      setActivationData(null);
      setCopied(false);
      fetchDependencies();
    }
  }, [open]);

  const fetchDependencies = async () => {
    setFetching(true);
    try {
      const [deptRes, desigRes] = await Promise.all([
        api.get("/api/v1/departments"),
        api.get("/api/v1/designations"),
      ]);
      const depts = deptRes.data?.departments || [];
      const desigs = desigRes.data?.designations || [];

      setDepartments(depts);
      setDesignations(desigs);

      setFormData((prev) => ({
        ...prev,
        department_id: prev.department_id || (depts[0]?._id || ""),
        designation_id: prev.designation_id || (desigs[0]?._id || "")
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to load departments or designations");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextOrSubmit = (e) => {
    if (e) e.preventDefault();
    if (activeTab < 1) {
      if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
        setError("Please fill in all required basic fields (First Name, Last Name, Email, Phone).");
        return;
      }
      setError("");
      setActiveTab(1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
      setError("Please fill in all required basic details.");
      setActiveTab(0);
      return;
    }
    if (!formData.department_id || !formData.designation_id) {
      setError("Please select a department and designation.");
      setActiveTab(1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        department_id: formData.department_id,
        designation_id: formData.designation_id,
        joining_date: formData.joining_date
      };

      const response = await api.post("/api/v1/employees", payload);
      if (response.data.activation_url) {
        setActivationData(response.data);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (activationData?.activation_url) {
      navigator.clipboard.writeText(activationData.activation_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    height: "42px",
    padding: "8px 14px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    border: "1px solid #D1D5DB",
    borderRadius: "6px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s"
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "6px"
  };

  const steps = [
    { title: "Basic Information", icon: User },
    { title: "Employment Details", icon: Briefcase }
  ];

  return (
    <Dialog
      open={open}
      onClose={() => !activationData && onClose()}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
          overflow: "hidden"
        }
      }}
    >
      {/* Header Bar */}
      <DialogTitle
        sx={{
          px: 4,
          py: 2.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#FFFFFF"
        }}
        component="div"
      >
        <Typography variant="h6" fontWeight={700} color="#1E293B" component="div">
          {activationData ? "Employee Created Successfully" : "Add New Employee"}
        </Typography>
        {!activationData && (
          <IconButton onClick={onClose} sx={{ color: "#64748B", "&:hover": { bgcolor: "#F1F5F9" } }}>
            <X size={20} />
          </IconButton>
        )}
      </DialogTitle>

      {/* Step Navigation Tabs Banner */}
      {!activationData && (
        <Box
          sx={{
            bgcolor: "#F0F5FF",
            borderTop: "1px solid #E2E8F0",
            borderBottom: "1px solid #E2E8F0",
            px: 4,
            display: "flex",
            alignItems: "center",
            gap: 4
          }}
        >
          {steps.map((step, idx) => {
            const isActive = activeTab === idx;
            const isCompleted = activeTab > idx;

            return (
              <Box
                key={step.title}
                onClick={() => setActiveTab(idx)}
                sx={{
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  cursor: "pointer",
                  position: "relative",
                  userSelect: "none"
                }}
              >
                {isCompleted || isActive ? (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      bgcolor: "#2563EB",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <CheckCircle2 size={15} strokeWidth={2.5} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: "2px solid #94A3B8",
                      bgcolor: "transparent"
                    }}
                  />
                )}

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "#1E293B" : "#64748B",
                    fontSize: "14px"
                  }}
                >
                  {step.title}
                </Typography>

                {isActive && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      bgcolor: "#2563EB",
                      borderRadius: "3px 3px 0 0"
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Main Content Area */}
      <DialogContent sx={{ p: 4, py: 3.5, bgcolor: "#FFFFFF" }}>
        {fetching ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="250px">
            <CircularProgress size={36} sx={{ color: "#10B981" }} />
          </Box>
        ) : activationData ? (
          <Box textAlign="center" py={3}>
            <CheckCircle2 size={64} color="#10B981" style={{ margin: "0 auto", marginBottom: 16 }} />
            <Typography variant="h6" fontWeight={700} color="#1E293B" gutterBottom>
              {activationData.message}
            </Typography>
            <Typography variant="body2" color="#64748B" mb={3}>
              An account activation invitation has been generated. Please share this link with the employee.
            </Typography>

            <Box
              sx={{
                bgcolor: "#F8FAFC",
                p: 2.5,
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                gap: 2,
                wordBreak: "break-all"
              }}
            >
              <Typography variant="body2" sx={{ flex: 1, textAlign: "left", fontFamily: "monospace", color: "#1E293B" }}>
                {activationData.activation_url}
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                onClick={handleCopy}
                sx={{
                  bgcolor: copied ? "#10B981" : "#2563EB",
                  "&:hover": { bgcolor: copied ? "#059669" : "#1D4ED8" },
                  borderRadius: "6px",
                  textTransform: "none"
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </Box>
          </Box>
        ) : (
          <form id="add-employee-form" onSubmit={handleNextOrSubmit}>
            {error && (
              <Box
                sx={{
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#991B1B",
                  p: 1.5,
                  borderRadius: "6px",
                  fontSize: "14px",
                  mb: 3
                }}
              >
                {error}
              </Box>
            )}

            {/* TAB 0: Basic Information */}
            {activeTab === 0 && (
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }} gap={3}>
                <Box>
                  <label style={labelStyle}>First name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    style={inputStyle}
                  />
                </Box>

                <Box>
                  <label style={labelStyle}>Last name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Smith"
                    required
                    style={inputStyle}
                  />
                </Box>

                <Box>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Johnsmith@gmail.com"
                    required
                    style={inputStyle}
                  />
                </Box>

                <Box>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="245-201-5689"
                    required
                    style={inputStyle}
                  />
                </Box>

                <Box>
                  <label style={labelStyle}>Joining date *</label>
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, paddingRight: "38px" }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        color: "#64748B"
                      }}
                    >
                      <Calendar size={18} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

            {/* TAB 1: Employment Details */}
            {activeTab === 1 && (
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={3}>
                <Box>
                  <label style={labelStyle}>Department *</label>
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputStyle,
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        cursor: "pointer",
                        paddingRight: "38px"
                      }}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.department_name}
                        </option>
                      ))}
                    </select>
                    <Box
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        color: "#64748B"
                      }}
                    >
                      <ChevronDown size={18} />
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <label style={labelStyle}>Designation *</label>
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <select
                      name="designation_id"
                      value={formData.designation_id}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputStyle,
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        cursor: "pointer",
                        paddingRight: "38px"
                      }}
                    >
                      <option value="">Select Designation</option>
                      {designations.map((desig) => (
                        <option key={desig._id} value={desig._id}>
                          {desig.designation_name}
                        </option>
                      ))}
                    </select>
                    <Box
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        color: "#64748B"
                      }}
                    >
                      <ChevronDown size={18} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </form>
        )}
      </DialogContent>


      {/* Footer Action Bar */}
      <DialogActions
        sx={{
          px: 4,
          py: 2.5,
          bgcolor: "#F8FAFC",
          borderTop: "1px solid #F1F5F9",
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5
        }}
      >
        {activationData ? (
          <Button
            variant="contained"
            onClick={() => {
              onSuccess();
              onClose();
            }}
            sx={{
              bgcolor: "#10B981",
              "&:hover": { bgcolor: "#059669" },
              borderRadius: "6px",
              px: 3,
              py: 1,
              fontWeight: 600,
              textTransform: "none"
            }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{
                bgcolor: "#FFFFFF",
                border: "1px solid #D1D5DB",
                color: "#374151",
                borderRadius: "6px",
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                "&:hover": { bgcolor: "#F3F4F6", borderColor: "#9CA3AF" }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-employee-form"
              disabled={loading || fetching}
              sx={{
                bgcolor: "#10B981",
                color: "#FFFFFF",
                borderRadius: "6px",
                px: 3,
                py: 1,
                fontWeight: 600,
                fontSize: "14px",
                textTransform: "none",
                boxShadow: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                "&:hover": { bgcolor: "#059669", boxShadow: "none" }
              }}
            >
              {loading ? (
                <CircularProgress size={18} sx={{ color: "#FFFFFF" }} />
              ) : activeTab < 1 ? (
                <>
                  Save & Next <ArrowRight size={16} />
                </>
              ) : (
                "Add Employee"
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}



