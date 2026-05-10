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

async function checkColl(name) {
  const snap = await db.collection(name).get();
  console.log(`\n--- Reading "${name}" collection ---`);
  if (snap.empty) {
    console.log(`No documents in "${name}" collection.`);
  } else {
    snap.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
    });
  }
}

async function run() {
  await checkColl('notification');
  await checkColl('notfication');
  await checkColl('notifications');
  await checkColl('reminder');
  await checkColl('reminders');
}

run().catch(console.error);
