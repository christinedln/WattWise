import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import "./superadmin.css";
import { AuthProvider } from "./superadmin/context/AuthContext";
import ProtectedRoute from "./superadmin/components/ProtectedRoute";
import SuperAdminLayout from "./superadmin/components/SuperAdminLayout";
import SuperAdminLoginPage from "./superadmin/pages/LoginPage";
import SuperAdminDashboardPage from "./superadmin/pages/DashboardPage";
import SuperAdminUsersPage from "./superadmin/pages/UsersPage";
import CreateAccountPage from "./superadmin/pages/CreateAccountPage";
import SecurityLogsPage from "./superadmin/pages/SecurityLogsPage";
import UnauthorizedPage from "./superadmin/pages/UnauthorizedPage";
import SectionPage from "./superadmin/pages/SectionPage";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/super-admin/login" replace />} />
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/super-admin/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/super-admin"
          element={<ProtectedRoute requiredRoles={["superadmin"]} />}
        >
          <Route element={<SuperAdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="users" element={<SuperAdminUsersPage />} />
            <Route path="create-account" element={<CreateAccountPage />} />
            <Route path="security-logs" element={<SecurityLogsPage />} />
            <Route
              path="devices"
              element={
                <SectionPage
                  title="Devices"
                  description="Manage registered meters, gateways, and device lifecycle events with role checks and server-side validation."
                  actionLabel="Review dashboard"
                  actionTo="/super-admin/dashboard"
                  requiredAction="view_devices"
                />
              }
            />
            <Route
              path="alerts"
              element={
                <SectionPage
                  title="Alerts"
                  description="Track active anomalies, alert routing, and notification policy changes for the admin team."
                  actionLabel="Open security logs"
                  actionTo="/super-admin/security-logs"
                  requiredAction="view_alerts"
                />
              }
            />
            <Route
              path="reports"
              element={
                <SectionPage
                  title="Reports"
                  description="Export compliance reports, energy summaries, and operational snapshots for investigations."
                  actionLabel="Open users"
                  actionTo="/super-admin/users"
                  requiredAction="view_reports"
                />
              }
            />
            <Route
              path="settings"
              element={
                <SectionPage
                  title="Settings"
                  description="Control organization-wide policies, retention rules, and security defaults from a single place."
                  actionLabel="Open dashboard"
                  actionTo="/super-admin/dashboard"
                  requiredAction="manage_settings"
                />
              }
            />
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