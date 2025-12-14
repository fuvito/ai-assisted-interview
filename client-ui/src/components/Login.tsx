import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'

export type LoginMode = 'sign_in' | 'sign_up'

type Props = {
  mode: LoginMode
  email: string
  password: string
  busy: boolean
  error: string | null

  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onModeChange: (mode: LoginMode) => void

  onSubmit: () => void
}

export function Login(props: Props) {
  const {
    mode,
    email,
    password,
    busy,
    error,
    onEmailChange,
    onPasswordChange,
    onModeChange,
    onSubmit,
  } = props

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Sign in
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Log in to access the dashboard.
              </Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              autoComplete="email"
              fullWidth
              disabled={busy}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete={mode === 'sign_up' ? 'new-password' : 'current-password'}
              fullWidth
              disabled={busy}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={onSubmit} disabled={busy}>
                {mode === 'sign_up' ? 'Create account' : 'Sign in'}
              </Button>
              <Button
                variant="text"
                onClick={() => onModeChange(mode === 'sign_in' ? 'sign_up' : 'sign_in')}
                disabled={busy}
              >
                {mode === 'sign_in' ? 'Create account' : 'Back to sign in'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
