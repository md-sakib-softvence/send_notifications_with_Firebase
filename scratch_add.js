const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  const token = "eCBkpQ2_RuiGM0pIpHQQt7:APA91bHW-HnbiPc2wX600aQyWVllJGv8yo2b4PNexcZjyDLJoMwOQPQkMBp1aGJltYxbUS2HDb8QXx1EpwXLwTqm7Xv3oxjipjmKJfmWwNHxE2vEogaqSFY";
  const time = new Date(Date.now() - 60000).toISOString();
  
  // Upsert pattern: check if exist, if exist modify it
  const checkRes = await client.query('SELECT * FROM reminders WHERE token = $1 LIMIT 1', [token]);
  let id;
  if (checkRes.rows.length > 0) {
    const existing = checkRes.rows[0];
    await client.query('UPDATE reminders SET time = $1 WHERE id = $2', [time, existing.id]);
    id = existing.id;
    console.log('✅ Successfully modified existing reminder in database with ID:', id);
  } else {
    const insertRes = await client.query(
      'INSERT INTO reminders (token, time) VALUES ($1, $2) RETURNING id',
      [token, time]
    );
    id = insertRes.rows[0].id;
    console.log('✅ Successfully added new reminder to database with ID:', id);
  }

  await client.end();
}

run().catch(console.error);
