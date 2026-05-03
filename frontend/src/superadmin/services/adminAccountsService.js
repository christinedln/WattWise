import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';
import { invalidateDashboardSummaryCache } from './dashboardSummaryService';
import { invalidateRoleBasedAccountsCache } from './roleBasedAccountsService';

const API_BASE_URL = 'http://localhost:5000/api/admin-accounts';

/**
 * Get the current Firebase ID token (forced refresh to get latest claims)
 */
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh to get latest custom claims
          resolve(token);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error('User not authenticated'));
      }
    });
  });
}

/**
 * Create a new admin/role-based account
 */
export async function createAdminAccount({ email, role, displayName = '' }) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email,
        role,
        displayName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create account: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Account creation error: ${error.message}`);
  } finally {
    invalidateRoleBasedAccountsCache();
    invalidateDashboardSummaryCache();
  }
}

/**
 * Update the role of an existing account
 */
export async function updateAccountRole(userId, newRole) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/${userId}/update-role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role: newRole,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update role: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Role update error: ${error.message}`);
  } finally {
    invalidateRoleBasedAccountsCache();
    invalidateDashboardSummaryCache();
  }
}

/**
 * Disable an admin account
 */
export async function disableAdminAccount(userId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/${userId}/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to disable account: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Account disable error: ${error.message}`);
  } finally {
    invalidateRoleBasedAccountsCache();
    invalidateDashboardSummaryCache();
  }
}

/**
 * Update display name of an account
 */
export async function updateAccountDisplayName(userId, newDisplayName) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/${userId}/update-display-name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        displayName: newDisplayName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update display name: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Display name update error: ${error.message}`);
  } finally {
    invalidateRoleBasedAccountsCache();
    invalidateDashboardSummaryCache();
  }
}

/**
 * Reset password for an account
 */
export async function resetAccountPassword(userId, newPassword) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/${userId}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to reset password: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Password reset error: ${error.message}`);
  }
}

/**
 * Delete an admin account
 */
export async function deleteAdminAccount(userId) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete account: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`Account deletion error: ${error.message}`);
  } finally {
    invalidateRoleBasedAccountsCache();
    invalidateDashboardSummaryCache();
  }
}
