import React, { useState, useEffect } from 'react';
import { X, Loader, AlertCircle, CheckCircle, Shield, UserRoundPlus, KeyRound } from 'lucide-react';
import { updateAccountDisplayName, updateAccountRole, resetAccountPassword } from '../services/adminAccountsService';
import { ROLES, hasPermission } from '../config/permissions';
import { useAuth } from '../context/AuthContext';

export default function EditAccountModal({ account, isOpen, onClose, onSuccess }) {
  const { role: currentRole } = useAuth();
  const canManage = hasPermission(currentRole, 'manage_users');
  const [displayName, setDisplayName] = useState(account?.displayName || '');
  const [role, setRole] = useState(account?.role || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl mx-4 rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-green-600">
              Edit Account
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Update account details</h3>
            <p className="mt-1 text-sm text-gray-500">{account.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 shrink-0 self-start"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 overflow-y-auto space-y-5">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">Error</p>
                <p className="mt-0.5 text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">Success</p>
                <p className="mt-0.5 text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {/* Email read-only */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Email Address <span className="text-xs text-gray-400">(read-only)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                  <path d="M1.5 5.5l6.5 4 6.5-4" />
                </svg>
              </span>
              <input
                type="email"
                value={account.email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Display Name
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                  <UserRoundPlus className="h-4 w-4 text-[#1a7a45]" />
                </span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:border-[#1a7a45] focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20"
                />
              </div>
              <button
                onClick={handleUpdateDisplayName}
                disabled={loading || displayName === account.displayName || !canManage}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  canManage ? 'border border-green-700 bg-green-700 text-white hover:bg-green-800' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Update
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Optional. Full name of the account user</p>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                  <Shield className="h-4 w-4 text-[#1a7a45]" />
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 transition-all duration-150 focus:border-[#1a7a45] focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20"
                >
                  <option value="">Select a role</option>
                  <option value={ROLES.SUPERADMIN}>Super Admin</option>
                  <option value={ROLES.ADMIN}>Admin</option>
                  <option value={ROLES.SECURITY}>Security</option>
                  <option value={ROLES.SUPPORT}>Support</option>
                  <option value={ROLES.ANALYST}>Analyst</option>
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                  <svg className="h-4 w-4 text-[#1a7a45]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <button
                onClick={handleUpdateRole}
                disabled={loading || role === account.role || !canManage}
                className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  canManage ? 'border border-green-700 bg-green-700 text-white hover:bg-green-800' : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}
              >
                {loading && <Loader className="h-4 w-4 animate-spin" />}
                Update
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Select the role for this account</p>
          </div>

          {/* Password Reset */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-800">
              Reset Password
            </label>
            <div className="relative mb-2">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                <KeyRound className="h-4 w-4 text-[#1a7a45]" />
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:border-[#1a7a45] focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading || !canManage}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                canManage ? 'border border-green-700 bg-green-700 text-white hover:bg-green-800' : 'bg-gray-100 text-gray-500 border border-gray-200'
              }`}
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              Set New Password
            </button>
            <p className="mt-1.5 text-xs text-gray-400">This will immediately update the account password</p>
          </div>


        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
