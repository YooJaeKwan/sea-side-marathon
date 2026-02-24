const { neon } = require('@neondatabase/serverless')
require('dotenv').config()

async function checkUrls() {
    const sql = neon(process.env.DATABASE_URL)

    try {
        const users = await sql`SELECT image FROM "User" WHERE image IS NOT NULL AND image != '' LIMIT 5`
        const posts = await sql`SELECT "imageUrl" FROM "Post" WHERE "imageUrl" IS NOT NULL AND "imageUrl" != '' LIMIT 5`

        console.log('User Image URLs:', users.map(u => u.image))
        console.log('Post Image URLs:', posts.map(p => p.imageUrl))
    } catch (err) {
        console.error('SQL Error:', err)
    }
}

checkUrls()
