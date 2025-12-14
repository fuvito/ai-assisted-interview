import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import type { InterviewState, LoadState } from '../types'

type Props = {
  interview: InterviewState
  answerText: string
  onAnswerTextChange: (value: string) => void

  submitState: LoadState
  submitError: string | null

  onSubmit: () => void
  onEndInterview: () => void
}

export function ActiveInterviewCard(props: Props) {
  const {
    interview,
    answerText,
    onAnswerTextChange,
    submitState,
    submitError,
    onSubmit,
    onEndInterview,
  } = props

  const progressValue = Math.round(((interview.questionIndex - 1) / Math.max(1, interview.totalQuestions)) * 100)

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Question {interview.questionIndex} of {interview.totalQuestions}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Interview ID: {interview.interviewId}
              </Typography>
            </Box>

            <Button variant="text" disabled={submitState === 'loading'} onClick={onEndInterview}>
              End interview
            </Button>
          </Box>

          <LinearProgress variant="determinate" value={progressValue} />

          <Typography variant="body1" fontWeight={700}>
            {interview.question.questionText}
          </Typography>

          <TextField
            label="Your answer"
            multiline
            minRows={6}
            value={answerText}
            onChange={(e) => onAnswerTextChange(e.target.value)}
            disabled={submitState === 'loading'}
            fullWidth
          />

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant="contained" onClick={onSubmit} disabled={submitState === 'loading'}>
              Submit
            </Button>
            {submitState === 'loading' && <CircularProgress size={20} />}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
