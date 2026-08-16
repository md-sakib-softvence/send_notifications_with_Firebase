const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  const token = "eIJvf3IRThCDnOikq02FfG:APA91bFPd84G85RhvJAm4XY8FoiCPlJ07Pl8lC5BgbQl9T4qk1a-w2Lm4HTT15rCVbWnLBjr1653Y-5g05r1OD7O1pjnGVHrLO1dMFGLzhPjj774sSfcsk8";
  const userId = "6G8OSMELsahExFgjDatnKKIMPhC3"; 
  const time = new Date(Date.now() - 60000).toISOString();
  
  // Upsert pattern: check if exist, if exist modify
  const checkRes = await client.query('SELECT * FROM reminders WHERE token = $1 LIMIT 1', [token]);
  let id;
  if (checkRes.rows.length > 0) {
    const existing = checkRes.rows[0];
    await client.query(
      `UPDATE reminders SET time = $1, "userId" = $2 WHERE id = $3`,
      [time, userId, existing.id]
    );
    id = existing.id;
    console.log('✅ Modified existing test reminder in database WITH userId!');
  } else {
    const insertRes = await client.query(
      `INSERT INTO reminders (token, time, "userId") VALUES ($1, $2, $3) RETURNING id`,
      [token, time, userId]
    );
    id = insertRes.rows[0].id;
    console.log('✅ Added new test reminder WITH userId in database!');
  }

  console.log('Reminder ID:', id);
  console.log('User ID:', userId);

  await client.end();
}

run().catch(console.error);
