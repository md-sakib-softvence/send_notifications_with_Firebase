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
  const token = "eIJvf3IRThCDnOikq02FfG:APA91bFPd84G85RhvJAm4XY8FoiCPlJ07Pl8lC5BgbQl9T4qk1a-w2Lm4HTT15rCVbWnLBjr1653Y-5g05r1OD7O1pjnGVHrLO1dMFGLzhPjj774sSfcsk8";
  const userId = "6G8OSMELsahExFgjDatnKKIMPhC3"; 
  
  // Start time: 1 minute ago (triggers instantly)
  const time = new Date(Date.now() - 60000).toISOString();
  
  // End date: Exactly 3 minutes from right now!
  const endDate = new Date(Date.now() + (3 * 60000)).toISOString();
  
  const docRef = await db.collection('reminder').add({
    token: token,
    time: time,
    userId: userId,
    endDate: endDate
  });
  
  console.log('✅ HYPER-SPEED TEST STARTED!');
  console.log('Document ID:', docRef.id);
  console.log('It will auto-delete in exactly 3 minutes.');
}

run().catch(console.error);
