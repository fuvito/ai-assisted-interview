import { useEffect, useState } from 'react'
import type { StartInterviewRequest, Subject, SubjectId, SubmitAnswerRequest, SubmitAnswerResponse } from '@app/shared'
import { Box, Button, Container, Stack, Typography } from '@mui/material'

import { startInterview, submitAnswer } from '../api'
import type { InterviewState, LoadState, ReportCardItem } from '../types'
import { ActiveInterviewCard } from './ActiveInterviewCard'
import { FeedbackCard } from './FeedbackCard'
import { ReportCard } from './ReportCard'
import { SubjectPickerCard } from './SubjectPickerCard'

type Props = {
  subjectsState: LoadState
  subjectsError: string | null
  subjects: Subject[]
  initialSubjectId: SubjectId | null
  onExit: () => void
}

export function MockInterview({ subjectsState, subjectsError, subjects, initialSubjectId, onExit }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(initialSubjectId)

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
    setSelectedSubjectId(initialSubjectId)
  }, [initialSubjectId])

  async function handleStartInterview(subjectId: SubjectId) {
    setSelectedSubjectId(subjectId)
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
        subjectId,
        ...(questionCount !== undefined ? { questionCount } : {}),
      }

      const data = await startInterview(payload)

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
              Mock interview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Practice with realistic questions and get a report card.
            </Typography>
          </Box>

          <Button variant="outlined" onClick={onExit}>
            Back to dashboard
          </Button>
        </Box>

        <SubjectPickerCard
          subjectsState={subjectsState}
          subjectsError={subjectsError}
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          disabled={startState === 'loading' || submitState === 'loading'}
          questionCountText={questionCountText}
          onQuestionCountTextChange={setQuestionCountText}
          startState={startState}
          startError={startError}
          onStartInterview={handleStartInterview}
        />

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
