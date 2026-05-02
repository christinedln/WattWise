import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
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
import DashboardHeader from "./SuperAdminHeader";

const navigationItems = [
  { to: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super-admin/users", label: "Users", icon: Users },
  { to: "/super-admin/create-account", label: "Create Account", icon: UserPlus },
  { to: "/super-admin/role-based-accounts", label: "Roles", icon: UserCog },
  { to: "/super-admin/devices", label: "Devices", icon: Server },
  { to: "/super-admin/alerts", label: "Alerts", icon: BellRing },
  { to: "/super-admin/reports", label: "Reports", icon: FileText },
  { to: "/super-admin/security-logs", label: "Logs", icon: ClipboardList },
  { to: "/super-admin/settings", label: "Settings", icon: Settings },
  { to: "/super-admin/mfa-setup", label: "MFA Setup", icon: ShieldCheck },
];

export default function SuperAdminLayout() {
  const { profile, signOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen bg-gray-50 overflow-hidden"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
      }}
    >

      {/* MOBILE OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

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

          {/* NAVIGATION */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">

            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                      isActive ? "bg-green-50" : "hover:bg-gray-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition ${
                          isActive ? "text-green-600" : "text-gray-800"
                        }`}
                      />

                      <span
                        className={`text-sm font-medium transition ${
                          isActive ? "text-green-600 font-semibold" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
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
              className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              <LogOut className="inline w-4 h-4 mr-2" />
              Logout
            </button>

          </div>

        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 overflow-hidden">

        <DashboardHeader
          criticalAlerts={3}
          onMenuClick={() => setIsOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}