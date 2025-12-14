import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'

type Props = {
  initialInterviewId: string
  onResume: (interviewId: string) => void
}

export function ResumeInterviewCard({ initialInterviewId, onResume }: Props) {
  const [interviewId, setInterviewId] = useState(initialInterviewId)
  const [error, setError] = useState<string | null>(null)

  function handleResume() {
    const trimmed = interviewId.trim()
    if (!trimmed) {
      setError('Enter an interview id')
      return
    }
    setError(null)
    onResume(trimmed)
  }

  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'background.default' }}>
        <Typography variant="subtitle1" fontWeight={800}>
          Resume interview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Continue an in-progress interview or view a completed report.
        </Typography>
      </Box>
      <CardContent>
        <Stack spacing={1.5}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Interview ID"
            value={interviewId}
            onChange={(e) => setInterviewId(e.target.value)}
            fullWidth
          />
          <Box>
            <Button variant="contained" onClick={handleResume}>
              Resume
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
