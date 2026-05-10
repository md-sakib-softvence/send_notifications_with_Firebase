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
  console.log('🔍 Checking the latest 3 notifications created...');
  
  const snap = await db.collection('notifications')
    .orderBy('createdAt', 'desc')
    .limit(3)
    .get();

  if (snap.empty) {
    console.log('No notifications found in the database.');
  } else {
    snap.forEach(doc => {
      const data = doc.data();
      console.log('\n--- Document ID:', doc.id);
      console.log(JSON.stringify(data, null, 2));
    });
  }
}

run().catch(console.error);
