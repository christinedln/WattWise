import React from 'react';
import { hasPermission } from '../config/permissions';
import { useAuth } from '../context/AuthContext';
import RoleBasedAccountsTable from '../components/RoleBasedAccountsTable';
import { UserCog } from "lucide-react";

export default function RoleBasedAccountsPage() {
  const { role } = useAuth();
  const canViewUsers = hasPermission(role, 'view_users');

  if (!canViewUsers) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-yellow-800">
        <h2 className="text-lg font-semibold">Access Restricted</h2>
        <p className="mt-3 text-sm text-yellow-700">
          Your role cannot access the role-based accounts directory.
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif", letterSpacing: '-0.01em' }}
    >
      {/* Header Card */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#e8f5ee] border border-[#b2d8c0] flex-shrink-0">
              <UserCog className="h-5 w-5 text-[#1a7a45]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-medium">Role Management</p>
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
                View all created admin accounts with their assigned roles. These accounts are stored in the
                roleBasedAccounts Firestore collection and linked to Firebase Auth users.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RoleBasedAccountsTable />
    </div>
  );
}