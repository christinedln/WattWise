import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { db } from "../../firebase";

export const ROLE_BASED_ACCOUNTS_PAGE_SIZE = 25;

const roleBasedAccountsPageCache = new Map();

function getPageKey({ cursor = null, pageSize = ROLE_BASED_ACCOUNTS_PAGE_SIZE } = {}) {
  return JSON.stringify({
    collection: "roleBasedAccounts",
    pageSize,
    cursorPath: cursor?.ref?.path || cursor?.ref?.id || cursor?.id || null,
  });
}

export function invalidateRoleBasedAccountsCache() {
  roleBasedAccountsPageCache.clear();
}

/**
 * Fetch paginated list of role-based accounts
 */
export async function fetchRoleBasedAccountsPage({
  cursor = null,
  pageSize = ROLE_BASED_ACCOUNTS_PAGE_SIZE,
} = {}) {
  const cacheKey = getPageKey({ cursor, pageSize });

  if (roleBasedAccountsPageCache.has(cacheKey)) {
    return roleBasedAccountsPageCache.get(cacheKey);
  }

  const constraints = [orderBy("createdAt", "desc")];

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const request = getDocs(
    query(collection(db, "roleBasedAccounts"), ...constraints)
  ).then((snapshot) => ({
    rows: snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })),
    lastCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize,
  }));

  roleBasedAccountsPageCache.set(cacheKey, request);

  try {
    const response = await request;
    roleBasedAccountsPageCache.set(cacheKey, Promise.resolve(response));
    return response;
  } catch (error) {
    roleBasedAccountsPageCache.delete(cacheKey);
    throw error;
  }
}

/**
 * Fetch a role-based account by email
 */
export async function fetchRoleBasedAccountByEmail(email) {
  const snapshot = await getDocs(
    query(collection(db, "roleBasedAccounts"), where("email", "==", email))
  );

  if (snapshot.docs.length === 0) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

/**
 * Fetch all accounts with a specific role
 */
export async function fetchAccountsByRole(role) {
  const snapshot = await getDocs(
    query(collection(db, "roleBasedAccounts"), where("role", "==", role))
  );

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Create a new role-based account
 */
export async function createRoleBasedAccount({ email, role, uid = null }) {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, "roleBasedAccounts"), {
    email,
    role,
    uid: uid || null,
    createdAt: now,
    updatedAt: now,
  });

  invalidateRoleBasedAccountsCache();

  return { id: docRef.id, email, role, uid, createdAt: now, updatedAt: now };
}

/**
 * Update a role-based account
 */
export async function updateRoleBasedAccount(accountId, { role = null, email = null }) {
  const updates = { updatedAt: new Date().toISOString() };

  if (role !== null) {
    updates.role = role;
  }

  if (email !== null) {
    updates.email = email;
  }

  await updateDoc(doc(db, "roleBasedAccounts", accountId), updates);
  invalidateRoleBasedAccountsCache();
}

/**
 * Delete a role-based account
 */
export async function deleteRoleBasedAccount(accountId) {
  await deleteDoc(doc(db, "roleBasedAccounts", accountId));
  invalidateRoleBasedAccountsCache();
}

/**
 * Link a UID to a role-based account (after user is created in Firebase Auth)
 */
export async function linkUidToRoleBasedAccount(accountId, uid) {
  await updateDoc(doc(db, "roleBasedAccounts", accountId), {
    uid,
    updatedAt: new Date().toISOString(),
  });
  invalidateRoleBasedAccountsCache();
}
