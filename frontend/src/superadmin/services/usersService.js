import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../../firebase";

export const SUPER_ADMIN_PAGE_SIZE = 25;

export async function fetchUsersPage({ cursor = null, organizationId = null, pageSize = SUPER_ADMIN_PAGE_SIZE } = {}) {
  const constraints = [];

  if (organizationId) {
    constraints.push(where("organizationId", "==", organizationId));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, "users"), ...constraints));

  return {
    rows: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
    lastCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize,
  };
}
