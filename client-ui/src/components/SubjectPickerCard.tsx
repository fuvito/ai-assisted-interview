import type { Subject, SubjectId } from '@app/shared'
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import type { LoadState } from '../types'

type Props = {
  subjectsState: LoadState
  subjectsError: string | null
  subjects: Subject[]
  selectedSubjectId: SubjectId | null

  disabled?: boolean

  questionCountText: string
  onQuestionCountTextChange: (value: string) => void

  startState: LoadState
  startError: string | null

  onStartInterview: (subjectId: SubjectId) => void
}

export function SubjectPickerCard(props: Props) {
  const {
    subjectsState,
    subjectsError,
    subjects,
    selectedSubjectId,
    disabled,
    questionCountText,
    onQuestionCountTextChange,
    startState,
    startError,
    onStartInterview,
  } = props

  const busy = disabled ?? startState === 'loading'

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Choose a subject
          </Typography>

          <TextField
            label="Number of questions"
            type="number"
            value={questionCountText}
            onChange={(e) => onQuestionCountTextChange(e.target.value)}
            disabled={busy}
            inputProps={{ min: 1, max: 50 }}
            helperText="Will be clamped to available questions. Leave blank to use the default."
          />

          {subjectsState === 'loading' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Loading subjects…</Typography>
            </Box>
          )}

          {subjectsState === 'error' && subjectsError && <Alert severity="error">{subjectsError}</Alert>}

          {subjectsState === 'success' && (
            <List disablePadding>
              {subjects.map((s) => (
                <ListItemButton
                  key={s.id}
                  selected={selectedSubjectId === s.id}
                  disabled={busy}
                  onClick={() => onStartInterview(s.id)}
                >
                  <ListItemText primary={s.name} secondary={s.id} />
                </ListItemButton>
              ))}
            </List>
          )}

          {startState === 'error' && startError && <Alert severity="error">{startError}</Alert>}
          {startState === 'loading' && <LinearProgress />}
        </Stack>
      </CardContent>
    </Card>
  )
}
