const admin = require('firebase-admin');
const { db } = require('../firebase_config');

const SUMMARY_DOC = db.collection('stats').doc('usersSummary');
const ACTIVE_WINDOW_DAYS = 30;

function toIsoTimestamp(value) {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function buildUsersSummary() {
  const activeSince = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const [totalUsersSnap, activeUsersSnap, adminsSnap] = await Promise.all([
    db.collection('user').get(),
    db.collection('user').where('lastActiveAt', '>=', activeSince).get(),
    db.collection('roleBasedAccounts').where('status', '==', 'active').get(),
  ]);

  const summary = {
    totalUsers: totalUsersSnap.size,
    activeUsers: activeUsersSnap.size,
    admins: adminsSnap.size,
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await SUMMARY_DOC.set(summary, { merge: true });

  return summary;
}

async function getUsersSummary({ refresh = false } = {}) {
  if (!refresh) {
    const cachedDoc = await SUMMARY_DOC.get();

    if (cachedDoc.exists) {
      const data = cachedDoc.data() || {};

      if (
        typeof data.totalUsers === 'number' &&
        typeof data.activeUsers === 'number' &&
        typeof data.admins === 'number'
      ) {
        return {
          totalUsers: data.totalUsers,
          activeUsers: data.activeUsers,
          admins: data.admins,
          updatedAt: toIsoTimestamp(data.updatedAt),
        };
      }
    }
  }

  const summary = await buildUsersSummary();

  return {
    totalUsers: summary.totalUsers,
    activeUsers: summary.activeUsers,
    admins: summary.admins,
    updatedAt: toIsoTimestamp(summary.updatedAt),
  };
}

module.exports = {
  getUsersSummary,
  buildUsersSummary,
};
