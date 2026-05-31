import { supabase } from './supabase'

/**
 * Register a new user with email, password, and full name.
 * The full name is stored in user_metadata which is then synced to public.profiles via trigger.
 */
export async function registerUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

/**
 * Sign in an existing user with email and password.
 */
export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

/**
 * Sign out the current user.
 */
export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
