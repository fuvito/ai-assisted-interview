import { useEffect, useState } from 'react'
import type { StartInterviewRequest, Subject, SubjectId, SubmitAnswerRequest, SubmitAnswerResponse } from '@app/shared'
import { Box, Container, Stack, Typography } from '@mui/material'

import { getSubjects, startInterview, submitAnswer } from './api'
import { ActiveInterviewCard } from './components/ActiveInterviewCard'
import { FeedbackCard } from './components/FeedbackCard'
import { ReportCard } from './components/ReportCard'
import { SubjectPickerCard } from './components/SubjectPickerCard'
import type { InterviewState, LoadState, ReportCardItem } from './types'

export default function App() {
  const [subjectsState, setSubjectsState] = useState<LoadState>('idle')
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<SubjectId | null>(null)

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
  }, [])

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
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Client UI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            MVP: Start an interview, submit answers, get score + feedback.
          </Typography>
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
