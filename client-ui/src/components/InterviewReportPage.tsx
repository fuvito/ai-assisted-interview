import { useEffect, useMemo, useState } from 'react'
import type { GetInterviewResponse, Subject } from '@app/shared'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Container, Stack, Typography } from '@mui/material'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { getInterviewById } from '../api'
import type { LoadState, ReportCardItem } from '../types'
import { upsertRecentInterview } from '../recentInterviews'
import { useSubjects } from '../subjects'
import { ReportCard } from './ReportCard'

function toReportCardItems(data: GetInterviewResponse): ReportCardItem[] {
  return (data.reportCard ?? []).map((item) => ({
    questionIndex: item.questionIndex,
    totalQuestions: item.totalQuestions,
    review: item.review,
  }))
}

function subjectName(subjects: Subject[], subjectId: string): string | null {
  const s = subjects.find((x) => x.id === subjectId)
  return s?.name ?? null
}

export function InterviewReportPage() {
  const { interviewId: rawInterviewId } = useParams()
  const navigate = useNavigate()
  const { subjects } = useSubjects()

  const interviewId = useMemo(() => String(rawInterviewId ?? '').trim(), [rawInterviewId])
  if (!interviewId) return <Navigate to="/dashboard" replace />

  const [loadState, setLoadState] = useState<LoadState>('idle')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [data, setData] = useState<GetInterviewResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function run() {
      setLoadState('loading')
      setLoadError(null)

      try {
        const result = await getInterviewById(interviewId)
        if (cancelled) return

        localStorage.setItem('lastInterviewId', result.interviewId)
        upsertRecentInterview({ interviewId: result.interviewId, subjectId: result.subjectId, status: result.status })

        setData(result)
        setLoadState('success')
      } catch (err) {
        if (cancelled) return
        setLoadState('error')
        setLoadError(err instanceof Error ? err.message : 'Failed to load report')
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [interviewId])

  const title = data ? subjectName(subjects, data.subjectId) ?? data.subjectId : null

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title ? `${title}` : 'Loading…'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              Back to dashboard
            </Button>
            <Button variant="contained" onClick={() => navigate(`/interview/resume/${encodeURIComponent(interviewId)}`)}>
              Resume
            </Button>
          </Box>
        </Box>

        {loadState === 'loading' && (
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Loading report…</Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        {loadState === 'error' && (
          <Card variant="outlined">
            <CardContent>
              <Alert severity="error">{loadError || 'Failed to load report'}</Alert>
            </CardContent>
          </Card>
        )}

        {loadState === 'success' && data && data.status !== 'completed' && (
          <Alert severity="warning">This interview is still in progress. The report includes answers submitted so far.</Alert>
        )}

        {loadState === 'success' && data && toReportCardItems(data).length === 0 && (
          <Alert severity="info">No answers recorded yet.</Alert>
        )}

        {loadState === 'success' && data && <ReportCard reportCard={toReportCardItems(data)} />}
      </Stack>
    </Container>
  )
}
