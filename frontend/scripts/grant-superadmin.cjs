/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");

function resolveServiceAccountPath() {
  const rawPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!rawPath) {
    throw new Error(
      "Missing FIREBASE_SERVICE_ACCOUNT_KEY. Set it to your Firebase service-account JSON path.",
    );
  }

  const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Service-account file not found: ${absolutePath}`);
  }

  return absolutePath;
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    throw new Error("Usage: node ./scripts/grant-superadmin.cjs <email>");
  }

  const serviceAccountPath = resolveServiceAccountPath();
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const user = await admin.auth().getUserByEmail(email);
  const previousClaims = user.customClaims || {};
  const nextClaims = {
    ...previousClaims,
    role: "superadmin",
  };

  await admin.auth().setCustomUserClaims(user.uid, nextClaims);
  await admin.auth().revokeRefreshTokens(user.uid);

  console.log(`SUCCESS: ${email} is now superadmin.`);
  console.log(`UID: ${user.uid}`);
  console.log("User must sign out and sign back in for fresh claims.");
}

main().catch((error) => {
  console.error("ERROR:", error.message);
  process.exit(1);
});