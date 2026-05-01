import { db } from "../firebase_config.js";

const MAX_LOGS = 30;

export async function enforceLogLimit(userId, deviceId) {

  // input validation
  if (!userId || typeof userId !== "string") return;
  if (!deviceId || typeof deviceId !== "string") return;

  const logsRef = db
    .collection("user")
    .doc(userId)
    .collection("devices")
    .doc(deviceId)
    .collection("realtime_logs");

  const snapshot = await logsRef
    .orderBy("timestamp", "desc")
    .get();

  if (!snapshot || snapshot.size <= MAX_LOGS) return;

  const batch = db.batch();

  snapshot.docs.slice(MAX_LOGS).forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}