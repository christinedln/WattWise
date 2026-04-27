import React, { useEffect, useState } from "react";
import { Users, FileText, ShieldCheck, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchAuditLogPage } from "../services/auditLogService";

const summaryCards = [
  { label: "Total Users", value: "48", icon: Users, color: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "Active Sessions", value: "24", icon: Activity, color: "bg-green-100", iconColor: "text-green-600" },
  { label: "Security Logs", value: "1.2K", icon: FileText, color: "bg-purple-100", iconColor: "text-purple-600" },
  { label: "System Health", value: "99.9%", icon: ShieldCheck, color: "bg-orange-100", iconColor: "text-orange-600" },
];

function formatTimestamp(value) {
  if (!value) {
    return "-";
  }

  const date = value.toDate ? value.toDate() : new Date(value);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function DashboardPage() {
  const { profile, role } = useAuth();
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    let isMounted = true;

    fetchAuditLogPage({ pageSize: 5 })
      .then((response) => {
        if (isMounted) {
          setRecentLogs(response.rows);
        }
      })
      .catch(() => {
        if (isMounted) {
          setRecentLogs([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {profile?.displayName || profile?.email || "Super Admin"}</h1>
            <p className="text-gray-500 mt-2">Manage users, devices, and system security</p>
          </div>
          <Link
            to="/super-admin/security-logs"
            className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition"
          >
            View Security Logs
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
              <div className={`inline-flex ${card.color} rounded-lg p-3 mb-4`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <p className="text-gray-500 text-sm">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">Activity</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Recent privileged activity</h3>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs font-medium text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Action</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentLogs.length ? recentLogs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{log.action || "unknown_action"}</td>
                    <td className="px-4 py-3 text-gray-600">{log.targetId || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{formatTimestamp(log.timestamp)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">
                      No audit logs have been loaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase">System Status</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Security overview</h3>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="font-medium text-gray-900">Authentication:</span> All users verified via Firebase Auth
            </li>
            <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="font-medium text-gray-900">Authorization:</span> Role-based access control active
            </li>
            <li className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <span className="font-medium text-gray-900">Audit Logs:</span> All actions logged and monitored
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
