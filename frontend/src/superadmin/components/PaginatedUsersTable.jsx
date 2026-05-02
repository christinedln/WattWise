import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  List,
  UserCircle2,
  Table2,
} from "lucide-react";
import { fetchUsersPage, SUPER_ADMIN_PAGE_SIZE } from "../services/usersService";

function maskEmail(email = "") {
  const [localPart, domain = ""] = email.split("@");
  if (!localPart || !domain) return email;

  const visiblePrefix = localPart.slice(0, 2);
  const visibleSuffix = localPart.slice(-1);
  return `${visiblePrefix}${"*".repeat(
    Math.max(2, localPart.length - 3)
  )}${visibleSuffix}@${domain}`;
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
        if (isMounted) {
          setError(fetchError.message || "Unable to load users.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [currentCursor, organizationId, pageIndex]);

  const canGoPrevious = pageIndex > 0;
  const canGoNext = hasMore;

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white shadow-md p-6"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">

        {/* Left */}
        <div className="flex items-center gap-3">

          <div className="p-2 rounded-lg bg-green-50 flex items-center justify-center">
  <Table2 className="h-5 w-5 text-green-600" />
</div>

         <div>
  <p
    className="text-xs uppercase tracking-widest text-gray-500 font-medium"
    style={{
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}
  >
    Users
  </p>


            <h2 className="text-xl font-bold text-gray-900">
              Paginated user directory
            </h2>
          </div>

        </div>

        {/* Right badge */}
       <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 font-medium">
  <List className="h-4 w-4" />
  25 rows per page
</div>

      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">

          <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">

           <thead className="bg-green-600 text-white text-xs uppercase tracking-wider">
  <tr>
    <th className="px-5 py-3 text-left font-semibold">
      User
    </th>
    <th className="px-5 py-3 text-left font-semibold">
      Email
    </th>
    <th className="px-5 py-3 text-left font-semibold">
      Role
    </th>
    <th className="px-5 py-3 text-left font-semibold">
      Organization
    </th>
    <th className="px-5 py-3 text-left font-semibold">
      Last Activity
    </th>
  </tr>
</thead>

            <tbody className="divide-y divide-gray-200">

              {loading
                ? Array.from({ length: SUPER_ADMIN_PAGE_SIZE }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                : rows.map((row) => (
                    <tr key={row.id} className="bg-white hover:bg-gray-50 transition">

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">

                           <div className="p-2 rounded-lg bg-green-50 flex items-center justify-center">
            <UserCircle2 className="h-5 w-5 text-green-600" />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              {row.displayName || row.fullName || "Unnamed user"}
                            </p>
                            <p className="text-xs text-gray-500">
                              UID: {row.uid || row.id}
                            </p>
                          </div>

                        </div>
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {maskEmail(row.email || row.emailAddress || "")}
                      </td>

                      <td className="px-4 py-4">
  <span
    className="
      inline-flex items-center rounded-full
      bg-green-50 text-green-700
      border border-green-200
      px-3 py-1 text-xs font-semibold
      capitalize tracking-wide
      shadow-sm
    "
  >
    {row.role || "user"}
  </span>
</td>

                      <td className="px-4 py-4 text-gray-600">
                        {row.organizationName || row.organizationId || "Global"}
                      </td>

                      <td className="px-4 py-4 text-gray-600">
                        {formatTimestamp(
                          row.lastActiveAt || row.updatedAt || row.createdAt
                        )}
                      </td>

                    </tr>
                  ))}

            </tbody>

          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <p className="text-sm text-gray-600">
          Page {pageIndex + 1}{" "}
          {rows.length ? `• ${rows.length} records loaded` : ""}
        </p>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={() => setPageIndex((c) => Math.max(0, c - 1))}
            disabled={!canGoPrevious || loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <button
            type="button"
            onClick={() => setPageIndex((c) => c + 1)}
            disabled={!canGoNext || loading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>

        </div>

      </div>

    </section>
  );
}