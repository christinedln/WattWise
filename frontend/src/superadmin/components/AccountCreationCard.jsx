import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, UserRoundPlus, Shield, RotateCcw } from "lucide-react";
import { createAdminAccount } from '../services/adminAccountsService';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../config/permissions';

export default function AccountCreationCard({ onSuccess }) {
  const { role } = useAuth();
  const canCreate = hasPermission(role, 'manage_users');
  const [formData, setFormData] = useState({
    email: '',
    role: 'admin',
    displayName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const result = await createAdminAccount({
        email: formData.email.toLowerCase(),
        role: formData.role,
        displayName: formData.displayName || undefined,
      });

      setSuccess(result);
      setFormData({ email: '', role: 'admin', displayName: '' });
      setTimeout(() => {
        setSuccess(null);
        if (onSuccess) onSuccess();
      }, 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ email: '', role: 'admin', displayName: '' });
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="mt-0.5 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">Account Created Successfully</p>
            <div className="mt-1 space-y-0.5 text-sm text-green-700">
              <p><span className="font-medium">Email:</span> {success.user?.email}</p>
              <p><span className="font-medium">Role:</span> {success.user?.role}</p>
              <p><span className="font-medium">UID:</span> {success.user?.uid}</p>
              <p className="mt-1 text-xs text-green-600">
                A temporary password was generated. The user should change it on first login.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">

          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-800">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-[#1a7a45]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
                  <path d="M1.5 5.5l6.5 4 6.5-4" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@company.com"
                required
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:border-[#1a7a45] focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">The user will receive a setup email with instructions</p>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-gray-800">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                <Shield className="h-4 w-4 text-[#1a7a45]" />
              </span>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full cursor-pointer appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 transition-all duration-150 focus:border-[#1a7a45] focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20"
              >
                <option value="admin">Admin</option>
                <option value="security">Security</option>
                <option value="support">Support</option>
                <option value="analyst">Analyst</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
                <svg className="h-4 w-4 text-[#1a7a45]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Select the role for this account</p>
          </div>

          {/* Display Name - full width */}
          <div className="col-span-2">
            <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium text-gray-800">
              Display Name
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2">
                <UserRoundPlus className="h-4 w-4 text-[#1a7a45]" />
              </span>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-all duration-150 focus:border-[#1a7a45] focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Optional. Full name of the admin user</p>
          </div>

          {/* Buttons - full width */}
          <div className="col-span-2 flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !canCreate}
              className={
                `inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap ` +
                (canCreate
                  ? 'border border-green-700 bg-green-700 text-white hover:bg-green-800'
                  : 'border border-gray-200 bg-gray-100 text-gray-500')
              }
            >
              {loading ? (
                <Loader className="h-4 w-4 animate-spin text-white" />
              ) : (
                <UserRoundPlus className={canCreate ? 'h-4 w-4 text-white' : 'h-4 w-4 text-gray-400'} />
              )}
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw className="h-4 w-4 text-gray-500" />
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Important Information */}
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5">
        <div className="mb-3 flex items-center gap-2.5">
          <svg className="h-5 w-5 text-[#1a7a45]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="10" cy="10" r="8.5" />
            <path d="M10 9v5M10 6.5v.5" strokeLinecap="round" />
          </svg>
          <h3 className="text-sm font-semibold text-[#1a7a45]">Important Information</h3>
        </div>
        <ul className="space-y-2">
          {[
            'A temporary password will be generated automatically',
            'The user will receive an email with instructions to set their password and access the system',
            'Custom claims will be set in Firebase Auth immediately',
            'The account will appear in the role-based accounts Firestore collection',
            'Firestore security rules will be enforced based on the role',
          ].map((item, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-green-800">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1a7a45]">
                <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 5l2.5 2.5L8 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}