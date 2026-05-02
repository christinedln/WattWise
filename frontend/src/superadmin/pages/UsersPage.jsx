import React from "react";
import { Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaginatedUsersTable from "../components/PaginatedUsersTable";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";

export default function UsersPage() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const canViewUsers = hasPermission(role, "view_users");
  const canManageUsers = hasPermission(role, "manage_users");

  if (!canViewUsers) {
    return (
      <div
        className="space-y-6"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif",
      }}
      >
        <h2 className="text-lg font-semibold">User directory restricted</h2>
        <p className="mt-3 text-sm text-yellow-700">
          Your role cannot access the admin user directory.
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
      {/* HEADER CARD */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Title section */}
          <div className="flex items-center gap-4">

  <div className="p-2 rounded-lg bg-green-50 flex items-center justify-center">
    <Users className="h-6 w-6 text-green-600" />
  </div>

  <div>
    <h2 className="text-2xl font-bold text-gray-900">
      Accounts, roles, and organizational boundaries
    </h2>

    <p className="text-sm leading-6 text-gray-400">
      The table below uses cursor-based pagination so the admin console never fetches the full user set at once.
    </p>
  </div>

</div>
          {/* Action button */}
          {canManageUsers ? (
            <button
              type="button"
              onClick={() => navigate("/super-admin/create-account")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 hover:shadow-md active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Add user
            </button>
          ) : null}

        </div>
      </section>

      {/* TABLE */}
      <PaginatedUsersTable />
    </div>
  );
}