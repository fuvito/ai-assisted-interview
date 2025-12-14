import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Subject, SubjectId } from '@app/shared'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

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

export function SubjectsPage() {
  const { accessToken } = useAuth()

  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [selectedId, setSelectedId] = useState<SubjectId>('')
  const selected = useMemo(() => subjects.find((s) => s.id === selectedId) ?? null, [subjects, selectedId])

  const [idText, setIdText] = useState('')
  const [nameText, setNameText] = useState('')

  function resetForm() {
    setSelectedId('')
    setIdText('')
    setNameText('')
  }

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
    if (!accessToken) return
    loadSubjects()
  }, [accessToken, loadSubjects])

  useEffect(() => {
    if (!selected) return
    setIdText(selected.id)
    setNameText(selected.name)
  }, [selected])

  async function handleCreate() {
    setState('loading')
    setError(null)
    try {
      await fetchAdminJson<{ subject: Subject }>('/api/admin/subjects', {
        method: 'POST',
        body: JSON.stringify({ id: idText, name: nameText }),
      })
      await loadSubjects()
      resetForm()
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to create subject')
    }
  }

  async function handleUpdate() {
    if (!selectedId) {
      setError('Select a subject to update')
      return
    }

    setState('loading')
    setError(null)
    try {
      await fetchAdminJson<{ subject: Subject }>(`/api/admin/subjects/${encodeURIComponent(selectedId)}`, {
        method: 'PUT',
        body: JSON.stringify({ name: nameText }),
      })
      await loadSubjects()
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to update subject')
    }
  }

  async function handleDelete() {
    if (!selectedId) {
      setError('Select a subject to delete')
      return
    }

    setState('loading')
    setError(null)
    try {
      await fetchAdminJson<{ ok: boolean }>(`/api/admin/subjects/${encodeURIComponent(selectedId)}`, {
        method: 'DELETE',
      })
      await loadSubjects()
      resetForm()
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to delete subject')
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={2.5}>
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h4" fontWeight={900}>
              Subjects
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Manage available interview subjects.
            </Typography>
          </Box>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" onClick={loadSubjects} disabled={state === 'loading'}>
                  Refresh
                </Button>
                {state === 'loading' && <CircularProgress size={20} />}
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <Divider />

              <Typography variant="subtitle1" fontWeight={800}>
                Create / edit
              </Typography>

              <TextField
                label="Subject ID"
                value={idText}
                onChange={(e) => setIdText(e.target.value)}
                disabled={state === 'loading' || !!selectedId}
                helperText={selectedId ? 'ID cannot be changed after creation' : 'e.g. java, typescript, react'}
                fullWidth
              />

              <TextField
                label="Name"
                value={nameText}
                onChange={(e) => setNameText(e.target.value)}
                disabled={state === 'loading'}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={handleCreate} disabled={state === 'loading' || !!selectedId}>
                  Create
                </Button>
                <Button variant="contained" color="secondary" onClick={handleUpdate} disabled={state === 'loading' || !selectedId}>
                  Update
                </Button>
                <Button variant="outlined" color="error" onClick={handleDelete} disabled={state === 'loading' || !selectedId}>
                  Delete
                </Button>
                <Button variant="text" onClick={resetForm} disabled={state === 'loading'}>
                  Clear
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ boxShadow: 'none' }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>
                All subjects
              </Typography>
              <Divider />
              <Stack spacing={1}>
                {subjects.map((s) => (
                  <Card
                    key={s.id}
                    variant="outlined"
                    sx={{ boxShadow: 'none', cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedId(s.id)
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {s.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.id}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                {subjects.length === 0 && state !== 'loading' && (
                  <Typography variant="body2" color="text.secondary">
                    No subjects found.
                  </Typography>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
