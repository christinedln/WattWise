import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  User2,
  Bell, CircleDot,
} from "lucide-react";
import { apiFetch } from "../../api/api";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";

const SEVERITY_STYLES = {
  Critical: "border-red-200 bg-red-50 text-red-700",
  Suspicious: "border-amber-200 bg-amber-50 text-amber-700",
  Warning: "border-orange-200 bg-orange-50 text-orange-700",
  Info: "border-sky-200 bg-sky-50 text-sky-700",
  Unknown: "border-gray-200 bg-gray-50 text-gray-700",
};

const STATUS_STYLES = {
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  open: "border-rose-200 bg-rose-50 text-rose-700",
};

function formatTimestamp(value) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = "text-gray-900",
  iconTone = "text-gray-500",
  bg = "bg-white",
  border = "border-gray-100",
}) {
  return (
    <div className={`relative ${bg} border ${border} rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>

      {/* ICON */}
      {Icon ? (
        <div className="absolute top-4 right-4 w-10 h-10 rounded-lg  flex items-center justify-center">
          <Icon className={`h-5 w-5 ${iconTone}`} />
        </div>
      ) : null}

      {/* TEXT */}
      <div className="!font-apple">
        <p className="text-m font-semibold uppercase tracking-widest text-gray-700">
          {label}
        </p>

        {/* ONLY THIS IS BLACK */}
        <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>

        <p className="mt-1 text-xs text-gray-500">{sub}</p>
      </div>
    </div>
  );
}

function SeverityPill({ severity }) {
  const label = severity || "Unknown";
  const className = SEVERITY_STYLES[label] || SEVERITY_STYLES.Unknown;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-sm px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span className="h-1.5 w-1.5 bg-current" />
      {label}
    </span>
  );
}

function StatusPill({ resolved }) {
  const className = resolved ? STATUS_STYLES.resolved : STATUS_STYLES.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {resolved ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <ShieldAlert className="h-3.5 w-3.5" />
      )}
      {resolved ? "Resolved" : "Open"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center text-gray-500">
      <BellRing className="h-10 w-10 text-gray-300" />
      <p className="text-sm font-medium text-gray-600">No alerts matched the current filters.</p>
      <p className="max-w-md text-sm text-gray-400">Adjust severity, status, or search terms to see the latest anomalies.</p>
    </div>
  );
}

export default function AlertsPage() {
  const { role } = useAuth();
  const canViewAlerts = hasPermission(role, "view_alerts");
  const canManageAlerts = hasPermission(role, "manage_alerts");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({
    totalAlerts: 0,
    unresolvedAlerts: 0,
    criticalAlerts: 0,
    emailedAlerts: 0,
    usersAffected: 0,
    devicesAffected: 0,
  });
  const [topUsers, setTopUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Open");
  const [savingId, setSavingId] = useState("");

  async function loadAlerts() {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/superadmin/alerts");
      setAlerts(response.alerts || []);
      setSummary({
        totalAlerts: 0,
        unresolvedAlerts: 0,
        criticalAlerts: 0,
        emailedAlerts: 0,
        usersAffected: 0,
        devicesAffected: 0,
        ...(response.summary || {}),
      });
      setTopUsers(response.topUsers || []);
    } catch (fetchError) {
      setError(fetchError.message || "Unable to load alerts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canViewAlerts) {
      setLoading(false);
      return;
    }

    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewAlerts]);

  const filteredAlerts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === "All" || alert.severity === severityFilter;
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Open" && !alert.resolved) ||
        (statusFilter === "Resolved" && alert.resolved);
      const matchesSearch =
        !searchTerm ||
        [alert.user_name, alert.user_email, alert.device_name, alert.device_id, alert.signal]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchTerm));

      return matchesSeverity && matchesStatus && matchesSearch;
    });
  }, [alerts, search, severityFilter, statusFilter]);

  async function toggleResolved(alert) {
    if (!canManageAlerts || savingId) {
      return;
    }

    try {
      setSavingId(alert.id);
      const nextResolved = !alert.resolved;

      await apiFetch(`/superadmin/alerts/${alert.id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ resolved: nextResolved }),
      });

      setAlerts((current) =>
        current.map((item) =>
          item.id === alert.id ? { ...item, resolved: nextResolved } : item,
        ),
      );

      setSummary((current) => ({
        ...current,
        unresolvedAlerts: Math.max(0, current.unresolvedAlerts + (nextResolved ? -1 : 1)),
      }));
    } catch (resolveError) {
      setError(resolveError.message || "Unable to update alert.");
    } finally {
      setSavingId("");
    }
  }

  if (!canViewAlerts) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Alerts are restricted</h2>
        </div>
        <p className="mt-3 text-sm text-yellow-700">
          Your current role cannot view the superadmin alert console.
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <BellRing className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Alert operations center</h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                This view aggregates anomaly documents across users and devices so the superadmin team can see who is affected, what is unresolved, and where the critical cases are concentrated.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAlerts}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Open alerts"
          value={summary.unresolvedAlerts}
          sub="Requires attention"
          icon={ShieldAlert}
          tone="text-black"
          iconTone="text-amber-600"
          bg="bg-amber-50"
          border="border-amber-200"
        />

        <StatCard
          label="Critical"
          value={summary.criticalAlerts}
          sub="Highest priority"
          icon={AlertTriangle}
          tone="text-black"
          iconTone="text-red-600"
          bg="bg-red-50"
          border="border-red-200"
        />

        <StatCard
          label="Users affected"
          value={summary.usersAffected}
          sub="Distinct user accounts"
          icon={User2}
          tone="text-black"
          iconTone="text-green-600"
          bg="bg-green-50"
          border="border-green-200"
        />

        <StatCard
          label="Devices affected"
          value={summary.devicesAffected}
          sub="Distinct device nodes"
          icon={Server}
          tone="text-black"
          iconTone="text-sky-600"
          bg="bg-sky-50"
          border="border-sky-200"
        />
      </section>

<section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_290px] items-start">
  <div className="w-full min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm min-h-[600px] flex flex-col">

    {/* HEADER + CONTROLS */}
    <div className="flex flex-col gap-2 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          Alert ledger
        </h3>
        <p className="text-xs text-gray-500">
          Sorted by newest anomaly first
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">

        {/* SEARCH */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, device, signal"
            className="w-full sm:w-60 lg:w-72 rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-green-500"
          />
        </div>

        {/* SEVERITY FILTER */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500"
          >
            {["All", "Critical", "Suspicious", "Warning", "Info", "Unknown"].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS FILTER */}
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-green-500"
          >
            <option value="Open">Open</option>
            <option value="Resolved">Resolved</option>
            <option value="All">All</option>
          </select>
        </div>

      </div>
    </div>

    {/* TABLE */}
    <div className="w-full overflow-x-hidden">
      <table className="w-full table-auto text-left text-sm text-gray-600">
        <thead className="bg-green-600 text-xs uppercase tracking-wider text-white">
          <tr>
            <th className="px-4 py-3 font-semibold">Severity</th>
            <th className="px-4 py-3 font-semibold">User</th>
            <th className="px-4 py-3 font-semibold">Device</th>
            <th className="px-4 py-3 font-semibold">Signal</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Timestamp</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">

          {/* LOADING */}
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                <td className="px-4 py-3"><div className="h-7 w-20 rounded bg-gray-200" /></td>
              </tr>
            ))
          ) : filteredAlerts.length === 0 ? (

            /* EMPTY STATE */
            <tr>
              <td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-500">
                <EmptyState />
              </td>
            </tr>

          ) : (

            /* DATA ROWS */
            filteredAlerts.map((alert) => (
              <tr
                key={`${alert.path}-${alert.id}`}
                className="transition hover:bg-gray-50"
              >

                {/* Severity */}
                <td className="px-4 py-3">
                  <SeverityPill severity={alert.severity} />
                </td>

                {/* User */}
                <td className="px-4 py-3">
                  <p className="truncate max-w-[140px] text-sm font-semibold text-gray-900">
                    {alert.user_name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {alert.user_id}
                  </p>
                </td>

                {/* Device */}
                <td className="px-4 py-3">
                  <p className="truncate max-w-[140px] text-sm font-semibold text-gray-900">
                    {alert.device_name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {alert.device_id}
                  </p>
                </td>

                {/* Signal */}
                <td className="px-4 py-3 text-sm text-gray-700">
                  {alert.signal}
                  <div className="text-xs text-gray-400 mt-1">
                    {alert.latest?.current != null
                      ? `I ${alert.latest.current}`
                      : "No latest reading"}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <StatusPill resolved={alert.resolved} />

                    {alert.emailSent && (
                      <span className="inline-flex w-fit items-center gap-1.5 rounded-sm border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        <BadgeCheck className="h-4 w-4" />
                        Email sent
                      </span>
                    )}
                  </div>
                </td>

                {/* Timestamp */}
                <td className="px-4 py-3 text-sm text-gray-500">
                  {formatTimestamp(alert.timestamp)}
                </td>

                {/* ACTION */}
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleResolved(alert)}
                    disabled={!canManageAlerts || savingId === alert.id}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingId === alert.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}

                    {alert.resolved ? "Reopen" : "Resolve"}
                  </button>
                </td>

              </tr>
            ))
          )}

        </tbody>
      </table>
    </div>
  </div>


<div className="space-y-4 lg:sticky lg:top-6 w-full lg:w-[290px]">

  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 hover:border-green-200">

    {/* Header */}
    <div className="mb-3">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
        <User2 className="h-4 w-4 text-green-500" />
        Top affected users
      </h3>
      <p className="text-xs text-gray-500">
        Highest alert concentration accounts
      </p>
    </div>

    {/* List */}
    <div className="space-y-2">
      {topUsers.length === 0 ? (
        <p className="text-xs text-gray-500">No grouped user data yet.</p>
      ) : (
        topUsers.map((item) => (
          <div
            key={item.user_id}
            className="rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:bg-green-50 hover:shadow-md hover:border-green-200"
          >
            <div className="flex items-start justify-between gap-3">

              {/* User info */}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {item.user_name}
                </p>
                <p className="truncate font-mono text-[11px] text-gray-400">
                  {item.user_id}
                </p>
              </div>

              {/* Stats */}
              <div className="text-right text-xs text-gray-500 leading-tight shrink-0 space-y-1">

                <p className="font-medium text-gray-700 flex items-center justify-end gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-gray-500" />
                  {item.total}
                </p>

                <p className="flex items-center justify-end gap-1">
                  <CircleDot className="h-3.5 w-3.5 text-gray-500" />
                  {item.unresolved}
                </p>

              </div>
            </div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] text-gray-600 flex items-center gap-1">
                <Bell className="h-3 w-3 text-gray-500" />
                Critical: {item.critical}
              </span>

              <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[10px] text-gray-600 flex items-center gap-1">
                <CircleDot className="h-3 w-3 text-gray-500" />
                Open: {item.unresolved}
              </span>
            </div>

          </div>
        ))
      )}
    </div>

  </div>

<div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">

  {/* Header */}
  <h3 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-green-800">
    <ClipboardList className="h-4 w-4 text-[#1a7a45]" />
    Operational notes
  </h3>

  {/* Divider */}
  <div className="my-3 h-px w-full bg-green-100" />

  {/* List */}
  <ul className="space-y-3 text-sm leading-relaxed text-green-800">

    <li>
      The page reads anomaly documents across all users, not just the signed-in admin account.
    </li>

    <li>
      Resolve actions update the underlying anomaly record and refresh the local state.
    </li>

    <li>
      Use the filters to focus on unresolved critical cases before exporting or escalating.
    </li>

  </ul>
</div>
</div>
      </section>
    </div>
  );
}