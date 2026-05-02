import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, UserCircle2 } from "lucide-react";
import { fetchUsersPage, SUPER_ADMIN_PAGE_SIZE } from "../services/usersService";

function maskEmail(email = "") {
  const [localPart, domain = ""] = email.split("@");
  if (!localPart || !domain) return email;
  const visiblePrefix = localPart.slice(0, 2);
  const visibleSuffix = localPart.slice(-1);
  return `${visiblePrefix}${"*".repeat(Math.max(2, localPart.length - 3))}${visibleSuffix}@${domain}`;
}

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

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-200">
      <td className="px-4 py-4"><div className="h-4 w-40 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-52 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-20 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-28 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-24 rounded-full bg-gray-200" /></td>
    </tr>
  );
}

export default function PaginatedUsersTable({ organizationId = null }) {
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
        const response = await fetchUsersPage({
          cursor: currentCursor,
          organizationId,
          pageSize: SUPER_ADMIN_PAGE_SIZE,
        });

        if (!isMounted) return;

        setRows(response.rows);
        setHasMore(response.hasMore);
        setPageCursors((current) => {
          const next = [...current];
          next[pageIndex + 1] = response.lastCursor;
          return next;
        });
      } catch (fetchError) {
        if (isMounted) setError(fetchError.message || "Unable to load users.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPage();
    return () => { isMounted = false; };
  }, [currentCursor, organizationId, pageIndex]);

  const canGoPrevious = pageIndex > 0;
  const canGoNext = hasMore;

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white shadow-md p-6"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", letterSpacing: '-0.01em' }}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Users</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900">Paginated user directory</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 font-medium">
          <ShieldCheck className="h-4 w-4" />
          25 rows per page
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
            <thead className="bg-white text-xs uppercase font-medium text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 font-medium">User</th>
                <th className="px-4 py-4 font-medium">Email</th>
                <th className="px-4 py-4 font-medium">Role</th>
                <th className="px-4 py-4 font-medium">Organization</th>
                <th className="px-4 py-4 font-medium">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: SUPER_ADMIN_PAGE_SIZE }).map((_, index) => <SkeletonRow key={index} />)
                : rows.map((row) => (
                  <tr key={row.id} className="bg-white transition hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {/* White background avatar circle with green icon border */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-green-200">
                          <UserCircle2 className="h-6 w-6 text-[#1a7a45]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{row.displayName || row.fullName || "Unnamed user"}</p>
                          <p className="text-xs text-gray-400">UID: {row.uid || row.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{maskEmail(row.email || row.emailAddress || "")}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md border border-green-200 bg-white px-3 py-1 text-xs font-medium text-green-700">
                        {row.role || "user"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{row.organizationName || row.organizationId || "Global"}</td>
                    <td className="px-4 py-4 text-gray-600">{formatTimestamp(row.lastActiveAt || row.updatedAt || row.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Page {pageIndex + 1} {rows.length ? `• ${rows.length} records loaded` : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPageIndex((current) => Math.max(0, current - 1))}
            disabled={!canGoPrevious || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPageIndex((current) => current + 1)}
            disabled={!canGoNext || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1a7a45] bg-white px-4 py-2 text-sm font-semibold text-[#1a7a45] transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
