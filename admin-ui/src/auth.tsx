import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { supabase } from './supabaseClient'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

type AuthContextValue = {
  initialized: boolean
  authState: LoadState
  error: string | null
  accessToken: string | null
  userEmail: string | null

  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false)
  const [authState, setAuthState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      setAuthState('loading')
      setError(null)
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (cancelled) return
        if (sessionError) throw sessionError

        setAccessToken(data.session?.access_token ?? null)
        setUserEmail(data.session?.user?.email ?? null)
        setAuthState('success')
      } catch (e) {
        if (cancelled) return
        setAuthState('error')
        setError(e instanceof Error ? e.message : 'Failed to initialize auth')
      } finally {
        if (!cancelled) setInitialized(true)
      }
    }

    initAuth()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? null)
      setUserEmail(session?.user?.email ?? null)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signInWithPassword(email: string, password: string) {
    setAuthState('loading')
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setAuthState('error')
      setError(signInError.message)
      return
    }

    setAccessToken(data.session?.access_token ?? null)
    setUserEmail(data.user?.email ?? null)
    setAuthState('success')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setAccessToken(null)
    setUserEmail(null)
    setAuthState('idle')
    setError(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ initialized, authState, error, accessToken, userEmail, signInWithPassword, signOut }),
    [initialized, authState, error, accessToken, userEmail],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
