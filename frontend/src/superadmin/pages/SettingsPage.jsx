import React, { useState } from "react";
import { Users, ShieldCheck, X, UserRoundPlus } from "lucide-react";
import { hasPermission } from "../config/permissions";
import { useAuth } from "../context/AuthContext";
import AccountCreationCard from "../components/AccountCreationCard";
import RoleBasedAccountsTable from "../components/RoleBasedAccountsTable";

export default function SettingsPage() {
  const { role } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const canViewSettings = hasPermission(role, "manage_users") || hasPermission(role, "manage_settings");

  if (!canViewSettings) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="mt-3 text-sm text-yellow-700">
          Your role cannot access the settings workspace.
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
      {/* Header */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg bg-green-50 p-2">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Settings Workspace</h2>
              <p className="text-sm leading-6 text-gray-400">
                Create admin accounts and manage role-based accounts from one place.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
            <Users className="h-4 w-4" />
            Account creation + role management
          </div>
        </div>
      </section>

      {/* Role Directory — full width */}
      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">
              Role Directory
            </p>
            <h3 className="mt-2 text-xl font-bold text-gray-900">
              Review existing role-based accounts
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Edit display names and roles, or remove accounts directly from the directory.
            </p>
          </div>

          {/* Open modal button */}
          {hasPermission(role, "manage_users") && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-green-700 bg-green-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-800 whitespace-nowrap"
            >
              <UserRoundPlus className="h-4 w-4 text-white" />
              Create Account
            </button>
          )}
        </div>

        <RoleBasedAccountsTable />
      </section>

      {/* Modal */}
      {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">

              {/* Modal header - sticky so X is always visible */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">
                    Create Account
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">Add a new admin role</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Use this form to provision a Firebase Auth user and sync it into the role-based accounts collection.
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 shrink-0 self-start"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal body - scrollable */}
              <div className="px-6 py-5 overflow-y-auto">
                <AccountCreationCard onSuccess={() => setShowModal(false)} />
              </div>

            </div>
          </div>
        )}
    
    </div>
  );
}
