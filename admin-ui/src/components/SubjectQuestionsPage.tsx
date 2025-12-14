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
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import RefreshIcon from '@mui/icons-material/Refresh'
import VisibilityIcon from '@mui/icons-material/Visibility'
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

type SnackbarState = {
  open: boolean
  message: string
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

  const [searchText, setSearchText] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const [editDialog, setEditDialog] = useState<EditDialogState>({
    open: false,
    mode: 'create',
    questionId: null,
    questionText: '',
    expertAnswer: '',
  })

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [viewQuestionId, setViewQuestionId] = useState<string | null>(null)
  const viewQuestion = useMemo(() => questions.find((q) => q.id === viewQuestionId) ?? null, [questions, viewQuestionId])

  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '' })

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

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    if (!q) return questions

    return questions.filter((item) => {
      return (
        item.id.toLowerCase().includes(q) ||
        item.questionText.toLowerCase().includes(q) ||
        item.expertAnswer.toLowerCase().includes(q)
      )
    })
  }, [questions, searchText])

  useEffect(() => {
    setPage(0)
  }, [searchText, subjectId])

  const paged = useMemo(() => {
    const start = page * rowsPerPage
    return filtered.slice(start, start + rowsPerPage)
  }, [filtered, page, rowsPerPage])

  function openCreate() {
    setEditDialog({ open: true, mode: 'create', questionId: null, questionText: '', expertAnswer: '' })
  }

  function openDuplicate(q: Question) {
    setEditDialog({ open: true, mode: 'create', questionId: null, questionText: q.questionText, expertAnswer: q.expertAnswer })
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
        setSnackbar({ open: true, message: 'Question created' })
      } else {
        await fetchAdminJson<{ question: Question }>(`/api/admin/questions/${encodeURIComponent(editDialog.questionId || '')}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setSnackbar({ open: true, message: 'Question updated' })
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
      setSnackbar({ open: true, message: 'Question deleted' })
      await loadQuestions()
      setState('success')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to delete question')
    }
  }

  async function copyToClipboard(text: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(text)
      setSnackbar({ open: true, message: successMessage })
    } catch {
      setError('Failed to copy to clipboard')
      setState('error')
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
                  sx={{ borderColor: 'rgba(255,255,255,0.65)' }}
                >
                  Subjects
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshIcon />}
                  onClick={loadQuestions}
                  disabled={state === 'loading'}
                  sx={{ borderColor: 'rgba(255,255,255,0.65)' }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: 'common.white',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
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
                {filtered.length}
              </Typography>
              {state === 'loading' && <CircularProgress size={18} />}
            </Box>

            <TextField
              label="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search question text, answer, or id"
              fullWidth
              disabled={state === 'loading'}
              sx={{ mb: 2 }}
            />

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
                  {paged.map((q) => (
                    <TableRow
                      key={q.id}
                      hover
                      onDoubleClick={() => {
                        setViewQuestionId(q.id)
                      }}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {q.questionText.length > 120 ? `${q.questionText.slice(0, 120)}…` : q.questionText}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {q.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <span>
                            <IconButton onClick={() => setViewQuestionId(q.id)} disabled={state === 'loading'}>
                              <VisibilityIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <span>
                            <IconButton onClick={() => openEdit(q)} disabled={state === 'loading'}>
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Duplicate">
                          <span>
                            <IconButton onClick={() => openDuplicate(q)} disabled={state === 'loading'}>
                              <FileCopyIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Copy question">
                          <span>
                            <IconButton
                              onClick={() => copyToClipboard(q.questionText, 'Question copied')}
                              disabled={state === 'loading'}
                            >
                              <ContentCopyIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              onClick={() => setConfirmDeleteId(q.id)}
                              disabled={state === 'loading'}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && state !== 'loading' && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          No questions match your filter.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_e, next) => setPage(next)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setPage(0)
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
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

      <Dialog open={!!viewQuestion} onClose={() => setViewQuestionId(null)} fullWidth maxWidth="md">
        <DialogTitle>Question details</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Question
              </Typography>
              <Typography variant="body1" fontWeight={700} sx={{ whiteSpace: 'pre-wrap' }}>
                {viewQuestion?.questionText || ''}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Expert answer
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {viewQuestion?.expertAnswer || ''}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (viewQuestion) copyToClipboard(viewQuestion.questionText, 'Question copied')
            }}
            disabled={!viewQuestion}
          >
            Copy question
          </Button>
          <Button
            onClick={() => {
              if (viewQuestion) copyToClipboard(viewQuestion.expertAnswer, 'Expert answer copied')
            }}
            disabled={!viewQuestion}
          >
            Copy answer
          </Button>
          <Button onClick={() => setViewQuestionId(null)}>Close</Button>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        message={snackbar.message}
      />
    </Container>
  )
}
