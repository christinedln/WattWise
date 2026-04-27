/**
 * Admin Account Management Service
 * Handles creation, retrieval, update, and deletion of admin accounts in Firestore
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const auth = admin.auth();

const ADMIN_ACCOUNTS_COLLECTION = 'admin_accounts';
const VALID_ROLES = ['superadmin', 'admin', 'security', 'support', 'analyst'];

class AdminService {
  /**
   * Create a new admin account
   * @param {string} email - Admin email address
   * @param {string} displayName - Display name for the admin
   * @param {string} role - Role (superadmin, admin, security, support, analyst)
   * @param {string} createdByUid - UID of the superadmin creating this account
   * @returns {Promise<Object>} Created admin account data with uid
   */
  static async createAdminAccount(email, displayName, role, createdByUid) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of ${VALID_ROLES.join(', ')}`);
    }

    try {
      // Create Firebase auth user
      const tempPassword = this._generateTempPassword();
      const user = await auth.createUser({
        email,
        displayName,
        password: tempPassword,
      });

      // Set custom claims for the role
      await auth.setCustomUserClaims(user.uid, { role });

      // Create Firestore document
      const adminData = {
        uid: user.uid,
        email,
        displayName,
        role,
        isActive: true,
        createdAt: admin.firestore.Timestamp.now(),
        createdBy: createdByUid,
        updatedAt: admin.firestore.Timestamp.now(),
        updatedBy: createdByUid,
        lastLoginAt: null,
      };

      await db.collection(ADMIN_ACCOUNTS_COLLECTION).doc(user.uid).set(adminData);

      return adminData;
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        throw new Error(`Email ${email} already exists`);
      }
      throw new Error(`Error creating admin account: ${error.message}`);
    }
  }

  /**
   * Get admin account by UID
   * @param {string} adminUid - Admin UID
   * @returns {Promise<Object|null>} Admin account data or null
   */
  static async getAdminAccount(adminUid) {
    try {
      const doc = await db.collection(ADMIN_ACCOUNTS_COLLECTION).doc(adminUid).get();
      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      throw new Error(`Error retrieving admin account: ${error.message}`);
    }
  }

  /**
   * List all admin accounts with optional role filter
   * @param {string|null} roleFilter - Optional role to filter by
   * @returns {Promise<Array>} List of admin accounts
   */
  static async listAdminAccounts(roleFilter = null) {
    try {
      let query = db.collection(ADMIN_ACCOUNTS_COLLECTION);

      if (roleFilter) {
        query = query.where('role', '==', roleFilter);
      }

      const snapshot = await query.get();
      const accounts = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        accounts.push(data);
      });

      return accounts;
    } catch (error) {
      throw new Error(`Error listing admin accounts: ${error.message}`);
    }
  }

  /**
   * Update admin account
   * @param {string} adminUid - UID of the admin to update
   * @param {Object} updates - Dictionary of fields to update
   * @param {string} updatedByUid - UID of the admin making the update
   * @returns {Promise<Object>} Updated admin account data
   */
  static async updateAdminAccount(adminUid, updates, updatedByUid) {
    try {
      // Prevent role changes except by superadmin
      if (updates.role) {
        if (!VALID_ROLES.includes(updates.role)) {
          throw new Error(`Invalid role: ${updates.role}`);
        }

        const currentRole = await this.getAdminAccount(adminUid);
        if (!currentRole) {
          throw new Error('Admin account not found');
        }

        // Update Firebase custom claims
        await auth.setCustomUserClaims(adminUid, { role: updates.role });
      }

      // Add update metadata
      updates.updatedAt = admin.firestore.Timestamp.now();
      updates.updatedBy = updatedByUid;

      await db.collection(ADMIN_ACCOUNTS_COLLECTION).doc(adminUid).update(updates);

      return this.getAdminAccount(adminUid);
    } catch (error) {
      throw new Error(`Error updating admin account: ${error.message}`);
    }
  }

  /**
   * Deactivate an admin account (soft delete)
   * @param {string} adminUid - UID of the admin to deactivate
   * @param {string} deactivatedByUid - UID of the admin performing the deactivation
   */
  static async deactivateAdminAccount(adminUid, deactivatedByUid) {
    try {
      await this.updateAdminAccount(adminUid, { isActive: false }, deactivatedByUid);

      // Disable Firebase auth user
      await auth.updateUser(adminUid, { disabled: true });
    } catch (error) {
      throw new Error(`Error deactivating admin account: ${error.message}`);
    }
  }

  /**
   * Reactivate a deactivated admin account
   * @param {string} adminUid - UID of the admin to reactivate
   * @param {string} reactivatedByUid - UID of the admin performing the reactivation
   */
  static async reactivateAdminAccount(adminUid, reactivatedByUid) {
    try {
      await this.updateAdminAccount(adminUid, { isActive: true }, reactivatedByUid);

      // Enable Firebase auth user
      await auth.updateUser(adminUid, { disabled: false });
    } catch (error) {
      throw new Error(`Error reactivating admin account: ${error.message}`);
    }
  }

  /**
   * Update the last login timestamp for an admin
   * @param {string} adminUid - Admin UID
   */
  static async updateLastLogin(adminUid) {
    try {
      await db.collection(ADMIN_ACCOUNTS_COLLECTION).doc(adminUid).update({
        lastLoginAt: admin.firestore.Timestamp.now(),
      });
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  /**
   * Generate a temporary password for new admin accounts
   * @returns {string} Temporary password
   */
  static _generateTempPassword() {
    const crypto = require('crypto');
    return crypto.randomBytes(12).toString('base64').slice(0, 12);
  }

  /**
   * Permanently delete an admin account
   * @param {string} adminUid - UID of the admin to delete
   */
  static async deleteAdminAccount(adminUid) {
    try {
      // Delete Firebase auth user
      await auth.deleteUser(adminUid);

      // Delete Firestore document
      await db.collection(ADMIN_ACCOUNTS_COLLECTION).doc(adminUid).delete();
    } catch (error) {
      throw new Error(`Error deleting admin account: ${error.message}`);
    }
  }
}

module.exports = AdminService;
