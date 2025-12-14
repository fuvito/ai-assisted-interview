import type { Subject, SubjectId } from '@app/shared'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'

import type { LoadState } from '../types'
import type { RecentInterview } from '../recentInterviews'
import { ResumeInterviewCard } from './ResumeInterviewCard'
import { RecentInterviewsCard } from './RecentInterviewsCard'

type Props = {
  subjectsState: LoadState
  subjectsError: string | null
  subjects: Subject[]
  onStartMockInterview: (subjectId: SubjectId) => void
  onResumeInterview: (interviewId: string) => void
  initialInterviewId: string

  recentInterviews: RecentInterview[]
  onCopyInterviewId: (interviewId: string) => void
  onRemoveRecentInterview: (interviewId: string) => void
}

export function Dashboard({
  subjectsState,
  subjectsError,
  subjects,
  onStartMockInterview,
  onResumeInterview,
  initialInterviewId,
  recentInterviews,
  onCopyInterviewId,
  onRemoveRecentInterview,
}: Props) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, sm: 6 } }}>
      <Stack spacing={2.5}>
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Typography variant="h4" fontWeight={900}>
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Pick a subject to start an interview and get detailed feedback.
            </Typography>
          </Box>
          <CardContent>
            <Stack spacing={0.5}>
              <Typography variant="subtitle1" fontWeight={800}>
                Subjects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose one to begin.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <RecentInterviewsCard
          items={recentInterviews}
          subjects={subjects}
          onResume={onResumeInterview}
          onCopyId={onCopyInterviewId}
          onRemove={onRemoveRecentInterview}
        />

        <ResumeInterviewCard initialInterviewId={initialInterviewId} onResume={onResumeInterview} />

        {subjectsState === 'loading' && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2">Loading subjects…</Typography>
            </CardContent>
          </Card>
        )}

        {subjectsState === 'error' && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="error">
                {subjectsError || 'Failed to load subjects'}
              </Typography>
            </CardContent>
          </Card>
        )}

        {subjectsState === 'success' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {subjects.map((s) => (
              <Card key={s.id} variant="outlined">
                <CardActionArea onClick={() => onStartMockInterview(s.id)}>
                  <CardContent>
                    <Stack spacing={0.75}>
                      <Typography variant="h6" fontWeight={800}>
                        {s.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.id}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Start interview
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        )}
      </Stack>
    </Container>
  )
}
