import { collection, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../../firebase";

export const SUPER_ADMIN_PAGE_SIZE = 25;

const usersPageCache = new Map();

function getPageKey({ cursor = null, organizationId = null, pageSize = SUPER_ADMIN_PAGE_SIZE } = {}) {
  return JSON.stringify({
    collection: "user",
    organizationId,
    pageSize,
    cursorPath: cursor?.ref?.path || cursor?.ref?.id || cursor?.id || null,
  });
}

export function invalidateUsersPageCache() {
  usersPageCache.clear();
}

export async function fetchUsersPage({ cursor = null, organizationId = null, pageSize = SUPER_ADMIN_PAGE_SIZE } = {}) {
  const cacheKey = getPageKey({ cursor, organizationId, pageSize });

  if (usersPageCache.has(cacheKey)) {
    return usersPageCache.get(cacheKey);
  }

  const constraints = [];

  if (organizationId) {
    constraints.push(where("organizationId", "==", organizationId));
  }

  constraints.push(orderBy("createdAt", "desc"));

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const request = getDocs(query(collection(db, "user"), ...constraints)).then((snapshot) => ({
    rows: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
    lastCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize,
  }));

  usersPageCache.set(cacheKey, request);

  try {
    const response = await request;
    usersPageCache.set(cacheKey, Promise.resolve(response));
    return response;
  } catch (error) {
    usersPageCache.delete(cacheKey);
    throw error;
  }
}
