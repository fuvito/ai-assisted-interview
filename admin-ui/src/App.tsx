import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Question, SubjectId } from '@app/shared'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { supabase } from './supabaseClient'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export default function App() {
  const [authState, setAuthState] = useState<LoadState>('idle')
  const [authError, setAuthError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginState, setLoginState] = useState<LoadState>('idle')

  const [subjectId, setSubjectId] = useState<SubjectId>('java')
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  const [selectedId, setSelectedId] = useState<string>('')

  const selectedQuestion = useMemo(
    () => questions.find((q) => q.id === selectedId) ?? null,
    [questions, selectedId],
  )

  const [questionText, setQuestionText] = useState('')
  const [expertAnswer, setExpertAnswer] = useState('')

  function resetForm() {
    setSelectedId('')
    setQuestionText('')
    setExpertAnswer('')
  }

  useEffect(() => {
    let cancelled = false

    async function initAuth() {
      setAuthState('loading')
      setAuthError(null)
      try {
        const { data, error: sessionError } = await supabase.auth.getSession()
        if (cancelled) return
        if (sessionError) throw sessionError

        const token = data.session?.access_token ?? null
        const email = data.session?.user?.email ?? null
        setAccessToken(token)
        setUserEmail(email)
        setAuthState('success')
      } catch (e) {
        if (cancelled) return
        setAuthState('error')
        setAuthError(e instanceof Error ? e.message : 'Failed to initialize auth')
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

  const fetchAdminJson = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      if (!accessToken) throw new Error('Not authenticated')

      const headers = new Headers(init?.headers)
      if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json')
      headers.set('Authorization', `Bearer ${accessToken}`)

      return fetchJson<T>(apiUrl(path), { ...init, headers })
    },
    [accessToken],
  )

  const loadQuestions = useCallback(async (currentSubject: SubjectId) => {
    if (!accessToken) return
    setState('loading')
    setError(null)
    try {
      const data = await fetchAdminJson<{ questions: Question[] }>(
        `/api/admin/questions?subject=${encodeURIComponent(currentSubject)}`,
      )
      setQuestions(data.questions)
      setState('success')
      resetForm()
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    }
  }, [accessToken, fetchAdminJson])

  useEffect(() => {
    if (!accessToken) return
    loadQuestions(subjectId)
  }, [accessToken, loadQuestions, subjectId])

  useEffect(() => {
    if (!selectedQuestion) return
    setQuestionText(selectedQuestion.questionText)
    setExpertAnswer(selectedQuestion.expertAnswer)
  }, [selectedQuestion])

  async function handleCreate() {
    setState('loading')
    setError(null)
    try {
      await fetchAdminJson<{ question: Question }>('/api/admin/questions', {
        method: 'POST',
        body: JSON.stringify({ subjectId, questionText, expertAnswer }),
      })
      await loadQuestions(subjectId)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to create question')
    }
  }

  async function handleUpdate() {
    if (!selectedId) {
      setError('Select a question to update')
      return
    }
    setState('loading')
    setError(null)
    try {
      await fetchAdminJson<{ question: Question }>(`/api/admin/questions/${encodeURIComponent(selectedId)}`, {
        method: 'PUT',
        body: JSON.stringify({ questionText, expertAnswer }),
      })
      await loadQuestions(subjectId)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to update question')
    }
  }

  async function handleDelete() {
    if (!selectedId) {
      setError('Select a question to delete')
      return
    }
    setState('loading')
    setError(null)
    try {
      await fetchAdminJson<{ ok: boolean }>(`/api/admin/questions/${encodeURIComponent(selectedId)}`, {
        method: 'DELETE',
      })
      await loadQuestions(subjectId)
    } catch (err) {
      setState('error')
      setError(err instanceof Error ? err.message : 'Failed to delete question')
    }
  }

  async function handleLogin() {
    setLoginState('loading')
    setAuthError(null)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (signInError) throw signInError

      setAccessToken(data.session?.access_token ?? null)
      setUserEmail(data.user?.email ?? null)
      setAuthState('success')
      setLoginState('success')
    } catch (e) {
      setLoginState('error')
      setAuthError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  async function handleLogout() {
    setState('idle')
    setError(null)
    resetForm()
    setQuestions([])
    await supabase.auth.signOut()
    setAccessToken(null)
    setUserEmail(null)
  }

  if (authState === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={800}>
                Admin UI
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading…</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    )
  }

  if (!accessToken) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Admin UI Login
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in with a Supabase Auth admin account.
                </Typography>
              </Box>

              {authError && <Alert severity="error">{authError}</Alert>}

              <TextField
                label="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                autoComplete="email"
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
              />

              <Button variant="contained" onClick={handleLogin} disabled={loginState === 'loading'}>
                Sign in
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Admin UI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MVP: CRUD questions and expert answers for Java and TypeScript.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
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

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  label="Subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value as SubjectId)}
                  disabled={state === 'loading'}
                >
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="typescript">TypeScript</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" onClick={() => loadQuestions(subjectId)} disabled={state === 'loading'}>
                  Refresh
                </Button>
                {state === 'loading' && <CircularProgress size={20} />}
              </Box>

              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Questions
              </Typography>

              <FormControl fullWidth>
                <InputLabel id="question-select-label">Select question</InputLabel>
                <Select
                  labelId="question-select-label"
                  label="Select question"
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  disabled={state === 'loading'}
                >
                  <MenuItem value="">
                    <em>(New question)</em>
                  </MenuItem>
                  {questions.map((q) => (
                    <MenuItem key={q.id} value={q.id}>
                      {q.questionText.length > 60 ? `${q.questionText.slice(0, 60)}…` : q.questionText}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Question"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                disabled={state === 'loading'}
                fullWidth
                multiline
                minRows={3}
              />

              <TextField
                label="Expert answer"
                value={expertAnswer}
                onChange={(e) => setExpertAnswer(e.target.value)}
                disabled={state === 'loading'}
                fullWidth
                multiline
                minRows={6}
              />

              <Divider />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={handleCreate}
                  disabled={state === 'loading' || !!selectedId}
                >
                  Create
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleUpdate}
                  disabled={state === 'loading' || !selectedId}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  disabled={state === 'loading' || !selectedId}
                >
                  Delete
                </Button>
                <Button variant="text" onClick={resetForm} disabled={state === 'loading'}>
                  Clear
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
