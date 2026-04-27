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
    const claims = decodedToken.customClaims || {};

    if (claims.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' });
    }

    req.adminUid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

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
    const roleFilter = req.query.role || null;
    const admins = await AdminService.listAdminAccounts(roleFilter);

    res.status(200).json({ admins, total: admins.length });
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
    const admin = await AdminService.getAdminAccount(req.params.adminId);

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    res.status(200).json(admin);
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
    const result = await AdminService.updateAdminAccount(
      req.params.adminId,
      req.body,
      req.adminUid
    );

    res.status(200).json(result);
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
    await AdminService.deactivateAdminAccount(req.params.adminId, req.adminUid);
    res.status(200).json({ message: 'Admin account deactivated' });
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
    await AdminService.reactivateAdminAccount(req.params.adminId, req.adminUid);
    res.status(200).json({ message: 'Admin account reactivated' });
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
    // Prevent deleting the last superadmin
    const admins = await AdminService.listAdminAccounts('superadmin');
    if (admins.length <= 1 && req.params.adminId === admins[0].uid) {
      return res.status(400).json({ error: 'Cannot delete the last superadmin' });
    }

    await AdminService.deleteAdminAccount(req.params.adminId);
    res.status(200).json({ message: 'Admin account deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
