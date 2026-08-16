const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkTable(client, name) {
  try {
    const res = await client.query(`SELECT * FROM ${name}`);
    console.log(`\n--- Reading "${name}" table ---`);
    if (res.rows.length === 0) {
      console.log(`No records in "${name}" table.`);
    } else {
      res.rows.forEach(row => {
        console.log(row.id, '=>', row);
      });
    }
  } catch (err) {
    console.log(`\n--- Error reading "${name}" table: ${err.message} ---`);
  }
}

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  await checkTable(client, 'notifications');
  await checkTable(client, 'reminders');
  await checkTable(client, 'users');

  await client.end();
}

run().catch(console.error);
