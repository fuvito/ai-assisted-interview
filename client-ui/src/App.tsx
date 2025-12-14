import { useEffect, useState } from 'react'
import type { Subject, SubjectId } from '@app/shared'
import { Box, Button, Card, CardContent, Container, Stack, Typography } from '@mui/material'

import { getSubjects } from './api'
import { Dashboard } from './components/Dashboard'
import { Login, type LoginMode } from './components/Login'
import { MockInterview } from './components/MockInterview'
import { supabase } from './supabaseClient'
import type { LoadState } from './types'

export default function App() {
  const [authState, setAuthState] = useState<LoadState>('idle')
  const [authInitialized, setAuthInitialized] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loginMode, setLoginMode] = useState<LoginMode>('sign_in')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [subjectsState, setSubjectsState] = useState<LoadState>('idle')
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [view, setView] = useState<'dashboard' | 'mock-interview'>('dashboard')
  const [mockInterviewSubjectId, setMockInterviewSubjectId] = useState<SubjectId | null>(null)

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      setAuthState('loading')
      setAuthError(null)
      try {
        const { data, error } = await supabase.auth.getSession()
        if (cancelled) return
        if (error) throw error

        setAccessToken(data.session?.access_token ?? null)
        setUserEmail(data.session?.user?.email ?? null)
        setAuthState('success')
      } catch (e) {
        if (cancelled) return
        setAuthState('error')
        setAuthError(e instanceof Error ? e.message : 'Failed to initialize auth')
      } finally {
        if (!cancelled) setAuthInitialized(true)
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

  useEffect(() => {
    if (!accessToken) {
      setSubjects([])
      setSubjectsState('idle')
      setSubjectsError(null)
      return
    }

    let cancelled = false

    async function loadSubjects() {
      setSubjectsState('loading')
      setSubjectsError(null)

      try {
        const data = await getSubjects()
        if (cancelled) return
        setSubjects(data)
        setSubjectsState('success')
      } catch (err) {
        if (cancelled) return
        setSubjectsState('error')
        setSubjectsError(err instanceof Error ? err.message : 'Failed to load subjects')
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [accessToken])

  async function handleAuthSubmit() {
    setAuthState('loading')
    setAuthError(null)
    try {
      if (loginMode === 'sign_up') {
        const { data, error } = await supabase.auth.signUp({
          email: loginEmail,
          password: loginPassword,
        })
        if (error) throw error
        setAccessToken(data.session?.access_token ?? null)
        setUserEmail(data.user?.email ?? null)
        setAuthState('success')
        if (!data.session) {
          setAuthError('Check your email to confirm your account, then sign in.')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        })
        if (error) throw error
        setAccessToken(data.session?.access_token ?? null)
        setUserEmail(data.user?.email ?? null)
        setAuthState('success')
      }
    } catch (e) {
      setAuthState('error')
      setAuthError(e instanceof Error ? e.message : 'Authentication failed')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setAccessToken(null)
    setUserEmail(null)
    setView('dashboard')
    setMockInterviewSubjectId(null)
  }

  if (!authInitialized && authState === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Loading…
            </Typography>
          </CardContent>
        </Card>
      </Container>
    )
  }

  if (!accessToken) {
    return (
      <Login
        mode={loginMode}
        email={loginEmail}
        password={loginPassword}
        busy={authState === 'loading'}
        error={authError}
        onEmailChange={setLoginEmail}
        onPasswordChange={setLoginPassword}
        onModeChange={setLoginMode}
        onSubmit={handleAuthSubmit}
      />
    )
  }

  if (view === 'mock-interview') {
    if (mockInterviewSubjectId) {
      return (
        <Box>
          <Container maxWidth="md" sx={{ pt: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Signed in as {userEmail || 'unknown'}
                  </Typography>
                  <Box>
                    <Button variant="outlined" onClick={handleLogout}>
                      Sign out
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Container>

          <MockInterview
            subjects={subjects}
            subjectId={mockInterviewSubjectId}
            onExit={() => {
              setView('dashboard')
            }}
          />
        </Box>
      )
    }
  }

  return (
    <Box>
      <Container maxWidth="md" sx={{ pt: 3 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Signed in as {userEmail || 'unknown'}
              </Typography>
              <Box>
                <Button variant="outlined" onClick={handleLogout}>
                  Sign out
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      <Dashboard
        subjectsState={subjectsState}
        subjectsError={subjectsError}
        subjects={subjects}
        onStartMockInterview={(subjectId) => {
          setMockInterviewSubjectId(subjectId)
          setView('mock-interview')
        }}
      />
    </Box>
  )
}
