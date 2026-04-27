import React from "react";
import { Plus } from "lucide-react";
import PaginatedUsersTable from "../components/PaginatedUsersTable";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";

export default function UsersPage() {
  const { role } = useAuth();
  const canViewUsers = hasPermission(role, "view_users");
  const canManageUsers = hasPermission(role, "manage_users");

  if (!canViewUsers) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <h2 className="text-lg font-semibold">User directory restricted</h2>
        <p className="mt-3 text-sm text-yellow-700">
          Your role cannot access the admin user directory.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">User management</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">Accounts, roles, and organizational boundaries</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              The table below uses cursor-based pagination so the admin console never fetches the full user set at once.
            </p>
          </div>
          {canManageUsers ? (
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add user
            </button>
          ) : null}
        </div>
      </section>

      <PaginatedUsersTable />
    </div>
  );
}
