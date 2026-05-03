import React, { useEffect, useMemo, useState } from "react";
import { Download, FileText, ShieldAlert, Users, Server, AlertTriangle } from "lucide-react";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../../api/api";
import { fetchAuditLogPage } from "../services/auditLogService";

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

function downloadCsv(rows) {
  if (!rows.length) return;

  const headers = ["timestamp", "action", "actorUid", "targetId", "ipAddress"];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((key) => JSON.stringify(row[key] ?? "")).join(",")),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wattwise-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { role } = useAuth();
  const canViewReports = hasPermission(role, "view_reports");
  const [auditRows, setAuditRows] = useState([]);
  const [overview, setOverview] = useState({
    criticalAlerts: 0,
    unresolvedAlerts: 0,
    emailedAlerts: 0,
    usersAffected: 0,
    devicesAffected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        // Minor addition:
        const [logsPage, alertsSummary] = await Promise.all([
        fetchAuditLogPage({ pageSize: 10 }),
        apiFetch("/superadmin/alerts").catch(() => null), // ← just add .catch(() => null)
      ]);

        if (!isMounted) return;

        setAuditRows(logsPage.rows || []);
        setOverview({
          criticalAlerts: alertsSummary?.summary?.criticalAlerts || 0,
          unresolvedAlerts: alertsSummary?.summary?.unresolvedAlerts || 0,
          emailedAlerts: alertsSummary?.summary?.emailedAlerts || 0,
          usersAffected: alertsSummary?.summary?.usersAffected || 0,
          devicesAffected: alertsSummary?.summary?.devicesAffected || 0,
        });
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to load reports.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (canViewReports) {
      loadReports();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [canViewReports]);

  const reportCards = useMemo(() => [
  {
    label: "Critical Alerts",
    value: overview.criticalAlerts,
    icon: ShieldAlert,
    tone: "text-black",
    iconTone: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    hover: "hover:border-red-300 hover:bg-red-100",
  },
  {
    label: "Unresolved Alerts",
    value: overview.unresolvedAlerts,
    icon: AlertTriangle,
    tone: "text-black",
    iconTone: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    hover: "hover:border-amber-300 hover:bg-amber-100",
  },
  {
    label: "Users Affected",
    value: overview.usersAffected,
    icon: Users,
    tone: "text-black",
    iconTone: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    hover: "hover:border-green-300 hover:bg-green-100",
  },
  {
    label: "Devices Affected",
    value: overview.devicesAffected,
    icon: Server,
    tone: "text-black",
    iconTone: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    hover: "hover:border-sky-300 hover:bg-sky-100",
  },
], [overview]);

  if (!canViewReports) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="mt-3 text-sm text-yellow-700">
          Your role cannot access reports.
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg bg-green-50 p-2">
              <FileText className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Reports and Activity Snapshot
              </h2>

              <p className="text-sm leading-6 text-gray-400">
                Live report data built from audit logs and the superadmin alert summary.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => downloadCsv(auditRows)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export current reports
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
  {reportCards.map((card) => {
    const Icon = card.icon;

    return (
<div
  key={card.label}
  className={`rounded-2xl border ${card.border} ${card.bg} p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-opacity-80`}
>
  <div className="flex justify-between gap-4 items-start">
    
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
        {card.label}
      </p>

      <p className="mt-2 text-3xl font-bold text-black">
        {loading ? "-" : card.value}
      </p>
    </div>

    <div className="pt-1">
      <Icon className={`h-6 w-6 ${card.iconTone}`} />
    </div>

  </div>
</div>
    );
  })}
</section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Audit Entries</h3>
          <p className="mt-1 text-sm text-gray-500">This is the live security and admin trail surfaced from the audit_logs collection.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-600">
            <thead className="bg-green-600 text-xs uppercase tracking-wide text-white">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Action</th>
                <th className="px-5 py-3.5 font-semibold">Actor</th>
                <th className="px-5 py-3.5 font-semibold">Target</th>
                <th className="px-5 py-3.5 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 10 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-36 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-40 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
                  </tr>
                ))
                : auditRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-gray-900">{row.action || "unknown_action"}</td>
                    <td className="px-5 py-4 text-gray-600">{row.actorUid || "-"}</td>
                    <td className="px-5 py-4 text-gray-600">{row.targetId || "-"}</td>
                    <td className="px-5 py-4 text-gray-600">{formatTimestamp(row.timestamp)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
