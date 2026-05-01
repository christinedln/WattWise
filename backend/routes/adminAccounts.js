/**
 * Admin Accounts Management Routes
 * Handles CRUD operations for admin accounts
 */

const express = require('express');
const admin = require('firebase-admin');
const AdminService = require('../services/adminService');

const router = express.Router();
const auth = admin.auth();

/**
 * Middleware to require superadmin role
 */
const requireSuperAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    const role = decodedToken.role || decodedToken.customClaims?.role;

    if (role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' });
    }

    req.adminUid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * POST /api/admin-accounts/create
 * Create a new admin account
 * 
 * Request body:
 * {
 *   "email": "admin@wattwise.com",
 *   "displayName": "John Doe",
 *   "role": "admin|security|support|analyst"
 * }
 */
router.post('/create', requireSuperAdmin, async (req, res) => {
  try {
    const { email, displayName, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Create Firebase Auth user
    const userRecord = await auth.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // temporary password
      displayName: displayName || email,
    });

    // Set custom claims for role
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Create Firestore document
    const db = admin.firestore();
    await db.collection('roleBasedAccounts').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: displayName || email,
      role,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: true,
    });

    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      role,
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Create account error:', error);
    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * PUT /api/admin-accounts/:userId/update-role
 * Update the role of an account
 */
router.put('/:userId/update-role', requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.userId;

    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Update custom claims
    await auth.setCustomUserClaims(userId, { role });

    // Update Firestore document
    const db = admin.firestore();
    await db.collection('roleBasedAccounts').doc(userId).update({
      role,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: 'Role updated successfully',
      userId,
      role,
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin-accounts/:userId/disable
 * Disable an account
 */
router.post('/:userId/disable', requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Disable Firebase Auth user
    await auth.updateUser(userId, { disabled: true });

    // Update Firestore document
    const db = admin.firestore();
    await db.collection('roleBasedAccounts').doc(userId).update({
      status: 'disabled',
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: 'Account disabled successfully',
      userId,
    });
  } catch (error) {
    console.error('Disable account error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin-accounts/:userId/update-display-name
 * Update display name
 */
router.put('/:userId/update-display-name', requireSuperAdmin, async (req, res) => {
  try {
    const { displayName } = req.body;
    const userId = req.params.userId;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Update Firebase Auth user
    await auth.updateUser(userId, { displayName });

    // Update Firestore document
    const db = admin.firestore();
    await db.collection('roleBasedAccounts').doc(userId).update({
      displayName,
      updatedAt: new Date(),
    });

    res.status(200).json({
      message: 'Display name updated successfully',
      userId,
      displayName,
    });
  } catch (error) {
    console.error('Update display name error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin-accounts/:userId/reset-password
 * Set a new password for the account
 */
router.post('/:userId/reset-password', requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    const { password } = req.body;

    if (!password || password.trim().length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Update user's password
    await auth.updateUser(userId, { password: password.trim() });

    res.status(200).json({
      message: 'Password updated successfully',
      userId,
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin-accounts/:userId
 * Delete an admin account (superadmin only)
 */
router.delete('/:userId', requireSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Prevent deleting the superadmin that's doing the deletion
    const userRecord = await auth.getUser(userId);
    if (userRecord.customClaims?.role === 'superadmin' && userId === req.adminUid) {
      return res.status(400).json({ error: 'Cannot delete your own superadmin account' });
    }

    // Delete Firebase Auth user
    await auth.deleteUser(userId);

    // Delete Firestore document
    const db = admin.firestore();
    await db.collection('roleBasedAccounts').doc(userId).delete();

    res.status(200).json({
      message: 'Account deleted successfully',
      userId,
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/accounts
 * Create a new admin account
 * 
 * Request body:
 * {
 *   "email": "admin@wattwise.com",
 *   "displayName": "John Doe",
 *   "role": "admin|security|support|analyst"
 * }
 */
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    const { email, displayName, role } = req.body;

    if (!email || !displayName || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await AdminService.createAdminAccount(
      email,
      displayName,
      role,
      req.adminUid
    );

    res.status(201).json(result);
  } catch (error) {
    if (error.message.includes('Invalid role')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * GET /api/admin/accounts
 * List all admin accounts
 * Query params:
 * - role: Filter by role (optional)
 */
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    // Temporarily disabled - use roleBasedAccounts collection directly
    res.status(200).json({ admins: [], total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/admin/accounts/:adminId
 * Get admin account by UID
 */
router.get('/:adminId', requireSuperAdmin, async (req, res) => {
  try {
    // Temporarily disabled
    res.status(404).json({ error: 'Admin account not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/admin/accounts/:adminId
 * Update admin account
 * 
 * Request body:
 * {
 *   "displayName": "Updated Name",
 *   "role": "new_role",
 *   "isActive": true
 * }
 */
router.put('/:adminId', requireSuperAdmin, async (req, res) => {
  try {
    // Temporarily disabled
    res.status(500).json({ error: 'Endpoint temporarily disabled' });
  } catch (error) {
    if (error.message.includes('Invalid role')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * POST /api/admin/accounts/:adminId/deactivate
 * Deactivate an admin account
 */
router.post('/:adminId/deactivate', requireSuperAdmin, async (req, res) => {
  try {
    // Temporarily disabled
    res.status(500).json({ error: 'Endpoint temporarily disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/admin/accounts/:adminId/reactivate
 * Reactivate an admin account
 */
router.post('/:adminId/reactivate', requireSuperAdmin, async (req, res) => {
  try {
    // Temporarily disabled
    res.status(500).json({ error: 'Endpoint temporarily disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/admin/accounts/:adminId
 * Permanently delete an admin account
 */
router.delete('/:adminId', requireSuperAdmin, async (req, res) => {
  try {
    // Temporarily disabled
    res.status(500).json({ error: 'Endpoint temporarily disabled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
