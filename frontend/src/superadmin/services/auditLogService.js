import { addDoc, collection, getDocs, limit, orderBy, query, startAfter } from "firebase/firestore";
import { db, serverTimestamp } from "../../firebase";

export const AUDIT_LOG_PAGE_SIZE = 25;

export async function createAuditLog({
  actorUid,
  actorRole,
  action,
  targetId,
  beforeData = null,
  afterData = null,
  ipAddress = null,
}) {
  return addDoc(collection(db, "audit_logs"), {
    actorUid,
    actorRole,
    action,
    targetId,
    beforeData,
    afterData,
    ipAddress,
    timestamp: serverTimestamp(),
  });
}

export async function fetchAuditLogPage({ cursor = null, pageSize = AUDIT_LOG_PAGE_SIZE } = {}) {
  const constraints = [orderBy("timestamp", "desc")];

  if (cursor) {
    constraints.push(startAfter(cursor));
  }

  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(collection(db, "audit_logs"), ...constraints));

  return {
    rows: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
    lastCursor: snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === pageSize,
  };
}
