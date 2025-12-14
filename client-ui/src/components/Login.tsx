import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Container, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

export type LoginMode = 'sign_in' | 'sign_up'

type Props = {
  mode: LoginMode
  email: string
  password: string
  busy: boolean
  error: string | null

  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void

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
    onSubmit,
  } = props

  const [showPassword, setShowPassword] = useState(false)

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6 } }}>
      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: { xs: 2.5, sm: 4 }, py: { xs: 2.5, sm: 3 }, bgcolor: 'background.default' }}>
          <Typography variant="h5" fontWeight={800}>
            {mode === 'sign_up' ? 'Create account' : 'Welcome back'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {mode === 'sign_up' ? 'Create an account to access the dashboard.' : 'Sign in to access the dashboard.'}
          </Typography>
        </Box>

        <CardContent>
          <Stack spacing={2}>
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              autoComplete={mode === 'sign_up' ? 'new-password' : 'current-password'}
              fullWidth
              disabled={busy}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(e) => e.preventDefault()}
                      edge="end"
                      disabled={busy}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" onClick={onSubmit} disabled={busy}>
                {mode === 'sign_up' ? 'Create account' : 'Sign in'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
