import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './auth'
import { About } from './components/About'
import { Account } from './components/Account'
import { AppLayout } from './components/AppLayout'
import { Home } from './components/Home'
import { LoginPage } from './components/LoginPage'
import { QuestionsPage } from './components/QuestionsPage'
import { SubjectsPage } from './components/SubjectsPage'
import { RequireAuth } from './components/RequireAuth'

function AppRoutes() {
  const { initialized, accessToken } = useAuth()

  if (!initialized) return null

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={accessToken ? <Navigate to="/questions" replace /> : <LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<Navigate to={accessToken ? '/questions' : '/'} replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
