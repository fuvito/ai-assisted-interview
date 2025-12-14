import { useEffect, useState } from 'react'
import type { StartInterviewRequest, Subject, SubjectId, SubmitAnswerRequest, SubmitAnswerResponse } from '@app/shared'
import { Box, Button, Container, Stack, Typography } from '@mui/material'

import { startInterview, submitAnswer } from '../api'
import type { InterviewState, LoadState, ReportCardItem } from '../types'
import { upsertRecentInterview } from '../recentInterviews'
import { ActiveInterviewCard } from './ActiveInterviewCard'
import { FeedbackCard } from './FeedbackCard'
import { MockInterviewSetupCard } from './MockInterviewSetupCard'
import { ReportCard } from './ReportCard'

type Props = {
  subjects: Subject[]
  subjectId: SubjectId
  onExit: () => void
}

export function MockInterview({ subjects, subjectId, onExit }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId>(subjectId)

  const [questionCountText, setQuestionCountText] = useState('5')

  const [startState, setStartState] = useState<LoadState>('idle')
  const [startError, setStartError] = useState<string | null>(null)

  const [interview, setInterview] = useState<InterviewState | null>(null)

  const [reportCard, setReportCard] = useState<ReportCardItem[]>([])

  const [answerText, setAnswerText] = useState('')
  const [submitState, setSubmitState] = useState<LoadState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastFeedback, setLastFeedback] = useState<SubmitAnswerResponse | null>(null)

  useEffect(() => {
    setSelectedSubjectId(subjectId)
  }, [subjectId])

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || null

  async function handleStartInterview() {
    setStartState('loading')
    setStartError(null)
    setSubmitError(null)
    setLastFeedback(null)
    setAnswerText('')
    setReportCard([])

    try {
      const parsedCount = Number(questionCountText)
      const questionCount = Number.isFinite(parsedCount) && parsedCount > 0 ? Math.floor(parsedCount) : undefined

      const payload: StartInterviewRequest = {
        subjectId: selectedSubjectId,
        ...(questionCount !== undefined ? { questionCount } : {}),
      }

      const data = await startInterview(payload)

      localStorage.setItem('lastInterviewId', data.interviewId)
      upsertRecentInterview({ interviewId: data.interviewId, subjectId: selectedSubjectId, status: 'in_progress' })

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

      const data = await submitAnswer(interview.interviewId, payload)

      upsertRecentInterview({
        interviewId: interview.interviewId,
        subjectId: interview.question.subjectId,
        status: data.done ? 'completed' : 'in_progress',
      })

      setLastFeedback(data)

      setReportCard((prev) => [
        ...prev,
        {
          questionIndex: data.questionIndex,
          totalQuestions: data.totalQuestions,
          review: data.review,
        },
      ])

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

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Interview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSubject?.name ? `${selectedSubject.name} (${selectedSubjectId})` : selectedSubjectId}
            </Typography>
          </Box>

          <Button variant="outlined" onClick={onExit}>
            Back to dashboard
          </Button>
        </Box>

        {selectedSubjectId && (
          <MockInterviewSetupCard
            subjectId={selectedSubjectId}
            subjectName={selectedSubject?.name}
            questionCountText={questionCountText}
            onQuestionCountTextChange={setQuestionCountText}
            startState={startState}
            startError={startError}
            disabled={submitState === 'loading'}
            onStart={handleStartInterview}
          />
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
              setLastFeedback(null)
              setAnswerText('')
              setSubmitError(null)
              setSubmitState('idle')
            }}
          />
        )}

        {lastFeedback && <FeedbackCard lastFeedback={lastFeedback} />}

        {lastFeedback?.done && reportCard.length > 0 && <ReportCard reportCard={reportCard} />}
      </Stack>
    </Container>
  )
}
