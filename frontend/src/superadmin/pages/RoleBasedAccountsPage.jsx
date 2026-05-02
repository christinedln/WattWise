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
              <UserCog className="h-5 w-5 text-[#1a7a45]" />
  </div>

  <div>
    <h2 className="text-2xl font-bold text-gray-900">Role Management    </h2>

    <p className="text-sm leading-6 text-gray-400">
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