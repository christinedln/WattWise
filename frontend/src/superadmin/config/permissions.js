export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  SECURITY: "security",
  SUPPORT: "support",
  ANALYST: "analyst",
  OPERATOR: "operator",
  USER: "user",
};

const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: [
    "view_dashboard",
    "view_users",
    "manage_users",
    "view_devices",
    "manage_devices",
    "view_alerts",
    "manage_alerts",
    "view_reports",
    "view_security_logs",
    "manage_settings",
    "configure_mfa",
    "export_audit_logs",
  ],
  [ROLES.ADMIN]: [
    "view_dashboard",
    "view_users",
    "manage_users",
    "view_devices",
    "manage_devices",
    "view_alerts",
    "manage_alerts",
    "view_reports",
    "manage_settings_limited", // Limited access to settings
  ],
  [ROLES.SECURITY]: [
    "view_dashboard",
    "view_users", // View only
    "view_devices", // View only
    "view_reports", // View only
    "view_alerts",
    "view_security_logs",
    "configure_mfa",
  ],
  [ROLES.SUPPORT]: [
    "view_dashboard",
    "view_users",
    "manage_users",
  ],
  [ROLES.ANALYST]: [
    "view_dashboard",
    "view_reports",
    "view_alerts", // View only
  ],
  [ROLES.OPERATOR]: [
    "view_dashboard",
    "view_devices",
    "view_alerts",
    "view_reports",
  ],
  [ROLES.USER]: ["view_dashboard"],
};

export function hasPermission(role, action) {
  if (!action) {
    return true;
  }

  const normalizedRole = role || ROLES.USER;
  if (normalizedRole === ROLES.SUPERADMIN) {
    return true;
  }

  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  return permissions.includes(action);
}

export function canAccessRoute(role, action) {
  return hasPermission(role, action);
}

export function normalizeRole(role) {
  return Object.values(ROLES).includes(role) ? role : ROLES.USER;
}

/**
 * Admin Account Structure for Firestore
 * Collection: /admin_accounts
 * Document: {adminId}
 * 
 * Structure:
 * {
 *   uid: "firebase_auth_uid",
 *   email: "admin@wattwise.com",
 *   displayName: "John Doe",
 *   role: "superadmin|admin|security|support|analyst",
 *   isActive: true,
 *   createdAt: timestamp,
 *   createdBy: "superadmin_uid",
 *   updatedAt: timestamp,
 *   updatedBy: "superadmin_uid",
 *   lastLoginAt: timestamp,
 * }
 * 
 * Role Descriptions:
 * - superadmin: Full access to all features and settings
 * - admin: Full access except security logs and limited settings management
 * - security: Dashboard, alerts, security logs, MFA, view-only for users/devices/reports
 * - support: Dashboard and users management
 * - analyst: Dashboard and reports (view-only for alerts)
 */
