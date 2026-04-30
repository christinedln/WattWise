import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { ROLES } from '../config/permissions';
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      const result = await createAdminAccount({
        email: formData.email.toLowerCase(),
        role: formData.role,
        displayName: formData.displayName || undefined,
      });

      setSuccess(result);
      setFormData({
        email: '',
        role: 'admin',
        displayName: '',
      });

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 font-medium">Account Management</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Create Admin Account</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Create new admin or role-based accounts. The account will be created in Firebase Auth with the specified role and custom claims.
          </p>
        </div>
      </section>

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900">Account Created Successfully</h3>
            <div className="text-sm text-green-700 mt-2 space-y-1">
              <p><strong>Email:</strong> {success.user.email}</p>
              <p><strong>Role:</strong> {success.user.role}</p>
              <p><strong>UID:</strong> {success.user.uid}</p>
              <p className="mt-2 text-xs text-green-600">
                A temporary password was generated. The user should change it on first login.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@company.com"
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              The user will receive a setup email with instructions
            </p>
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-900">
              Role <span className="text-red-600">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="admin">Admin</option>
              <option value="security">Security</option>
              <option value="support">Support</option>
              <option value="analyst">Analyst</option>
              <option value="operator">Operator</option>
              <option value="user">User</option>
              <option value="superadmin">Super Admin (restricted)</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the role for this account
            </p>
          </div>

          {/* Display Name Field */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-900">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Full name of the admin user
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader className="h-4 w-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Account'}
            </button>
            <button
              type="reset"
              onClick={() => {
                setFormData({ email: '', role: 'admin', displayName: '' });
                setError(null);
                setSuccess(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Info Box */}
      <section className="rounded-lg border border-blue-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">Important Information</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800 list-disc list-inside">
          <li>A temporary password will be generated automatically</li>
          <li>The user must sign in and change their password</li>
          <li>Custom claims will be set in Firebase Auth immediately</li>
          <li>The account will appear in the role-based accounts Firestore collection</li>
          <li>Firestore security rules will be enforced based on the role</li>
        </ul>
      </section>
    </div>
  );
}
