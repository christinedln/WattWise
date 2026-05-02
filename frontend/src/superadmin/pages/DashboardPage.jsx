import React, { useEffect, useState } from "react";
import { Users, FileText, ShieldCheck, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { hasPermission } from "../config/permissions";
import { fetchAuditLogPage } from "../services/auditLogService";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { db } from "../../firebase";

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
    activeSessions: "-",
    securityLogs: "-",
    systemHealth: "99.9%",
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
        const [usersSnap, activeSnap, logsSnap] = await Promise.all([
          getCountFromServer(collection(db, "user")),
          getCountFromServer(
            query(collection(db, "roleBasedAccounts"), where("status", "==", "active"))
          ),
          getCountFromServer(collection(db, "audit_logs")),
        ]);

        if (!isMounted) return;

        const logCount = logsSnap.data().count;

        setStats({
          totalUsers: usersSnap.data().count,
          activeSessions: activeSnap.data().count,
          securityLogs:
            logCount >= 1000 ? `${(logCount / 1000).toFixed(1)}K` : logCount,
          systemHealth: "99.9%",
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
    { label: "Total Users", value: stats.totalUsers, icon: Users },
    { label: "Active Sessions", value: stats.activeSessions, icon: Activity },
    { label: "Security Logs", value: stats.securityLogs, icon: FileText },
    { label: "System Health", value: stats.systemHealth, icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back,{" "}
              {profile?.displayName || profile?.email || "Super Admin"}
            </h1>
            <p className="text-gray-500 mt-2">
              Manage users, devices, and system security
            </p>
          </div>

          <Link
            to="/super-admin/security-logs"
            className="inline-flex items-center gap-2 bg-green-600 !text-white px-5 py-3 rounded-lg font-medium shadow-sm hover:bg-green-700 hover:shadow-md transition-all duration-200 active:scale-95"
          >
            View Security Logs
          </Link>
        </div>
      </section>

      {/* SUMMARY CARDS (LIVE READINGS STYLE GREEN BOX) */}
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
                {/* FORCED GREEN ICON BACKGROUND */}
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-green-600" />
                </div>

                {/* TEXT */}
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTENT GRID */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">

        {/* ACTIVITY */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">

          <div className="p-6 border-b border-gray-100">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Activity
            </p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">
              Recent privileged activity
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Target</th>
                  <th className="px-4 py-3 text-left">Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {recentLogs.length ? (
                  recentLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t border-gray-100 hover:bg-gray-50/70 transition"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {log.action}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {log.targetId || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-10 text-gray-400"
                    >
                      No audit logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition p-6">

          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold uppercase text-gray-500">
                System Status
              </p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                Security overview
              </h3>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-gray-600">
            <li className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 hover:bg-gray-100 transition">
              <span className="font-medium text-gray-900">
                Authentication:
              </span>{" "}
              Firebase secured
            </li>

            <li className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 hover:bg-gray-100 transition">
              <span className="font-medium text-gray-900">
                Authorization:
              </span>{" "}
              Role-based access control
            </li>

            <li className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3 hover:bg-gray-100 transition">
              <span className="font-medium text-gray-900">
                Audit Logs:
              </span>{" "}
              Fully monitored system
            </li>
          </ul>

        </div>

      </section>
    </div>
  );
}