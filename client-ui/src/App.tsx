import { useEffect, useState } from 'react'
import type {
  PublicQuestion,
  StartInterviewRequest,
  StartInterviewResponse,
  Subject,
  SubjectId,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from '@app/shared'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

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

type InterviewState = {
  interviewId: string
  question: PublicQuestion
  questionIndex: number
  totalQuestions: number
}

export default function App() {
  const [subjectsState, setSubjectsState] = useState<LoadState>('idle')
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(null)

  const [startState, setStartState] = useState<LoadState>('idle')
  const [startError, setStartError] = useState<string | null>(null)

  const [interview, setInterview] = useState<InterviewState | null>(null)

  const [answerText, setAnswerText] = useState('')
  const [submitState, setSubmitState] = useState<LoadState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastFeedback, setLastFeedback] = useState<SubmitAnswerResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      setSubjectsState('loading')
      setSubjectsError(null)

      try {
        const data = await fetchJson<{ subjects: Subject[] }>(apiUrl('/api/subjects'))
        if (cancelled) return
        setSubjects(data.subjects)
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
  }, [])

  async function handleStartInterview(subjectId: SubjectId) {
    setSelectedSubjectId(subjectId)
    setStartState('loading')
    setStartError(null)
    setSubmitError(null)
    setLastFeedback(null)
    setAnswerText('')

    try {
      const payload: StartInterviewRequest = { subjectId, questionCount: 5 }
      const data = await fetchJson<StartInterviewResponse>(apiUrl('/api/interviews/start'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setInterview({
        interviewId: data.interviewId,
        question: data.question,
        questionIndex: data.questionIndex,
        totalQuestions: data.totalQuestions,
      })

      setStartState('success')
    } catch (err) {
      setStartState('error')
      setStartError(err instanceof Error ? err.message : 'Failed to start interview')
    }
  }

  async function handleSubmitAnswer() {
    if (!interview) return
    if (!answerText.trim()) {
      setSubmitError('Please enter an answer before submitting.')
      return
    }

    setSubmitState('loading')
    setSubmitError(null)

    try {
      const payload: SubmitAnswerRequest = {
        questionId: interview.question.id,
        answerText,
      }

      const data = await fetchJson<SubmitAnswerResponse>(
        apiUrl(`/api/interviews/${encodeURIComponent(interview.interviewId)}/answer`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      setLastFeedback(data)

      if (data.done) {
        setInterview(null)
      } else if (data.nextQuestion) {
        setInterview({
          interviewId: interview.interviewId,
          question: data.nextQuestion,
          questionIndex: data.questionIndex,
          totalQuestions: data.totalQuestions,
        })
      }

      setAnswerText('')
      setSubmitState('success')
    } catch (err) {
      setSubmitState('error')
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit answer')
    }
  }

  const progressValue = interview
    ? Math.round(((interview.questionIndex - 1) / Math.max(1, interview.totalQuestions)) * 100)
    : 0

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Client UI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MVP: Start an interview, submit answers, get score + feedback.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Choose a subject
              </Typography>

              {subjectsState === 'loading' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2">Loading subjects…</Typography>
                </Box>
              )}

              {subjectsState === 'error' && subjectsError && (
                <Alert severity="error">{subjectsError}</Alert>
              )}

              {subjectsState === 'success' && (
                <List disablePadding>
                  {subjects.map((s) => (
                    <ListItemButton
                      key={s.id}
                      selected={selectedSubjectId === s.id}
                      disabled={startState === 'loading' || submitState === 'loading'}
                      onClick={() => handleStartInterview(s.id)}
                    >
                      <ListItemText primary={s.name} secondary={s.id} />
                    </ListItemButton>
                  ))}
                </List>
              )}

              {startState === 'error' && startError && <Alert severity="error">{startError}</Alert>}
              {startState === 'loading' && <LinearProgress />}
            </Stack>
          </CardContent>
        </Card>

        {interview && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Question {interview.questionIndex} of {interview.totalQuestions}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Interview ID: {interview.interviewId}
                    </Typography>
                  </Box>

                  <Button
                    variant="text"
                    disabled={submitState === 'loading'}
                    onClick={() => {
                      setInterview(null)
                      setLastFeedback(null)
                      setAnswerText('')
                      setSubmitError(null)
                      setSubmitState('idle')
                    }}
                  >
                    End interview
                  </Button>
                </Box>

                <LinearProgress variant="determinate" value={progressValue} />

                <Typography variant="body1" fontWeight={700}>
                  {interview.question.questionText}
                </Typography>

                <TextField
                  label="Your answer"
                  multiline
                  minRows={6}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  disabled={submitState === 'loading'}
                  fullWidth
                />

                {submitError && <Alert severity="error">{submitError}</Alert>}

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleSubmitAnswer}
                    disabled={submitState === 'loading'}
                  >
                    Submit
                  </Button>
                  {submitState === 'loading' && <CircularProgress size={20} />}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {lastFeedback && (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={700}>
                  Feedback
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
                  <Typography variant="body2" color="text.secondary">
                    Score
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {lastFeedback.evaluation.score} / 10
                  </Typography>
                </Box>

                <Divider />

                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {lastFeedback.evaluation.feedback}
                </Typography>

                {lastFeedback.done && (
                  <Alert severity="success">
                    Interview complete. Select a subject above to start a new one.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  )
}
