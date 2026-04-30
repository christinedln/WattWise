import { db } from "../firebase_config.js";

const MAX_LOGS = 50;

export async function enforceLogLimit(userId, deviceId) {
  const logsRef = db
    .collection("user")
    .doc(userId)
    .collection("devices")
    .doc(deviceId)
    .collection("realtime_logs");

  const snapshot = await logsRef
    .orderBy("Timestamp", "desc")
    .get();

  if (snapshot.size <= MAX_LOGS) return;

  const batch = db.batch();

  snapshot.docs.slice(MAX_LOGS).forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}