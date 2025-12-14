import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Question, Subject, SubjectId } from '@app/shared'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { supabase } from '../supabaseClient'
import { useAuth } from '../auth'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

type EditMode = 'create' | 'edit'

type EditDialogState = {
  open: boolean
  mode: EditMode
  questionId: string | null
  questionText: string
  expertAnswer: string
}

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

export function SubjectQuestionsPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const { subjectId: rawSubjectId } = useParams()

  const subjectId = useMemo(() => decodeURIComponent(String(rawSubjectId ?? '')).trim(), [rawSubjectId])
  if (!subjectId) return <Navigate to="/questions" replace />

  const [subjects, setSubjects] = useState<Subject[]>([])
  const selectedSubject = useMemo(() => subjects.find((s) => s.id === subjectId) || null, [subjects, subjectId])

  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    mode: 'create',
    questionId: null,
    questionText: '',
    expertAnswer: '',
  })

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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
    try {
      const data = await fetchAdminJson<{ subjects: Subject[] }>('/api/admin/subjects')
      setSubjects(data.subjects)
    } catch {
      setSubjects([])
    }
  }, [accessToken, fetchAdminJson])

  const loadQuestions = useCallback(async () => {
    if (!accessToken) return

    setState('loading')
    setError(null)
    try {
      const data = await fetchAdminJson<{ questions: Question[] }>(
        `/api/admin/questions?subject=${encodeURIComponent(subjectId as SubjectId)}`,
      )
      setQuestions(data.questions)
      setState('success')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to load questions')
    }
  }, [accessToken, fetchAdminJson, subjectId])

  useEffect(() => {
    loadSubjects()
  }, [loadSubjects])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  function openCreate() {
    setEditDialog({ open: true, mode: 'create', questionId: null, questionText: '', expertAnswer: '' })
  }

  function openEdit(q: Question) {
    setEditDialog({
      open: true,
      mode: 'edit',
      questionId: q.id,
      questionText: q.questionText,
      expertAnswer: q.expertAnswer,
    })
  }

  async function handleSave() {
    setState('loading')
    setError(null)

    try {
      const payload = {
        questionText: editDialog.questionText,
        expertAnswer: editDialog.expertAnswer,
      }

      if (editDialog.mode === 'create') {
        await fetchAdminJson<{ question: Question }>('/api/admin/questions', {
          method: 'POST',
          body: JSON.stringify({ subjectId: subjectId as SubjectId, ...payload }),
        })
      } else {
        await fetchAdminJson<{ question: Question }>(`/api/admin/questions/${encodeURIComponent(editDialog.questionId || '')}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      }

      setEditDialog((prev) => ({ ...prev, open: false }))
      await loadQuestions()
      setState('success')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to save question')
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmDeleteId) return

    setState('loading')
    setError(null)

    try {
      await fetchAdminJson<{ ok: boolean }>(`/api/admin/questions/${encodeURIComponent(confirmDeleteId)}`, {
        method: 'DELETE',
      })
      setConfirmDeleteId(null)
      await loadQuestions()
      setState('success')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to delete question')
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={2.5}>
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" fontWeight={900}>
                  Questions
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                  {selectedSubject ? `${selectedSubject.name} (${subjectId})` : subjectId}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/questions')}
                >
                  Subjects
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshIcon />}
                  onClick={loadQuestions}
                  disabled={state === 'loading'}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  color="inherit"
                  startIcon={<AddIcon />}
                  onClick={openCreate}
                  disabled={state === 'loading'}
                >
                  Create
                </Button>
              </Box>
            </Box>
          </Box>

          <CardContent>
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h6" fontWeight={800}>
                {questions.length}
              </Typography>
              {state === 'loading' && <CircularProgress size={18} />}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Card variant="outlined" sx={{ boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="70%">Question</TableCell>
                    <TableCell width="30%" align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((q) => (
                    <TableRow key={q.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {q.questionText.length > 120 ? `${q.questionText.slice(0, 120)}…` : q.questionText}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {q.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => openEdit(q)} disabled={state === 'loading'}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => setConfirmDeleteId(q.id)} disabled={state === 'loading'} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {questions.length === 0 && state !== 'loading' && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          No questions yet for this subject.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editDialog.mode === 'create' ? 'Create question' : 'Edit question'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Question"
              value={editDialog.questionText}
              onChange={(e) => setEditDialog((prev) => ({ ...prev, questionText: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
              disabled={state === 'loading'}
            />
            <TextField
              label="Expert answer"
              value={editDialog.expertAnswer}
              onChange={(e) => setEditDialog((prev) => ({ ...prev, expertAnswer: e.target.value }))}
              fullWidth
              multiline
              minRows={6}
              disabled={state === 'loading'}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog((prev) => ({ ...prev, open: false }))} disabled={state === 'loading'}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={state === 'loading'}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>Delete question?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} disabled={state === 'loading'}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirmed} disabled={state === 'loading'}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
