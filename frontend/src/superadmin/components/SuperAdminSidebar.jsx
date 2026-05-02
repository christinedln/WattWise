import React, { useState } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCog,
  Server,
  BellRing,
  FileText,
  ClipboardList,
  Settings,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../config/permissions";
import DashboardHeader from "./SuperAdminHeader";

const navigationItems = [
  { to: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard, action: "view_dashboard" },
  { to: "/super-admin/users", label: "Users", icon: Users, action: "view_users" },
  { to: "/super-admin/create-account", label: "Create Account", icon: UserPlus, action: "manage_users" },
  { to: "/super-admin/role-based-accounts", label: "Roles", icon: UserCog, action: "view_users" },
  { to: "/super-admin/devices", label: "Devices", icon: Server, action: "view_devices" },
  { to: "/super-admin/alerts", label: "Alerts", icon: BellRing, action: "view_alerts" },
  { to: "/super-admin/reports", label: "Reports", icon: FileText, action: "view_reports" },
  { to: "/super-admin/security-logs", label: "Logs", icon: ClipboardList, action: "view_security_logs" },
  { to: "/super-admin/settings", label: "Settings", icon: Settings, action: "manage_settings" },
  { to: "/super-admin/mfa-setup", label: "MFA Setup", icon: ShieldCheck, action: "configure_mfa" },
];

export default function SuperAdminLayout() {
  const { profile, role, signOutUser } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* MAIN WRAPPER */}
      <div className="flex min-h-screen h-screen bg-gray-50 overflow-hidden">

        {/* SIDEBAR */}
        <aside
          className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-xl z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
        >
          <div className="flex flex-col p-4 h-full">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/icon.png" className="w-10 h-10 rounded-md" alt="logo" />
                <h2 className="text-xl font-bold text-gray-800">WattWise</h2>
              </div>

              <button onClick={() => setIsOpen(false)} className="md:hidden">
                <X size={22} />
              </button>
            </div>

            <div className="border-b mb-4" />

            {/* NAVIGATION (NO SCROLLBAR CONTAINER HERE) */}
            <nav className="flex flex-col gap-2 flex-1 overflow-hidden">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                const hasAccess = hasPermission(role, item.action);

                if (!hasAccess) return null;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition
                      ${isActive ? "bg-green-50 text-green-600" : "text-gray-800 hover:bg-gray-100"}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* USER SECTION */}
            <div className="border-t pt-4 mt-4">
              <p className="font-semibold text-sm text-gray-800">
                {profile?.displayName || "Loading..."}
              </p>

              <p className="text-xs text-gray-500 truncate">
                {profile?.email || ""}
              </p>

              <button
                onClick={signOutUser}
                className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                <LogOut className="inline w-4 h-4 mr-2" />
                Logout
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN CONTENT (ONLY SCROLL AREA) */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* HEADER */}
          <DashboardHeader
            criticalAlerts={3}
            onMenuClick={() => setIsOpen(true)}
            icon={
              <div className="flex items-center gap-3">
                <img src="/icon.png" className="w-10 h-10 rounded-md" alt="logo" />
                <h2 className="text-xl font-bold text-gray-800">WattWise</h2>
              </div>
            }
          />

          {/* SCROLL ONLY HERE */}
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>

        </div>
      </div>
    </>
  );
}