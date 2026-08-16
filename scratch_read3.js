const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  console.log('\n--- Reading "users" table ---');
  const client = new Client({ connectionString });
  await client.connect();

  const res = await client.query('SELECT * FROM users LIMIT 3');
  if (res.rows.length === 0) {
    console.log('No records in "users" table.');
  } else {
    res.rows.forEach(row => {
      console.log('ID:', row.id, '=>', JSON.stringify(row, null, 2));
    });
  }

  await client.end();
}

run().catch(console.error);
