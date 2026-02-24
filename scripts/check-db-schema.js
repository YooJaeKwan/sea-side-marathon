const { Client } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();

    console.log("--- Tables ---");
    const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `);
    console.table(tables.rows);

    for (const table of tables.rows) {
        console.log(`--- Columns for ${table.table_name} ---`);
        const columns = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = '${table.table_name}'
        `);
        console.table(columns.rows);
    }

    await client.end();
}

checkSchema().catch(console.error);
