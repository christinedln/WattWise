import React, { useEffect, useState } from "react";
import { Download, ShieldAlert } from "lucide-react";
import { fetchAuditLogPage } from "../services/auditLogService";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";

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

export default function SecurityLogsPage() {
  const { role } = useAuth();
  const canViewLogs = hasPermission(role, "view_security_logs");
  const [rows, setRows] = useState([]);
  const [pageCursors, setPageCursors] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const currentCursor = pageCursors[pageIndex] || null;

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");
        const response = await fetchAuditLogPage({ cursor: currentCursor });
        if (!isMounted) {
          return;
        }
        setRows(response.rows);
        setHasMore(response.hasMore);
        setPageCursors((current) => {
          const next = [...current];
          next[pageIndex + 1] = response.lastCursor;
          return next;
        });
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Unable to load audit logs.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (canViewLogs) {
      loadPage();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [canViewLogs, currentCursor, pageIndex]);

  if (!canViewLogs) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Security logs are restricted</h2>
        </div>
        <p className="mt-3 text-sm text-yellow-700">Your role cannot view immutable audit records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Immutable audit logs</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Every privileged action is traceable</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              This table reads the audit_logs collection in pages of 25 records so investigations can scale without loading the entire history.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export logs
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      ) : null}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-700">
              <tr>
                <th className="px-4 py-4 font-medium">Action</th>
                <th className="px-4 py-4 font-medium">Actor</th>
                <th className="px-4 py-4 font-medium">Target</th>
                <th className="px-4 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading
                ? Array.from({ length: 25 }).map((_, index) => (
                  <tr key={index} className="animate-pulse border-b border-gray-200">
                    <td className="px-4 py-4"><div className="h-4 w-32 rounded-full bg-gray-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-36 rounded-full bg-gray-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
                  </tr>
                ))
                : rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-900">{row.action || "unknown_action"}</td>
                    <td className="px-4 py-4 text-gray-600">{row.actorUid || "-"}</td>
                    <td className="px-4 py-4 text-gray-600">{row.targetId || "-"}</td>
                    <td className="px-4 py-4 text-gray-600">{formatTimestamp(row.timestamp)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-600">Page {pageIndex + 1}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            disabled={pageIndex === 0 || loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPageIndex((current) => current + 1)}
            disabled={!hasMore || loading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
