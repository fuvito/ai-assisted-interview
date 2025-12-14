import { useEffect, useMemo, useState } from 'react'
import type { GetInterviewResponse, Subject } from '@app/shared'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from '@mui/material'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { getInterviewById, submitAnswer } from '../api'
import type { InterviewState, LoadState } from '../types'
import { useSubjects } from '../subjects'
import { upsertRecentInterview } from '../recentInterviews'
import { ActiveInterviewCard } from './ActiveInterviewCard'

function subjectName(subjects: Subject[], subjectId: string): string | null {
  const s = subjects.find((x) => x.id === subjectId)
  return s?.name ?? null
}

export function ResumeInterviewPage() {
  const { interviewId: rawInterviewId } = useParams()
  const navigate = useNavigate()
  const { subjects } = useSubjects()

  const interviewId = useMemo(() => String(rawInterviewId ?? '').trim(), [rawInterviewId])
  if (!interviewId) return <Navigate to="/dashboard" replace />

  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [data, setData] = useState<GetInterviewResponse | null>(null)

  const [interview, setInterview] = useState<InterviewState | null>(null)

  const [answerText, setAnswerText] = useState('')
  const [submitState, setSubmitState] = useState<LoadState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [averageScore, setAverageScore] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoadState('loading')
      setLoadError(null)

      try {
        const result = await getInterviewById(interviewId)
        if (cancelled) return

        const currentAnsweredCount = result.reportCard?.length ?? 0
        const currentAverageScore =
          currentAnsweredCount > 0
            ? result.reportCard.reduce((sum, item) => sum + item.review.evaluation.score, 0) / currentAnsweredCount
            : null

        setAnsweredCount(currentAnsweredCount)
        setAverageScore(currentAverageScore)

        localStorage.setItem('lastInterviewId', result.interviewId)
        upsertRecentInterview({
          interviewId: result.interviewId,
          subjectId: result.subjectId,
          status: result.status,
          ...(currentAnsweredCount > 0 ? { answeredCount: currentAnsweredCount } : {}),
          ...(currentAverageScore !== null ? { averageScore: currentAverageScore } : {}),
        })

        setData(result)

        if (result.status === 'completed') {
          navigate(`/interview/report/${encodeURIComponent(result.interviewId)}`, { replace: true })
          return
        }

        if (result.status === 'in_progress' && result.currentQuestion) {
          setInterview({
            interviewId: result.interviewId,
            question: result.currentQuestion,
            questionIndex: result.questionIndex,
            totalQuestions: result.totalQuestions,
          })
        } else {
          setInterview(null)
        }

        setLoadState('success')
      } catch (err) {
        if (cancelled) return
        setLoadState('error')
        setLoadError(err instanceof Error ? err.message : 'Failed to load interview')
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [interviewId])

  async function handleSubmitAnswer() {
    if (!interview) return
    if (!answerText.trim()) {
      setSubmitError('Please enter an answer before submitting.')
      return
    }

    setSubmitState('loading')
    setSubmitError(null)

    try {
      const result = await submitAnswer(interview.interviewId, {
        questionId: interview.question.id,
        answerText,
      })

      localStorage.setItem('lastInterviewId', interview.interviewId)

      const nextAnsweredCount = answeredCount + 1
      const nextAverageScore =
        (averageScore ?? 0) * answeredCount / Math.max(1, nextAnsweredCount) +
        result.evaluation.score / Math.max(1, nextAnsweredCount)

      setAnsweredCount(nextAnsweredCount)
      setAverageScore(nextAverageScore)

      upsertRecentInterview({
        interviewId: interview.interviewId,
        subjectId: interview.question.subjectId,
        status: result.done ? 'completed' : 'in_progress',
        answeredCount: nextAnsweredCount,
        averageScore: nextAverageScore,
      })

      if (result.done) {
        navigate(`/interview/report/${encodeURIComponent(interview.interviewId)}`)
        return
      } else if (result.nextQuestion) {
        setInterview({
          interviewId: interview.interviewId,
          question: result.nextQuestion,
          questionIndex: result.questionIndex,
          totalQuestions: result.totalQuestions,
        })
      }

      setAnswerText('')
      setSubmitState('success')
    } catch (err) {
      setSubmitState('error')
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit answer')
    }
  }

  const title = data ? subjectName(subjects, data.subjectId) ?? data.subjectId : null

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Interview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title ? `${title}` : 'Loading…'}
            </Typography>
          </Box>

          <Button variant="outlined" onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </Button>
        </Box>

        {loadState === 'loading' && (
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading interview…</Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {loadState === 'error' && (
          <Card variant="outlined">
            <CardContent>
              <Alert severity="error">{loadError || 'Failed to load interview'}</Alert>
            </CardContent>
          </Card>
        )}

        {loadState === 'success' && data && data.status === 'completed' && (
          <Alert severity="success">Interview complete. Redirecting to report…</Alert>
        )}

        {interview && (
          <ActiveInterviewCard
            interview={interview}
            answerText={answerText}
            onAnswerTextChange={setAnswerText}
            submitState={submitState}
            submitError={submitError}
            onSubmit={handleSubmitAnswer}
            onEndInterview={() => {
              setInterview(null)
              setAnswerText('')
              setSubmitError(null)
              setSubmitState('idle')
              navigate('/dashboard')
            }}
          />
        )}
      </Stack>
    </Container>
  )
}
