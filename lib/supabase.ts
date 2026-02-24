import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function uploadImage(file: File, path: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `${path}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
        .from("posts")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

    if (error) throw error

    const { data } = supabase.storage.from("posts").getPublicUrl(fileName)
    return data.publicUrl
}
