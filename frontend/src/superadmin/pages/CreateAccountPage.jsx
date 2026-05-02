import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader, UserRoundPlus, Shield, RotateCcw } from "lucide-react";
import { createAdminAccount } from '../services/adminAccountsService';

export default function CreateAccountPage() {
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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        throw new Error('Please enter a valid email address');

      const result = await createAdminAccount({
        email: formData.email.toLowerCase(),
        role: formData.role,
        displayName: formData.displayName || undefined,
      });

      setSuccess(result);
      setFormData({ email: '', role: 'admin', displayName: '' });
      setTimeout(() => setSuccess(null), 5000);
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
      <UserRoundPlus className="h-6 w-6 text-green-600" />
 </div>

  <div>
    <h2 className="text-2xl font-bold text-gray-900">
        Account Management
    </h2>

    <p className="text-sm leading-6 text-gray-400">
        Create new admin accounts with assigned roles. A temporary password will be generated and sent to the user.
     </p>
  </div>

</div>
</div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Account Created Successfully</p>
            <div className="text-sm text-green-700 mt-1 space-y-0.5">
              <p><span className="font-medium">Email:</span> {success.user?.email}</p>
              <p><span className="font-medium">Role:</span> {success.user?.role}</p>
              <p><span className="font-medium">UID:</span> {success.user?.uid}</p>
              <p className="text-xs text-green-600 mt-1">
                A temporary password was generated. The user should change it on first login.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">

        <form onSubmit={handleSubmit}>
          <div className="px-6 pt-5 pb-6 space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
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
                  className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
                    border border-gray-300 rounded-xl bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20 focus:border-[#1a7a45]
                    transition-all duration-150"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                The user will receive a setup email with instructions
              </p>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-800 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Shield className="h-4 w-4 text-[#1a7a45]" />
                </span>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full pl-9 pr-10 py-2.5 text-sm text-gray-900
                    border border-gray-300 rounded-xl bg-white appearance-none
                    focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20 focus:border-[#1a7a45]
                    transition-all duration-150 cursor-pointer"
                >
                  <option value="admin">Admin</option>
                  <option value="security">Security</option>
                  <option value="support">Support</option>
                  <option value="analyst">Analyst</option>
                  <option value="operator">Operator</option>
                  <option value="user">User</option>
                  <option value="superadmin">Super Admin (restricted)</option>
                </select>
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-[#1a7a45]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Select the role for this account
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-800 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <UserRoundPlus className="h-4 w-4 text-[#1a7a45]" />
                </span>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400
                    border border-gray-300 rounded-xl bg-white
                    focus:outline-none focus:ring-2 focus:ring-[#1a7a45]/20 focus:border-[#1a7a45]
                    transition-all duration-150"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Optional. Full name of the admin user
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#e8f5ee] border border-[#b2d8c0] px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#d4eddf] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <Loader className="h-4 w-4 animate-spin text-[#1a7a45]" />
                  : <UserRoundPlus className="h-4 w-4 text-[#1a7a45]" />
                }
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
      </div>

      {/* Important Information Box */}
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-5">
        <div className="flex items-center gap-2.5 mb-3">
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
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-green-800">
              <span className="mt-0.5 flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-[#1a7a45]">
                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
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