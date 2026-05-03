import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import "./superadmin.css";
import { AuthProvider } from "./superadmin/context/AuthContext";
import ProtectedRoute from "./superadmin/components/ProtectedRoute";
import SuperAdminSidebar from "./superadmin/components/SuperAdminSidebar";
import SuperAdminLoginPage from "./superadmin/pages/LoginPage";
import SuperAdminDashboardPage from "./superadmin/pages/DashboardPage";
import SuperAdminUsersPage from "./superadmin/pages/UsersPage";
import SecurityLogsPage from "./superadmin/pages/SecurityLogsPage";
import UnauthorizedPage from "./superadmin/pages/UnauthorizedPage";
import SectionPage from "./superadmin/pages/SectionPage";
import DevicesPage from "./superadmin/pages/DevicesPage";
import AlertsPage from "./superadmin/pages/AlertsPage";
import ReportsPage from "./superadmin/pages/ReportsPage";
import SettingsPage from "./superadmin/pages/SettingsPage";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/super-admin/login" replace />} />
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/super-admin/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/super-admin"
          element={<ProtectedRoute />}
        >
          <Route element={<SuperAdminSidebar />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="users" element={<SuperAdminUsersPage />} />
            <Route path="security-logs" element={<SecurityLogsPage />} />
              <Route path="devices" element={<DevicesPage />} />
            <Route path="alerts" element={<AlertsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="mfa-setup"
              element={
                <SectionPage
                  title="MFA Setup"
                  description="Configure multi-factor authentication for super admin accounts and recovery options for the admin pool."
                  actionLabel="Back to login"
                  actionTo="/super-admin/login"
                  requiredAction="configure_mfa"
                />
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/super-admin/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);