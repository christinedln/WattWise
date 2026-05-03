/**
 * Migration Script: Sync Firebase Auth users to roleBasedAccounts collection
 * 
 * This script:
 * 1. Lists all Firebase Auth users
 * 2. Filters those with custom 'role' claims
 * 3. Creates/updates entries in the roleBasedAccounts Firestore collection
 * 4. Links their UIDs and roles
 * 
 * Run with: npm run sync:accounts
 */

const admin = require('firebase-admin');
const fs = require('fs');
const { refreshUsersSummary } = require('../services/usersSummaryRefresh');

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  fs.readFileSync('./firebase_key.json', 'utf8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function syncAccountsToFirestore() {
  console.log('Starting sync of Firebase Auth users to roleBasedAccounts collection...\n');

  try {
    let totalUsers = 0;
    let syncedUsers = 0;
    let skippedUsers = 0;
    let updatedUsers = 0;

    // List all users using pagination
    const listUsers = async (nextPageToken) => {
      const result = await auth.listUsers(1000, nextPageToken);

      for (const userRecord of result.users) {
        totalUsers++;
        const customClaims = userRecord.customClaims || {};
        const role = customClaims.role;

        // Skip users without role claims
        if (!role) {
          console.log(
            `⏭️  SKIPPED: ${userRecord.email} (no role claim)`
          );
          skippedUsers++;
          continue;
        }

        try {
          // Check if account exists in Firestore
          const docRef = db.collection('roleBasedAccounts').doc(userRecord.uid);
          const docSnapshot = await docRef.get();

          if (docSnapshot.exists) {
            // Update existing document
            await docRef.update({
              role: role,
              email: userRecord.email,
              displayName: userRecord.displayName || '',
              updatedAt: new Date().toISOString(),
              synced: true,
            });

            console.log(
              `✏️  UPDATED: ${userRecord.email} (role: ${role})`
            );
            updatedUsers++;
          } else {
            // Create new document
            await docRef.set({
              uid: userRecord.uid,
              email: userRecord.email,
              role: role,
              displayName: userRecord.displayName || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              status: 'active',
              synced: true,
            });

            console.log(
              `✅ CREATED: ${userRecord.email} (role: ${role})`
            );
            syncedUsers++;
          }
        } catch (error) {
          console.error(
            `❌ ERROR syncing ${userRecord.email}: ${error.message}`
          );
        }
      }

      // Continue with next page if available
      if (result.pageToken) {
        await listUsers(result.pageToken);
      }
    };

    // Start pagination
    await listUsers();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('SYNC COMPLETE - SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users processed: ${totalUsers}`);
    console.log(`✅ New accounts created: ${syncedUsers}`);
    console.log(`✏️  Existing accounts updated: ${updatedUsers}`);
    console.log(`⏭️  Skipped (no role): ${skippedUsers}`);
    console.log('='.repeat(60) + '\n');

    await refreshUsersSummary();

    process.exit(0);
  } catch (error) {
    console.error('❌ SYNC FAILED:', error.message);
    process.exit(1);
  }
}

// Run the sync
syncAccountsToFirestore();
