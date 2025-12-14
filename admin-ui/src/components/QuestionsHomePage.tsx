import { useCallback, useEffect, useState } from 'react'
import type { Subject } from '@app/shared'
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { supabase } from '../supabaseClient'
import { useAuth } from '../auth'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    if (res.status === 401) await supabase.auth.signOut()
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export function QuestionsHomePage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const fetchAdminJson = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      if (!accessToken) throw new Error('Not authenticated')

      const headers = new Headers(init?.headers)
      headers.set('Authorization', `Bearer ${accessToken}`)
      return fetchJson<T>(apiUrl(path), { ...init, headers })
    },
    [accessToken],
  )

  const loadSubjects = useCallback(async () => {
    if (!accessToken) return

    setState('loading')
    setError(null)
    try {
      const data = await fetchAdminJson<{ subjects: Subject[] }>('/api/admin/subjects')
      setSubjects(data.subjects)
      setState('success')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to load subjects')
    }
  }, [accessToken, fetchAdminJson])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={2.5}>
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h4" fontWeight={900}>
              Questions
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Select a subject to manage its questions.
            </Typography>
          </Box>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Subjects
              </Typography>
              {state === 'loading' && <CircularProgress size={18} />}
            </Box>
            {error && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}
          </CardContent>
        </Card>

        {state === 'success' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {subjects.map((s) => (
              <Card key={s.id} variant="outlined">
                <CardActionArea onClick={() => navigate(`/questions/${encodeURIComponent(s.id)}`)}>
                  <CardContent>
                    <Stack spacing={0.5}>
                      <Typography variant="h6" fontWeight={800}>
                        {s.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage questions
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}

        {state === 'success' && subjects.length === 0 && (
          <Card variant="outlined" sx={{ boxShadow: 'none' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                No subjects found. Create subjects in the Subjects screen first.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
