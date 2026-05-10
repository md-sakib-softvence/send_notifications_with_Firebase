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
  const token = "eCBkpQ2_RuiGM0pIpHQQt7:APA91bHW-HnbiPc2wX600aQyWVllJGv8yo2b4PNexcZjyDLJoMwOQPQkMBp1aGJltYxbUS2HDb8QXx1EpwXLwTqm7Xv3oxjipjmKJfmWwNHxE2vEogaqSFY";
  
  // Set time to 1 minute ago so it triggers immediately
  const time = new Date(Date.now() - 60000).toISOString();
  
  // Adding ONLY token and time, as you requested!
  const docRef = await db.collection('reminder').add({
    token: token,
    time: time
  });
  
  console.log('✅ Successfully added document to reminder collection with ID:', docRef.id);
}

run().catch(console.error);
