import { Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function DashboardHeader({
  criticalAlerts = 0,
  onMenuClick
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
        <div className="relative">
          <Bell className="w-6 h-6 text-gray-700" />

          {criticalAlerts > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              {criticalAlerts}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}