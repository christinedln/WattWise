/**
 * Script: Set role custom claims for Firebase Auth users
 * 
 * This script sets custom claims for existing Firebase Auth users
 * Run with: node scripts/setRoleClaims.js
 */

const admin = require('firebase-admin');
const fs = require('fs');

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

// Define accounts and their roles
const accountsToSetup = [
  {
    email: 'platformmanager@wattwise.com',
    role: 'superadmin',
  },
  {
    email: 'systemadmin@wattwise.com',
    role: 'admin',
  },
  {
    email: 'safeguard@wattwise.com',
    role: 'security',
  },
  {
    email: 'helpdesk@wattwise.com',
    role: 'support',
  },
  {
    email: 'insights@wattwise.com',
    role: 'analyst',
  },
];

async function setRoleClaims() {
  console.log('Setting role custom claims for Firebase Auth users...\n');

  let successCount = 0;
  let failureCount = 0;

  for (const account of accountsToSetup) {
    try {
      // Get user by email
      const user = await auth.getUserByEmail(account.email);

      // Get existing claims
      const existingClaims = user.customClaims || {};

      // Set the role claim
      const newClaims = {
        ...existingClaims,
        role: account.role,
      };

      // Update custom claims
      await auth.setCustomUserClaims(user.uid, newClaims);

      // Revoke refresh tokens so new claims take effect
      await auth.revokeRefreshTokens(user.uid);

      console.log(`✅ SUCCESS: ${account.email}`);
      console.log(`   Role: ${account.role}`);
      console.log(`   UID: ${user.uid}\n`);

      successCount++;
    } catch (error) {
      console.error(`❌ ERROR: ${account.email}`);
      console.error(`   ${error.message}\n`);
      failureCount++;
    }
  }

  // Summary
  console.log('='.repeat(60));
  console.log('ROLE CLAIMS SET - SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log('='.repeat(60) + '\n');

  if (failureCount === 0) {
    console.log('✅ All accounts updated! Users must sign out and sign back in for changes to take effect.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some accounts failed. Please check the errors above.\n');
    process.exit(1);
  }
}

// Run
setRoleClaims();
