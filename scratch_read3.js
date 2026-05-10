require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"$/, ''),
  })
});

const db = admin.firestore();

async function run() {
  console.log('\n--- Reading "users" collection ---');
  const snap = await db.collection('users').limit(3).get();
  if (snap.empty) {
    console.log('No documents in "users" collection.');
  } else {
    snap.forEach(doc => {
      console.log('ID:', doc.id, '=>', JSON.stringify(doc.data(), null, 2));
    });
  }
}

run().catch(console.error);
