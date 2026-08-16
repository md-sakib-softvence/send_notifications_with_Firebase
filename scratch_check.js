const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  console.log('🔍 Checking the latest 3 notifications created...');
  
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query('SELECT * FROM notifications ORDER BY "createdAt" DESC LIMIT 3');

  if (res.rows.length === 0) {
    console.log('No notifications found in the database.');
  } else {
    res.rows.forEach(row => {
      console.log('\n--- Notification ID:', row.id);
      console.log(JSON.stringify(row, null, 2));
    });
  }

  await client.end();
}

run().catch(console.error);
