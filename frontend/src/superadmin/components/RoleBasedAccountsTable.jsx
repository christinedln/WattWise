import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { fetchRoleBasedAccountsPage } from '../services/roleBasedAccountsService';
import { deleteAdminAccount } from '../services/adminAccountsService';
import EditAccountModal from './EditAccountModal';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedAccountsTable() {
  const { role } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRoleBasedAccountsPage({ cursor: null });
      setAccounts(result.rows);
      setCursor(result.lastCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!cursor) return;
    setLoading(true);
    try {
      const result = await fetchRoleBasedAccountsPage({ cursor });
      setAccounts((prev) => [...prev, ...result.rows]);
      setCursor(result.lastCursor);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId, accountEmail) => {
    if (!window.confirm(`Are you sure you want to delete ${accountEmail}? This cannot be undone.`)) {
      return;
    }

    setDeletingId(accountId);
    try {
      await deleteAdminAccount(accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Accounts</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Display Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  {loading ? 'Loading accounts...' : 'No role-based accounts yet'}
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">{account.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                      {account.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{account.displayName || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        account.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {account.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {account.createdAt
                      ? new Date(account.createdAt).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingAccount(account);
                          setShowEditModal(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {role === 'superadmin' && (
                        <button 
                          onClick={() => handleDeleteAccount(account.id, account.email)}
                          disabled={deletingId === account.id}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
                        >
                          {deletingId === account.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            Load More
          </button>
        </div>
      )}

      <EditAccountModal
        account={editingAccount}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(null);
        }}
        onSuccess={loadAccounts}
      />
    </div>
  );
}
