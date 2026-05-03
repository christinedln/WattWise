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
    "view_devices",
    "view_alerts",
    "view_reports",
  ],
  [ROLES.SECURITY]: [
    "view_dashboard",
    "view_alerts",
    "view_security_logs",
    "manage_alerts",
    "configure_mfa",
  ],
  [ROLES.SUPPORT]: [
    "view_dashboard",
    "view_users",
    "manage_users",
    "view_devices",
  ],
  [ROLES.ANALYST]: [
    "view_dashboard",
    "view_reports",
    "view_alerts",
  ],
  [ROLES.OPERATOR]: [
    "view_dashboard",
    "view_devices",
    "view_alerts",
    "view_reports",
    "manage_devices",
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
 * - admin: Read-only operational access across users, devices, alerts, and reports
 * - security: Monitoring and incident response, with alert handling and security logs
 * - support: User support workflows plus light visibility into devices
 * - analyst: Reporting and alert visibility only
 * - operator: Device operations and monitoring, without user administration
 */
