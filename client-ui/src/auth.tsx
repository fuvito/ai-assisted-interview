import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { supabase } from './supabaseClient'
import type { LoadState } from './types'

type AuthContextValue = {
  authState: LoadState
  initialized: boolean
  accessToken: string | null
  userEmail: string | null
  error: string | null

  signInWithPassword: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<LoadState>('idle')
  const [initialized, setInitialized] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  async function signUp(email: string, password: string) {
    setAuthState('loading')
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setAuthState('error')
      setError(signUpError.message)
      return
    }

    setAccessToken(data.session?.access_token ?? null)
    setUserEmail(data.user?.email ?? null)
    setAuthState('success')

    if (!data.session) setError('Check your email to confirm your account, then sign in.')
  }

  async function signOut() {
    await supabase.auth.signOut()
    setAccessToken(null)
    setUserEmail(null)
    setAuthState('idle')
    setError(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({ authState, initialized, accessToken, userEmail, error, signInWithPassword, signUp, signOut }),
    [authState, initialized, accessToken, userEmail, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within an AuthProvider')
  return value
}
