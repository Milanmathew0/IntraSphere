import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [role, setRole] = useState(() => localStorage.getItem("role") || "User");
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role") || "User";
    const employeeCode = localStorage.getItem("employee_code");
    return email
      ? {
          email,
          username: username || email.split("@")[0],
          role: storedRole,
          employee_code: employeeCode,
        }
      : null;
  });

  const login = (data) => {
    const authToken = data.access_token;
    const userRole = data.role || "User";
    const userEmail = data.email || "";
    const username = data.username || userEmail.split("@")[0];
    const employeeCode = data.employee_code || `EMP-${(data.user_id || "").slice(-6).toUpperCase()}`;

    localStorage.setItem("token", authToken);
    localStorage.setItem("role", userRole);
    localStorage.setItem("email", userEmail);
    localStorage.setItem("username", username);
    localStorage.setItem("employee_code", employeeCode);

    setToken(authToken);
    setRole(userRole);
    setUser({
      email: userEmail,
      username: username,
      role: userRole,
      id: data.user_id,
      employee_code: employeeCode,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("username");
    localStorage.removeItem("employee_code");

    setToken(null);
    setRole(null);
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const value = {
    token,
    role,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
