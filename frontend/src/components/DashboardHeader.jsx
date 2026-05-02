import { Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function DashboardHeader({
  criticalAlerts = 0,
  onMenuClick,
  onEmailClick,
  onSoundClick,
}) {
  const location = useLocation();
  const path = location.pathname;

  const isAlertsPage = path === "/alerts";
  const isDevicesPage = path === "/devices";
  const isDashboardPage = path === "/" || path === "/dashboard";
  const isRealtimeMonitoringPage = path === "/realtime";
  const isPredictionsPage = path === "/predictions";
  const isSettingsPage = path === "/settings";

  const title = isAlertsPage
    ? "Alerts & Notifications"
    : isDevicesPage
      ? "Device Management"
      : isDashboardPage
        ? "Energy Dashboard"
        : isRealtimeMonitoringPage
          ? "Real-time Monitoring"
          : isPredictionsPage
            ? "Energy Predictions"
            : isSettingsPage
              ? "Settings"
              : "Dashboard";

  const subtitle = isAlertsPage
    ? "Device issues and anomalies"
    : isDevicesPage
      ? "Monitor, control, and analyze all connected devices"
      : isDashboardPage
        ? "Overview of system performance"
        : isRealtimeMonitoringPage
          ? "Live system activity tracking"
          : isPredictionsPage
            ? "Forecast your energy costs and usage patterns"
            : isSettingsPage
              ? "Manage your WattWise preferences and configurations"
              : "";

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between gap-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">

          {/* Burger (mobile only) */}
          <div className="md:hidden flex items-center mr-8">
            <Menu
              className="w-6 h-6 text-gray-800 cursor-pointer"
              onClick={onMenuClick}
            />
          </div>

          {/* TITLE + SUBTITLE */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">
              {title}
            </h2>

            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="flex items-center gap-3">

          {/* Email + Sound — alerts page only */}
          {isAlertsPage && (
            <>
              {/* Email */}
              <div
                onClick={onEmailClick}
                className="cursor-pointer flex items-center justify-center group"
              >
                <svg
                  className="w-6 h-6 text-gray-700 group-hover:text-green-700 transition-colors duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              {/* Sound */}
              <div
                onClick={onSoundClick}
                className="cursor-pointer flex items-center justify-center group"
              >
                <svg
                  className="w-6 h-6 text-gray-700 group-hover:text-green-700 transition-colors duration-200"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              </div>
            </>
          )}

          {/* Bell */}
          <div className="relative flex items-center justify-center">
            <Bell className="w-6 h-6 text-gray-700" />

            {criticalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {criticalAlerts}
              </span>
            )}
          </div>

        </div>
      </div>

    </div>

  );
}
