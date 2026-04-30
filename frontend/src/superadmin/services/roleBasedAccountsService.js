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

/**
 * Fetch paginated list of role-based accounts
 */
export async function fetchRoleBasedAccountsPage({
  cursor = null,
  pageSize = ROLE_BASED_ACCOUNTS_PAGE_SIZE,
} = {}) {
  const constraints = [orderBy("createdAt", "desc")];

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const snapshot = await getDocs(
    query(collection(db, "roleBasedAccounts"), ...constraints)
  );

  return {
    rows: snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    })),
    lastCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize,
  };
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
}

/**
 * Delete a role-based account
 */
export async function deleteRoleBasedAccount(accountId) {
  await deleteDoc(doc(db, "roleBasedAccounts", accountId));
}

/**
 * Link a UID to a role-based account (after user is created in Firebase Auth)
 */
export async function linkUidToRoleBasedAccount(accountId, uid) {
  await updateDoc(doc(db, "roleBasedAccounts", accountId), {
    uid,
    updatedAt: new Date().toISOString(),
  });
}
