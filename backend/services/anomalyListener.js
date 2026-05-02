const { sendAlertEmail } = require("../utils/emailService");

let db;

async function loadDb() {
  const firebaseModule = await import("../firebase_config.js");
  db = firebaseModule.db;
}

// normalize severity coming from Firestore anomaly
function normalizeSeverity(sev) {
  if (!sev) return "";

  const s = sev.toLowerCase();

  if (s === "critical") return "critical";
  if (s === "warning") return "warning";
  if (s === "suspicious") return "suspicious";

  return s;
}

function startAnomalyListener() {
  console.log("Starting anomaly listener...");

  loadDb().then(() => {
    if (!db) {
      console.error("Firestore DB not loaded");
      return;
    }

    db.collectionGroup("anomalies").onSnapshot(async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type !== "added") continue;

        const docRef = change.doc;
        const data = docRef.data();

        // ─── HARD GUARD (IMPORTANT) ─────────────────────
        if (!data || Object.keys(data).length === 0) {
          console.log("Skipped empty anomaly doc");
          continue;
        }

        if (!data.signal || !data.timestamp) {
          console.log("Skipped invalid anomaly (missing fields)");
          continue;
        }

        if (data.emailSent === true) continue;
        if (data.resolved === true) continue;

        console.log("🚨 New anomaly detected:", data);

        try {
          const pathParts = docRef.ref.path.split("/");
          const userId = pathParts[1];
          const deviceId = pathParts[3];

          let deviceName = deviceId; //fallback

          try {
            const deviceDoc = await db
              .collection("user")
              .doc(userId)
              .collection("devices")
              .doc(deviceId)
              .get();

            if (deviceDoc.exists) {
              const deviceData = deviceDoc.data();
              deviceName = deviceData?.name || deviceId;
            }
          } catch (err) {
            console.log("Error fetching device name:", err);
          }

          const settingsDoc = await db
            .collection("user")
            .doc(userId)
            .collection("alert_settings")
            .doc("main")
            .get();

          const settings = settingsDoc.data();

          if (!settings?.email) {
            console.log("No email settings for user:", userId);
            continue;
          }

          const severity = normalizeSeverity(data.severity);

          // ─── SEVERITY FILTER ─────────────────────────
          if (
            (severity === "critical" && !settings.critical) ||
            (severity === "warning" && !settings.warning) ||
            (severity === "suspicious" && !settings.suspicious)
          ) {
            continue;
          }

          if (settings.frequency !== "instant") {
            console.log("Skipped (not instant)");
            continue;
          }

          // ─── CONTEXT LOG SAFE ACCESS ─────────────────
          const logs = Array.isArray(data.context_logs)
            ? data.context_logs
            : [];

          const latest = logs.length
            ? logs[logs.length - 1]
            : null;

          const voltage = latest?.voltage ?? "N/A";
          const current = latest?.current ?? "N/A";
          const power = latest?.power ?? "N/A";

          // ─── FINAL SAFETY CHECK BEFORE EMAIL ─────────
          if (!data.signal || !data.timestamp) {
            console.log("Blocked email due to missing core fields");
            continue;
          }

          await sendAlertEmail(
            settings.email,
            `⚠️ Device Alert - ${data.signal}`,
            `
              <h3>⚠️ Anomaly Detected</h3>
              <b>Device ID:</b> ${deviceId}<br/>
              <b>Device Name:</b> ${deviceName}<br/>
              <b>Severity:</b> ${severity}<br/>
              <b>Signal:</b> ${data.signal}<br/><br/>

              <b>Voltage:</b> ${voltage} V<br/>
              <b>Current:</b> ${current} A<br/>
              <b>Power:</b> ${power} W<br/><br/>

              <b>Time:</b> ${data.timestamp}
            `
          );

          console.log("Email sent to:", settings.email);

          await docRef.ref.update({
            emailSent: true,
          });

        } catch (err) {
          console.error("error processing anomaly:", err);
        }
      }
    });
  });
}

module.exports = { startAnomalyListener };