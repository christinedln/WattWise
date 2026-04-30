import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  BellRing,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Settings,
  Users,
  Server,
  FileText,
  Bell,
  Search,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../config/permissions";

const navigationItems = [
  { to: "/super-admin/dashboard", label: "Dashboard", icon: LayoutDashboard, action: "view_dashboard" },
  { to: "/super-admin/users", label: "Users", icon: Users, action: "view_users" },
  { to: "/super-admin/create-account", label: "Create Account", icon: UserPlus, action: "manage_users" },
  { to: "/super-admin/devices", label: "Devices", icon: Server, action: "view_devices" },
  { to: "/super-admin/alerts", label: "Alerts", icon: BellRing, action: "view_alerts" },
  { to: "/super-admin/reports", label: "Reports", icon: FileText, action: "view_reports" },
  { to: "/super-admin/security-logs", label: "Security Logs", icon: ClipboardList, action: "view_security_logs" },
  { to: "/super-admin/settings", label: "Settings", icon: Settings, action: "manage_settings" },
  { to: "/super-admin/mfa-setup", label: "MFA Setup", icon: ShieldCheck, action: "configure_mfa" },
];

function NavigationItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200",
          isActive
            ? "bg-green-100 text-green-700"
            : "text-gray-700 hover:bg-gray-100",
        ].join(" ")
      }
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );
}

export default function SuperAdminLayout() {
  const { profile, role, signOutUser, idleRemaining } = useAuth();
  const location = useLocation();
  const visibleNavigationItems = navigationItems.filter((item) => hasPermission(role, item.action));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white shadow-md lg:flex p-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xl font-bold">⚡</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">WattWise</h2>
          </div>

          <nav className="flex flex-col gap-2 flex-grow">
            {visibleNavigationItems.map((item) => (
              <NavigationItem key={item.to} item={item} />
            ))}
          </nav>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {profile?.email?.charAt(0).toUpperCase() || "A"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{profile?.displayName || profile?.email || "Super Admin"}</p>
                <p className="text-sm text-gray-500">{role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOutUser}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, devices..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-500" />
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
