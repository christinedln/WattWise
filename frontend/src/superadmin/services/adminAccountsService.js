import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

const API_BASE_URL = 'http://localhost:5000/api/admin-accounts';

/**
 * Get the current Firebase ID token
 */
async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        try {
          const token = await user.getIdToken();
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
  }
}
