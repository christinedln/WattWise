const express = require('express');
const router = express.Router();

const authRequired = require('../utils/auth');
const { getUsersSummary } = require('../services/usersSummaryCache');
const { hasPermission } = require('../utils/permissions');

router.get('/users-summary', authRequired, async (req, res) => {
  try {
    if (!hasPermission(req.user?.role, 'view_dashboard') && !hasPermission(req.user?.role, 'view_reports')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const summary = await getUsersSummary();

    res.json({
      summary,
    });
  } catch (error) {
    console.error('Superadmin summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
