import React from 'react';
import { hasPermission } from '../config/permissions';
import { useAuth } from '../context/AuthContext';
import RoleBasedAccountsTable from '../components/RoleBasedAccountsTable';

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
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Role Management</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Role-Based Accounts</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            View all created admin accounts with their assigned roles. These accounts are stored in the roleBasedAccounts Firestore collection and linked to Firebase Auth users.
          </p>
        </div>
      </section>

      <RoleBasedAccountsTable />
    </div>
  );
}
