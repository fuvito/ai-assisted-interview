import type { SubmitAnswerResponse } from '@app/shared'
import { Alert, Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material'

type Props = {
  lastFeedback: SubmitAnswerResponse
}

export function FeedbackCard({ lastFeedback }: Props) {
  return (
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
            <Alert severity="success">Interview complete. Select a subject above to start a new one.</Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
