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
  Menu,
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
  // { to: "/super-admin/mfa-setup", label: "MFA Setup", icon: ShieldCheck },
];

export default function SuperAdminLayout() {
  const { profile, signOutUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-lg hover:bg-gray-100"
      >
        <Menu className="w-6 h-6 text-gray-800" />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static top-0 left-0
          h-screen w-64 bg-white shadow-xl z-50
          flex flex-col
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex flex-col p-4 h-full min-h-0">

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

          {/* DIVIDER */}
          <div className="border-b border-gray-300 mb-4" />

          {/* NAVIGATION */}
          <nav className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-0">
            {navigationItems.map((item) => (
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
                {({ isActive }) => {
                  const Icon = item.icon;

                  return (
                    <>
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? "text-green-600" : "text-gray-800"
                        }`}
                      />

                      <span
                        className={`text-sm ${
                          isActive ? "text-green-600 font-medium" : "text-gray-800"
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  );
                }}
              </NavLink>
            ))}
          </nav>

          {/* BOTTOM SECTION */}
          <div className="border-t pt-4 mt-4">

            <p className="font-semibold text-sm text-gray-800">
              {profile?.displayName || profile?.email || "Super Admin"}
            </p>

            <p className="font-italic text-sm text-gray-500">{profile?.role || ""}</p>

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
      <div className="flex flex-col flex-1 h-screen overflow-hidden">

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