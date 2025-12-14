import type { StartInterviewRequest, SubjectId } from '@app/shared'
import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { startInterview } from '../api'
import type { LoadState } from '../types'
import { upsertRecentInterview } from '../recentInterviews'
import { useSubjects } from '../subjects'
import { MockInterviewSetupCard } from './MockInterviewSetupCard'

export function InterviewPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { subjects } = useSubjects()

  const [questionCountText, setQuestionCountText] = useState('5')
  const [startState, setStartState] = useState<LoadState>('idle')
  const [startError, setStartError] = useState<string | null>(null)

  const selected = useMemo(() => {
    const raw = (subjectId || '').trim()
    if (!raw) return null

    const id = decodeURIComponent(raw)
    const exists = subjects.some((s) => s.id === id)
    if (!exists) return null

    return { id }
  }, [subjectId, subjects])

  if (!selected) return <Navigate to="/dashboard" replace />

  const selectedId = selected.id
  const selectedSubject = subjects.find((s) => s.id === selectedId) || null

  useEffect(() => {
    setStartError(null)
    setStartState('idle')
  }, [selectedId])

  async function handleStartInterview() {
    setStartState('loading')
    setStartError(null)

    try {
      const parsedCount = Number(questionCountText)
      const questionCount = Number.isFinite(parsedCount) && parsedCount > 0 ? Math.floor(parsedCount) : undefined

      const payload: StartInterviewRequest = {
        subjectId: selectedId as SubjectId,
        ...(questionCount !== undefined ? { questionCount } : {}),
      }

      const data = await startInterview(payload)

      localStorage.setItem('lastInterviewId', data.interviewId)
      upsertRecentInterview({ interviewId: data.interviewId, subjectId: selectedId as SubjectId, status: 'in_progress' })

      navigate(`/interview/resume/${encodeURIComponent(data.interviewId)}`)
      setStartState('success')
    } catch (err) {
      setStartState('error')
      setStartError(err instanceof Error ? err.message : 'Failed to start interview')
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Setup interview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedSubject?.name ? `${selectedSubject.name} (${selectedId})` : selectedId}
            </Typography>
          </Box>

          <Button variant="outlined" onClick={() => navigate('/dashboard')} disabled={startState === 'loading'}>
            Back to dashboard
          </Button>
        </Box>

        <MockInterviewSetupCard
          subjectId={selectedId as SubjectId}
          subjectName={selectedSubject?.name}
          questionCountText={questionCountText}
          onQuestionCountTextChange={setQuestionCountText}
          startState={startState}
          startError={startError}
          disabled={startState === 'loading'}
          onStart={handleStartInterview}
        />
      </Stack>
    </Container>
  )
}
