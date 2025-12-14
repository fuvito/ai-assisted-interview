import type { SubjectId } from '@app/shared'
import { Alert, Box, Button, Card, CardContent, LinearProgress, Stack, TextField, Typography } from '@mui/material'

import type { LoadState } from '../types'

type Props = {
  subjectId: SubjectId
  subjectName?: string

  questionCountText: string
  onQuestionCountTextChange: (value: string) => void

  startState: LoadState
  startError: string | null

  disabled?: boolean
  onStart: () => void
}

export function MockInterviewSetupCard(props: Props) {
  const {
    subjectId,
    subjectName,
    questionCountText,
    onQuestionCountTextChange,
    startState,
    startError,
    disabled,
    onStart,
  } = props

  const busy = disabled ?? startState === 'loading'

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Setup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Subject: {subjectName ? `${subjectName} (${subjectId})` : subjectId}
            </Typography>
          </Box>

          <TextField
            label="Number of questions"
            type="number"
            value={questionCountText}
            onChange={(e) => onQuestionCountTextChange(e.target.value)}
            disabled={busy}
            inputProps={{ min: 1, max: 50 }}
            helperText="Will be clamped to available questions. Leave blank to use the default."
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={onStart} disabled={busy}>
              Start interview
            </Button>
          </Box>

          {startState === 'error' && startError && <Alert severity="error">{startError}</Alert>}
          {startState === 'loading' && <LinearProgress />}
        </Stack>
      </CardContent>
    </Card>
  )
}
