import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth'
import { Login, type LoginMode } from './Login'

type LocationState = {
  from?: { pathname?: string }
}

export function LoginPage() {
  const { accessToken, authState, error, signInWithPassword, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [mode, setMode] = useState<LoginMode>('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (accessToken) {
      const state = (location.state || {}) as LocationState
      const to = state.from?.pathname || '/dashboard'
      navigate(to, { replace: true })
    }
  }, [accessToken, location.state, navigate])

  async function onSubmit() {
    if (mode === 'sign_up') {
      await signUp(email, password)
    } else {
      await signInWithPassword(email, password)
    }
  }

  return (
    <Login
      mode={mode}
      email={email}
      password={password}
      busy={authState === 'loading'}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onModeChange={setMode}
      onSubmit={onSubmit}
    />
  )
}
