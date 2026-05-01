import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../firebase";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, ArrowRight, Cpu, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 25;

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-gray-200">
      <td className="px-4 py-4"><div className="h-4 w-40 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-32 rounded-full bg-gray-200" /></td>
      <td className="px-4 py-4"><div className="h-4 w-24 rounded-full bg-gray-200" /></td>
    </tr>
  );
}

export default function DevicesPage() {
  const { role } = useAuth();
  const canViewDevices = hasPermission(role, "view_devices");

  const [rows, setRows]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [pageCursors, setPageCursors] = useState([null]);
  const [pageIndex, setPageIndex]     = useState(0);
  const [hasMore, setHasMore]         = useState(false);

  const currentCursor = pageCursors[pageIndex] || null;

  useEffect(() => {
    if (!canViewDevices) return;
    let isMounted = true;

    async function loadPage() {
      try {
        setLoading(true);
        setError("");

        const constraints = [orderBy("__name__"), limit(PAGE_SIZE)];
        if (currentCursor) constraints.push(startAfter(currentCursor));

        const snapshot = await getDocs(query(collection(db, "devices"), ...constraints));
        if (!isMounted) return;

        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          owners: doc.data().owners || [],
          ...doc.data(),
        }));

        setRows(fetched);
        setHasMore(snapshot.docs.length === PAGE_SIZE);
        setPageCursors((prev) => {
          const next = [...prev];
          next[pageIndex + 1] = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null;
          return next;
        });
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load devices.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPage();
    return () => { isMounted = false; };
  }, [currentCursor, pageIndex, canViewDevices]);

  if (!canViewDevices) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Access restricted</h2>
        </div>
        <p className="mt-3 max-w-2xl text-sm text-yellow-700">
          Your current role does not have permission to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs uppercase tracking-widest font-medium text-green-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super Admin Module
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">Devices</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Manage registered meters, gateways, and device lifecycle events with role checks and server-side validation.
            </p>
          </div>
          <Link
            to="/super-admin/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
          >
            Review dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-md p-6">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Firestore · devices</p>
            <h3 className="mt-1 text-xl font-bold text-gray-900">Registered devices</h3>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 font-medium">
            <ShieldCheck className="h-4 w-4" />
            {PAGE_SIZE} rows per page
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-700">
                <tr>
                  <th className="px-4 py-4 font-medium">Device ID</th>
                  <th className="px-4 py-4 font-medium">Owners</th>
                  <th className="px-4 py-4 font-medium">Owner Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : rows.length === 0
                  ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-sm text-gray-500">
                        No devices found in Firestore.
                      </td>
                    </tr>
                  )
                  : rows.map((device) => (
                    <tr key={device.id} className="bg-white transition hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-green-600">
                            <Cpu className="h-5 w-5" />
                          </div>
                          <p className="font-semibold text-gray-900 font-mono text-xs">{device.id}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          {device.owners.length > 0
                            ? device.owners.map((uid, i) => (
                              <span key={i} className="font-mono text-xs text-gray-600 truncate max-w-xs">
                                {uid}
                              </span>
                            ))
                            : <span className="text-gray-400 text-xs">No owners</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          {device.owners.length} {device.owners.length === 1 ? "owner" : "owners"}
                        </span>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Page {pageIndex + 1} {rows.length ? `· ${rows.length} records loaded` : ""}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0 || loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={!hasMore || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}