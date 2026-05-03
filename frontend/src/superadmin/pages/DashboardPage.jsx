import React, { useEffect, useState } from "react";
import { Users, FileText, ShieldCheck, Activity, ActivityIcon, Lock, Sparkles, ShieldAlert} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../config/permissions";
import { fetchAuditLogPage } from "../services/auditLogService";
import { fetchDashboardSummary } from "../services/dashboardSummaryService";

function formatTimestamp(value) {
  if (!value) return "-";
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
  const [stats, setStats] = useState({
    totalUsers: "-",
    activeUsers: "-",
    admins: "-",
  });

  const canViewDashboard = hasPermission(role, "view_dashboard");

  useEffect(() => {
    let isMounted = true;

    fetchAuditLogPage({ pageSize: 5 })
      .then((res) => {
        if (isMounted) setRecentLogs(res.rows);
      })
      .catch(() => {
        if (isMounted) setRecentLogs([]);
      });

    async function fetchStats() {
      try {
        const summary = await fetchDashboardSummary();

        if (!isMounted) return;

        setStats({
          totalUsers: summary.totalUsers,
          activeUsers: summary.activeUsers,
          admins: summary.admins,
        });
      } catch (e) {
        console.error(e);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!canViewDashboard) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-yellow-800 shadow-sm">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="mt-2 text-sm text-yellow-700">
          Your role does not have permission to view the dashboard.
        </p>
      </div>
    );
  }

 const summaryCards = [
  {
    label: "Total Users",
    value: stats.totalUsers,
    icon: Users,
    subtitle: "Total user accounts in Firestore",
  },
  {
    label: "Active Users",
    value: stats.activeUsers,
    icon: Activity,
    subtitle: "Users active in the last 30 days",
  },
  {
    label: "Admins",
    value: stats.admins,
    icon: FileText,
    subtitle: "Active role-based accounts",
  },
];
  return (
    <div
      className="space-y-6"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
      }}
    >

      {/* HEADER */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

  {/* Welcome section */}
  <div className="flex items-center gap-4">

  <div className="p-2 rounded-lg bg-green-50 flex items-center justify-center">
    <Sparkles className="w-6 h-6 text-green-600" />
  </div>

  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Welcome back,{" "}
      {profile?.displayName || profile?.email || "Super Admin"}
    </h1>

    <p className="text-gray-500">
      Manage users, devices, and system security
    </p>
  </div>

</div>
  {/* Button */}
  <Link
    to="/super-admin/security-logs"
    className="inline-flex items-center gap-2 bg-green-600 px-5 py-3 rounded-lg font-medium shadow-sm hover:bg-green-700 hover:shadow-md transition-all duration-200 active:scale-95"
    style={{ color: "#ffffff" }}
  >
    <ShieldAlert className="w-5 h-5" />
    View Security Logs
  </Link>

</div>
</section>

      {/* SUMMARY */}
      <section className="bg-green-50/40 border border-green-200 rounded-2xl p-6 shadow-sm">
  <div className="mb-5">
    <h3 className="font-semibold text-lg text-gray-900">
      System Summary
    </h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    {summaryCards.map((card, idx) => {
      const Icon = card.icon;

      return (
        <div
          key={idx}
          className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-green-600" />
          </div>

          {/* make content column full height */}
          <div className="flex flex-col flex-1" style={{ minHeight: 70 }}>
            <p className="text-xs text-gray-500">{card.label}</p>

            <p className="text-xl font-bold text-gray-900">
              {card.value}
            </p>

            {/* pushed to bottom */}
            <p className="text-[11px] text-gray-400 mt-auto leading-tight">
              {card.subtitle}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</section>

      {/* ACTIVITY + STATUS */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">

        {/* ACTIVITY */}
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">

  {/* Header */}
  <div className="p-6 border-b border-gray-100">

    {/* Header (MATCHED LAYOUT) */}
    <div className="flex items-center gap-3">

      <div className="p-2 rounded-lg bg-green-50">
        <ActivityIcon className="h-5 w-5 text-green-600" />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase text-green-600 tracking-wide">
          Activity
        </p>

        <h3 className="text-xl font-bold text-gray-900">
          Recent privileged activity
        </h3>
      </div>
      </div>
      </div>

  {/* Table */}
  <div className="overflow-x-auto">

    <table className="w-full text-sm">

      {/* Head */}
      <thead className="bg-green-600 text-white text-xs uppercase tracking-wider">
        <tr className="bg-green-600 text-white">
  <th className="px-5 py-3 text-left font-semibold">
    Action
  </th>
  <th className="px-5 py-3 text-left font-semibold">
    Target
  </th>
  <th className="px-5 py-3 text-left font-semibold">
    Timestamp
  </th>
</tr>
      </thead>

      {/* Body */}
      <tbody className="divide-y divide-gray-100">

        {recentLogs.length ? (
          recentLogs.map((log) => (
            <tr
              key={log.id}
              className="bg-white hover:bg-green-50/40 transition"
            >

              {/* Action */}
              <td className="px-5 py-4 font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  {log.action}
                </div>
              </td>

              {/* Target */}
              <td className="px-5 py-4 text-gray-600">
                {log.targetId || "-"}
              </td>

              {/* Timestamp */}
              <td className="px-5 py-4 text-gray-500">
                {formatTimestamp(log.timestamp)}
              </td>

            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center py-12 text-gray-400">
              No audit logs available
            </td>
          </tr>
        )}

      </tbody>
    </table>
  </div>
</div>

{/* SYSTEM STATUS */}
<div className="rounded-2xl border border-green-100 bg-white shadow-sm p-6 hover:shadow-lg transition-all duration-300">

  {/* Header */}
  <div className="flex items-center gap-3 mb-5">
    <div className="p-2 rounded-lg bg-green-50">
      <ShieldCheck className="h-5 w-5 text-green-600" />
    </div>

    <div>
      <p className="text-xs font-semibold uppercase text-green-600 tracking-wide">
        System Status
      </p>
      <h3 className="text-xl font-bold text-gray-900">
        Security Overview
      </h3>
    </div>
  </div>

  {/* List */}
  <ul className="space-y-3 text-sm text-gray-700">

    <li className="flex items-start gap-3 rounded-xl border border-green-50 bg-green-50/40 px-4 py-3 transition hover:bg-green-50 hover:shadow-sm">
      <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5" />
      <p>
        <span className="font-semibold text-gray-900">Authentication:</span>{" "}
        Firebase secured
      </p>
    </li>

    <li className="flex items-start gap-3 rounded-xl border border-green-50 bg-green-50/40 px-4 py-3 transition hover:bg-green-50 hover:shadow-sm">
      <Lock className="h-4 w-4 text-green-600 mt-0.5" />
      <p>
        <span className="font-semibold text-gray-900">Authorization:</span>{" "}
        Role-based access control
      </p>
    </li>

    <li className="flex items-start gap-3 rounded-xl border border-green-50 bg-green-50/40 px-4 py-3 transition hover:bg-green-50 hover:shadow-sm">
      <Activity className="h-4 w-4 text-green-600 mt-0.5" />
      <p>
        <span className="font-semibold text-gray-900">Audit Logs:</span>{" "}
        Fully monitored system
      </p>
    </li>

  </ul>
</div>
      </section>
    </div>
  );
}