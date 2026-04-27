import admin from "firebase-admin";
import fs from "fs";

// Load service account key
const serviceAccount = JSON.parse(
  fs.readFileSync("./firebase_key.json", "utf8")
);

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Firestore instance
const db = admin.firestore();

export { db };