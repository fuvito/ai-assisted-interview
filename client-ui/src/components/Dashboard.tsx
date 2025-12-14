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

type Props = {
  subjectsState: LoadState
  subjectsError: string | null
  subjects: Subject[]
  onStartMockInterview: (subjectId: SubjectId) => void
}

export function Dashboard({ subjectsState, subjectsError, subjects, onStartMockInterview }: Props) {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pick a subject to start a mock interview. You will receive scoring, feedback, and a report card.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6" fontWeight={700}>
                Subjects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose one to begin.
              </Typography>
            </Stack>
          </CardContent>
        </Card>

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
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={800}>
                        {s.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {s.id}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Click to start mock interview
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
