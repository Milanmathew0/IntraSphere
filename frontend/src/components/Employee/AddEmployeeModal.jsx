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
  Briefcase,
  AlertCircle
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

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState("");
  const [activationData, setActivationData] = useState(null);
  const [copied, setCopied] = useState(false);

  // Regex rules
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const PHONE_REGEX = /^(?:\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{9}$/;
  const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

  const validateField = (name, value) => {
    let err = "";
    const strVal = String(value || "").trim();

    if (name === "first_name") {
      if (!strVal) {
        err = "First name is required.";
      } else if (strVal.length < 2) {
        err = "First name must be at least 2 characters.";
      } else if (!NAME_REGEX.test(strVal)) {
        err = "First name can only contain letters, spaces, hyphens, and apostrophes.";
      }
    } else if (name === "last_name") {
      if (!strVal) {
        err = "Last name is required.";
      } else if (!NAME_REGEX.test(strVal)) {
        err = "Last name can only contain letters, spaces, hyphens, and apostrophes.";
      }
    } else if (name === "email") {
      if (!strVal) {
        err = "Email address is required.";
      } else if (!EMAIL_REGEX.test(strVal)) {
        err = "Please enter a valid email address (e.g. johnsmith@gmail.com).";
      }
    } else if (name === "phone") {
      if (!strVal) {
        err = "Phone number is required.";
      } else if (!PHONE_REGEX.test(strVal)) {
        err = "Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9 (e.g. 9876543210 or +91 9876543210).";
      }
    } else if (name === "joining_date") {
      if (!value) {
        err = "Joining date is required.";
      }
    } else if (name === "department_id") {
      if (!value) {
        err = "Please select a department.";
      }
    } else if (name === "designation_id") {
      if (!value) {
        err = "Please select a designation.";
      }
    }
    return err;
  };

  const validateAllFields = (data) => {
    const errs = {};
    ["first_name", "last_name", "email", "phone", "joining_date", "department_id", "designation_id"].forEach((key) => {
      const err = validateField(key, data[key]);
      if (err) errs[key] = err;
    });
    return errs;
  };

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
      setTouched({});
      setErrors({});
      setError("");
      setActivationData(null);
      setCopied(false);
      fetchDependencies();
    }
  }, [open]);

  const fetchDependencies = async () => {
    setFetching(true);
    setError("");
    try {
      const [deptRes, desigRes] = await Promise.allSettled([
        api.get("/api/v1/departments/"),
        api.get("/api/v1/designations/"),
      ]);

      let depts = [];
      if (deptRes.status === "fulfilled" && deptRes.value.data?.departments) {
        depts = deptRes.value.data.departments;
      }

      let desigs = [];
      if (desigRes.status === "fulfilled" && desigRes.value.data?.designations) {
        desigs = desigRes.value.data.designations;
      }

      setDepartments(depts);
      setDesignations(desigs);

      if (deptRes.status === "rejected" || desigRes.status === "rejected") {
        setError("Failed to load departments or designations. Please check backend connection.");
      }

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
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    setTouched((prev) => ({ ...prev, [name]: true }));

    const fieldErr = validateField(name, value);
    const updatedErrors = { ...errors, [name]: fieldErr };
    setErrors(updatedErrors);

    // Automatically clear global error banner when fields become valid
    if (error) {
      const tab0Fields = ["first_name", "last_name", "email", "phone", "joining_date"];
      const hasRemainingTab0Error = tab0Fields.some((key) => validateField(key, updated[key]));
      const tab1Fields = ["department_id", "designation_id"];
      const hasRemainingTab1Error = tab1Fields.some((key) => validateField(key, updated[key]));

      if (activeTab === 0 && !hasRemainingTab0Error) {
        setError("");
      } else if (activeTab === 1 && !hasRemainingTab1Error) {
        setError("");
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const fieldErr = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldErr }));
  };

  const handleNextOrSubmit = (e) => {
    if (e) e.preventDefault();

    if (activeTab < 1) {
      // Validate Tab 0
      const tab0Fields = ["first_name", "last_name", "email", "phone", "joining_date"];
      const newTouched = { ...touched };
      const newErrors = { ...errors };
      let hasTab0Error = false;

      tab0Fields.forEach((key) => {
        newTouched[key] = true;
        const err = validateField(key, formData[key]);
        newErrors[key] = err;
        if (err) hasTab0Error = true;
      });

      setTouched(newTouched);
      setErrors(newErrors);

      if (hasTab0Error) {
        setError("Please fix the validation errors in basic information before proceeding.");
        return;
      }

      setError("");
      setActiveTab(1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const allErrs = validateAllFields(formData);
    const allTouched = {
      first_name: true,
      last_name: true,
      email: true,
      phone: true,
      joining_date: true,
      department_id: true,
      designation_id: true
    };

    setTouched(allTouched);
    setErrors(allErrs);

    // Check if Tab 0 has errors
    if (allErrs.first_name || allErrs.last_name || allErrs.email || allErrs.phone || allErrs.joining_date) {
      setError("Please fix the basic information details.");
      setActiveTab(0);
      return;
    }

    // Check if Tab 1 has errors
    if (allErrs.department_id || allErrs.designation_id) {
      setError("Please select a valid department and designation.");
      setActiveTab(1);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department_id: formData.department_id,
        designation_id: formData.designation_id,
        joining_date: formData.joining_date
      };

      const response = await api.post("/api/v1/employees", payload);
      setActivationData({
        ...response.data,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      });
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (detail === "USER_EXISTS") {
        setError("An employee or user account with this email address already exists.");
        setErrors((prev) => ({ ...prev, email: "An employee with this email already exists." }));
        setActiveTab(0);
      } else {
        setError(detail || "Failed to create employee. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const baseInputStyle = {
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
    transition: "all 0.2s ease"
  };

  const getInputStyle = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    const isValid = touched[fieldName] && !errors[fieldName] && formData[fieldName];

    return {
      ...baseInputStyle,
      borderColor: hasError ? "#EF4444" : isValid ? "#F97316" : "#D1D5DB",
      backgroundColor: hasError ? "#FEF2F2" : isValid ? "#F0FDF4" : "#FFFFFF",
      boxShadow: hasError ? "0 0 0 3px rgba(239, 68, 68, 0.12)" : isValid ? "0 0 0 3px rgba(249, 115, 22, 0.12)" : "none"
    };
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
                onClick={() => {
                  if (idx === 1 && activeTab === 0) {
                    handleNextOrSubmit();
                  } else {
                    setActiveTab(idx);
                  }
                }}
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
                      bgcolor: "#F97316",
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
                      bgcolor: "#F97316",
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
            <CircularProgress size={36} sx={{ color: "#F97316" }} />
          </Box>
        ) : activationData ? (
          <Box textAlign="center" py={3} px={2}>
            <CheckCircle2 size={64} color="#F97316" style={{ margin: "0 auto", marginBottom: 16 }} />
            
            <Typography variant="h5" fontWeight={700} color="#1E293B" gutterBottom>
              {activationData.first_name} {activationData.last_name}
            </Typography>

            <Typography variant="body1" color="#F97316" fontWeight={600} mb={2}>
              {activationData.email}
            </Typography>

            {activationData.email_sent ? (
              <Box
                sx={{
                  bgcolor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: 3,
                  p: 2.5,
                  maxWidth: 480,
                  mx: "auto",
                  mb: 1
                }}
              >
                <Typography variant="body2" color="#166534" fontWeight={600} gutterBottom>
                  Invitation email sent successfully ✓
                </Typography>
                <Typography variant="body2" color="#15803D">
                  An account activation email has been sent to <strong>{activationData.email}</strong>. The employee should check their email to activate their account and create their password.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  bgcolor: "#FFFBEB",
                  border: "1px solid #FDE68A",
                  borderRadius: 3,
                  p: 2.5,
                  maxWidth: 480,
                  mx: "auto",
                  mb: 1
                }}
              >
                <Typography variant="body2" color="#92400E" fontWeight={600} gutterBottom>
                  Employee created, but email could not be sent
                </Typography>
                <Typography variant="body2" color="#B45309">
                  The account has been created in <em>Invited</em> status. An activation email could not be delivered (Notice: {activationData.email_message || "Check SMTP credentials in .env"}). You can resend the email later.
                </Typography>
              </Box>
            )}

            {activationData.dev_activation_url && (
              <Box
                sx={{
                  mt: 2.5,
                  pt: 2,
                  borderTop: "1px dashed #CBD5E1",
                  maxWidth: 480,
                  mx: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <Typography variant="caption" color="#64748B" fontWeight={600}>
                  🛠️ Developer Action (Local Testing Only):
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  onClick={() => {
                    navigator.clipboard.writeText(activationData.dev_activation_url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  sx={{
                    borderRadius: "8px",
                    borderColor: "#94A3B8",
                    color: "#475569",
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: "12px",
                    px: 2,
                    py: 0.75,
                    "&:hover": { borderColor: "#475569", bgcolor: "#F8FAFC" }
                  }}
                >
                  {copied ? "Copied Activation Link!" : "Copy Dev Activation Link"}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <form id="add-employee-form" onSubmit={handleNextOrSubmit} noValidate>
            {error && (
              <Box
                sx={{
                  bgcolor: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#991B1B",
                  p: 1.5,
                  borderRadius: "6px",
                  fontSize: "14px",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <AlertCircle size={18} color="#991B1B" />
                <span>{error}</span>
              </Box>
            )}

            {/* TAB 0: Basic Information */}
            {activeTab === 0 && (
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }} gap={3}>
                {/* First Name */}
                <Box>
                  <label style={labelStyle}>First name *</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John"
                    style={getInputStyle("first_name")}
                  />
                  {touched.first_name && errors.first_name && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.first_name}
                    </Typography>
                  )}
                </Box>

                {/* Last Name */}
                <Box>
                  <label style={labelStyle}>Last name *</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Smith"
                    style={getInputStyle("last_name")}
                  />
                  {touched.last_name && errors.last_name && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.last_name}
                    </Typography>
                  )}
                </Box>

                {/* Email */}
                <Box>
                  <label style={labelStyle}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Johnsmith@gmail.com"
                    style={getInputStyle("email")}
                  />
                  {touched.email && errors.email && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.email}
                    </Typography>
                  )}
                </Box>

                {/* Phone */}
                <Box>
                  <label style={labelStyle}>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="9876543210"
                    style={getInputStyle("phone")}
                  />
                  {touched.phone && errors.phone && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.phone}
                    </Typography>
                  )}
                </Box>

                {/* Joining Date */}
                <Box>
                  <label style={labelStyle}>Joining date *</label>
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <input
                      type="date"
                      name="joining_date"
                      value={formData.joining_date}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{ ...getInputStyle("joining_date"), paddingRight: "38px" }}
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
                  {touched.joining_date && errors.joining_date && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.joining_date}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* TAB 1: Employment Details */}
            {activeTab === 1 && (
              <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }} gap={3}>
                {/* Department */}
                <Box>
                  <label style={labelStyle}>Department *</label>
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <select
                      name="department_id"
                      value={formData.department_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{
                        ...getInputStyle("department_id"),
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
                  {touched.department_id && errors.department_id && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.department_id}
                    </Typography>
                  )}
                </Box>

                {/* Designation */}
                <Box>
                  <label style={labelStyle}>Designation *</label>
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <select
                      name="designation_id"
                      value={formData.designation_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      style={{
                        ...getInputStyle("designation_id"),
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
                  {touched.designation_id && errors.designation_id && (
                    <Typography variant="caption" color="#DC2626" fontWeight={600} sx={{ mt: 0.5, display: "block" }}>
                      {errors.designation_id}
                    </Typography>
                  )}
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
              bgcolor: "#F97316",
              "&:hover": { bgcolor: "#EA580C" },
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
                bgcolor: "#F97316",
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
                "&:hover": { bgcolor: "#EA580C", boxShadow: "none" }
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
