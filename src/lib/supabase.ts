import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseKey)

export type Tables = {
  todos: {
    Row: {
      id: string
      created_at: string
      text: string
    }
    Insert: {
      text: string
    }
    Update: {
      text?: string
    }
  }
} 