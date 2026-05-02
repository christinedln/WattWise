import React, { useState, useEffect } from "react";
import { Loader, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { fetchRoleBasedAccountsPage } from "../services/roleBasedAccountsService";
import { deleteAdminAccount } from "../services/adminAccountsService";
import EditAccountModal from "./EditAccountModal";
import { useAuth } from "../context/AuthContext";

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
    if (
      !window.confirm(
        `Are you sure you want to delete ${accountEmail}? This cannot be undone.`
      )
    ) return;

    setDeletingId(accountId);

    try {
      await deleteAdminAccount(accountId);
      setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  /* ERROR STATE */
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">
            Error Loading Accounts
          </h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden"
      style={{
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-gray-600">

          {/* HEADER */}
          <thead className="bg-green-600 text-white text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Email</th>
              <th className="px-6 py-3 text-left font-semibold">Role</th>
              <th className="px-6 py-3 text-left font-semibold">Display Name</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Created</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-gray-200">

            {accounts.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-10 text-gray-500">
                  {loading ? "Loading accounts..." : "No role-based accounts yet"}
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr
                  key={account.id}
                  className="bg-white hover:bg-green-50/40 transition"
                >
                  {/* EMAIL */}
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {account.email}
                  </td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-xs font-semibold capitalize">
                      {account.role}
                    </span>
                  </td>

                  {/* DISPLAY NAME */}
                  <td className="px-6 py-4 text-gray-700">
                    {account.displayName || "-"}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${
                        account.status === "active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {account.status || "active"}
                    </span>
                  </td>

                  {/* CREATED */}
                  <td className="px-6 py-4 text-gray-600">
                    {account.createdAt
                      ? new Date(account.createdAt).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">

                      <button
                        onClick={() => {
                          setEditingAccount(account);
                          setShowEditModal(true);
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-green-600 hover:bg-green-50 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>

                      {role === "superadmin" && (
                        <button
                          onClick={() =>
                            handleDeleteAccount(account.id, account.email)
                          }
                          disabled={deletingId === account.id}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
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

      {/* LOAD MORE */}
      {hasMore && (
        <div className="flex justify-center py-4 border-t border-gray-200">
          <button
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
          >
            {loading && <Loader className="h-4 w-4 animate-spin" />}
            Load More
          </button>
        </div>
      )}

      {/* MODAL */}
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