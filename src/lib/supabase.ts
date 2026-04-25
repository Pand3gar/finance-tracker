import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// Validate URL format before creating client
const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const validUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co'

export const supabase = createClient(validUrl, supabaseAnonKey || 'placeholder-key')

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 20
