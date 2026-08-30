// Kisan Setu — Supabase Live Backend Connection & Health Check Manager

import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface BackendStatus {
  isConnected: boolean
  url: string
  mode: 'supabase' | 'local_storage'
  lastChecked: string
  message: string
}

const STORAGE_URL_KEY = 'kisan_setu_supabase_url'
const STORAGE_KEY_KEY = 'kisan_setu_supabase_anon_key'

export function getActiveSupabaseConfig(): { url: string; anonKey: string } {
  // 1. Check runtime user settings
  const customUrl = localStorage.getItem(STORAGE_URL_KEY) || ''
  const customKey = localStorage.getItem(STORAGE_KEY_KEY) || ''

  if (customUrl && customKey) {
    return { url: customUrl, anonKey: customKey }
  }

  // 2. Check Vite environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL || ''
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  return { url: envUrl, anonKey: envKey }
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (url && anonKey) {
    localStorage.setItem(STORAGE_URL_KEY, url.trim())
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim())
  } else {
    localStorage.removeItem(STORAGE_URL_KEY)
    localStorage.removeItem(STORAGE_KEY_KEY)
  }
}

let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getActiveSupabaseConfig()
  if (!url || !anonKey) {
    return null
  }

  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey)
    } catch {
      return null
    }
  }
  return cachedClient
}

/**
 * Checks connectivity to the configured Supabase backend.
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const { url, anonKey } = getActiveSupabaseConfig()

  if (!url || !anonKey) {
    return {
      isConnected: false,
      url: '',
      mode: 'local_storage',
      lastChecked: new Date().toISOString(),
      message: 'Running in Local Storage Cache Mode. (Supabase URL not configured)',
    }
  }

  try {
    const client = createClient(url, anonKey)
    // Perform a lightweight health check ping to public table or auth
    const { error } = await client.from('centres').select('id').limit(1)

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, but connection succeeded
      return {
        isConnected: true,
        url,
        mode: 'supabase',
        lastChecked: new Date().toISOString(),
        message: 'Connected to Supabase Project! (Run supabase/schema.sql to create tables)',
      }
    }

    return {
      isConnected: true,
      url,
      mode: 'supabase',
      lastChecked: new Date().toISOString(),
      message: 'Connected to Supabase Live Database & Auth Services.',
    }
  } catch (err: unknown) {
    return {
      isConnected: false,
      url,
      mode: 'local_storage',
      lastChecked: new Date().toISOString(),
      message: `Connection failed: ${err instanceof Error ? err.message : 'Network error'}`,
    }
  }
}
