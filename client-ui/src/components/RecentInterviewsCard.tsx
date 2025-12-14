import type { Subject, SubjectId } from '@app/shared'
import { Box, Button, Card, CardContent, Chip, Divider, IconButton, Stack, Typography } from '@mui/material'

import type { RecentInterview } from '../recentInterviews'

type Props = {
  items: RecentInterview[]
  subjects: Subject[]
  onResume: (interviewId: string) => void
  onCopyId: (interviewId: string) => void
  onRemove: (interviewId: string) => void
}

function subjectLabel(subjects: Subject[], subjectId: SubjectId): string {
  const s = subjects.find((x) => x.id === subjectId)
  return s?.name ?? subjectId
}

export function RecentInterviewsCard({ items, subjects, onResume, onCopyId, onRemove }: Props) {
  if (!items.length) return null

  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'background.default' }}>
        <Typography variant="subtitle1" fontWeight={800}>
          Recent interviews
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Quick resume or copy an interview id.
        </Typography>
      </Box>

      <CardContent>
        <Stack spacing={1.5} divider={<Divider flexItem />}> 
          {items.map((it) => (
            <Box key={it.interviewId}>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {subjectLabel(subjects, it.subjectId)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {it.interviewId}
                    </Typography>
                  </Box>

                  <Chip
                    size="small"
                    label={it.status === 'completed' ? 'Completed' : 'In progress'}
                    color={it.status === 'completed' ? 'success' : 'warning'}
                    variant="outlined"
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button size="small" variant="contained" onClick={() => onResume(it.interviewId)}>
                    Resume
                  </Button>
                  <Button size="small" variant="outlined" onClick={() => onCopyId(it.interviewId)}>
                    Copy id
                  </Button>
                  <IconButton size="small" aria-label="Remove" onClick={() => onRemove(it.interviewId)}>
                    ×
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  )
}
