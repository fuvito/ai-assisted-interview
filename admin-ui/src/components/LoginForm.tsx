import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'

type Props = {
  email: string
  password: string
  busy: boolean
  error: string | null
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void
}

export function LoginForm(props: Props) {
  const { email, password, busy, error, onEmailChange, onPasswordChange, onSubmit } = props

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                Admin Login
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in with a Supabase Auth admin account.
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
              autoComplete="current-password"
              fullWidth
              disabled={busy}
            />

            <Button variant="contained" onClick={onSubmit} disabled={busy}>
              Sign in
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
