import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '../auth'
import { LoginForm } from './LoginForm'

type LocationState = {
  from?: { pathname?: string }
}

export function LoginPage() {
  const { accessToken, authState, error, signInWithPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (accessToken) {
      const state = (location.state || {}) as LocationState
      const to = state.from?.pathname || '/questions'
      navigate(to, { replace: true })
    }
  }, [accessToken, location.state, navigate])

  async function onSubmit() {
    await signInWithPassword(email, password)
  }

  return (
    <LoginForm
      email={email}
      password={password}
      busy={authState === 'loading'}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={onSubmit}
    />
  )
}
