import { Bell, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function DashboardHeader({
  criticalAlerts = 0,
  onMenuClick,
  onEmailClick,
  onSoundClick,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const titleMap = {
    "/super-admin/dashboard": ["Dashboard", "Overview of system performance"],
    "/super-admin/users": ["User Management", "Manage all system users"],
    "/super-admin/create-account": ["Create Account", "Create new user accounts"],
    "/super-admin/role-based-accounts": ["Role-Based Accounts", "Manage roles and permissions"],
    "/super-admin/devices": ["Device Management", "Monitor and manage devices"],
    "/super-admin/alerts": ["Alerts & Notifications", "Device issues and anomalies"],
    "/super-admin/reports": ["Reports & Analytics", "System reports and analytics"],
    "/super-admin/security-logs": ["Security Logs", "Track security activity"],
    "/super-admin/settings": ["Settings", "Configure system settings"],
    // "/super-admin/mfa-setup": ["MFA Setup", "Set up multi-factor authentication"],
  };

  const [title, subtitle] = titleMap[pathname] || ["Dashboard", ""];

  return (
    <div
      className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-6 py-3"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div className="flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* MENU BUTTON */}
          <div className="lg:hidden">
            <Menu
              className="w-6 h-6 cursor-pointer text-gray-700 hover:text-gray-900 transition"
              onClick={onMenuClick}
            />
          </div>

          {/* TITLE SECTION */}
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 tracking-tight">
              {title}
            </h2>

            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* NOTIFICATION BELL */}
          <button
            type="button"
            onClick={() => navigate("/super-admin/alerts")}
            className="relative cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Open alerts"
          >
            <Bell className="w-5 h-5 text-gray-700" />

            {criticalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-4 h-4 px-1 flex items-center justify-center rounded-full">
                {criticalAlerts > 9 ? "9+" : criticalAlerts}
              </span>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}