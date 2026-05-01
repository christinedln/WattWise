import React, { useState, useEffect } from 'react';
import { X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { updateAccountDisplayName, updateAccountRole, resetAccountPassword } from '../services/adminAccountsService';
import { ROLES } from '../config/permissions';

export default function EditAccountModal({ account, isOpen, onClose, onSuccess }) {
  const [displayName, setDisplayName] = useState(account?.displayName || '');
  const [role, setRole] = useState(account?.role || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Reset state when account changes
  useEffect(() => {
    if (account) {
      setDisplayName(account.displayName || '');
      setRole(account.role || '');
      setNewPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [account?.id]);

  if (!isOpen || !account) return null;

  const handleUpdateDisplayName = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateAccountDisplayName(account.id, displayName);
      setSuccess('Display name updated successfully');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await updateAccountRole(account.id, role);
      setSuccess('Role updated successfully');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await resetAccountPassword(account.id, newPassword.trim());
      setSuccess('Password updated successfully.');
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Account</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read-only)</label>
            <input
              type="email"
              value={account.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUpdateDisplayName}
                disabled={loading || displayName === account.displayName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <div className="flex gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a role</option>
                <option value={ROLES.SUPERADMIN}>Super Admin</option>
                <option value={ROLES.ADMIN}>Admin</option>
                <option value={ROLES.SECURITY}>Security</option>
                <option value={ROLES.SUPPORT}>Support</option>
                <option value={ROLES.ANALYST}>Analyst</option>
              </select>
              <button
                onClick={handleUpdateRole}
                disabled={loading || role === account.role}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Update
              </button>
            </div>
          </div>

          {/* Password Reset */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="space-y-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Set New Password
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="p-3 rounded-lg border border-green-200 bg-green-50 flex gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Success</p>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
