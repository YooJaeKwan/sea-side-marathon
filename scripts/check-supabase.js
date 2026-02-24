const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function listAll() {
    console.log('Using Key:', supabaseKey.substring(0, 20) + '...')
    const { data, error } = await supabase.storage.listBuckets()
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Buckets:', data.map(b => b.name))
    }
}

listAll()
