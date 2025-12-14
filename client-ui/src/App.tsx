import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './auth'
import { SubjectsProvider } from './subjects'
import { Account } from './components/Account'
import { About } from './components/About'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './components/DashboardPage'
import { Home } from './components/Home'
import { InterviewPage } from './components/InterviewPage'
import { LoginPage } from './components/LoginPage'
import { RequireAuth } from './components/RequireAuth'

function AppRoutes() {
  const { initialized, accessToken } = useAuth()

  if (!initialized) return null

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={accessToken ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview/:subjectId" element={<InterviewPage />} />
          <Route path="/account" element={<Account />} />
        </Route>

        <Route path="*" element={<Navigate to={accessToken ? '/dashboard' : '/'} replace />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SubjectsProvider>
        <AppRoutes />
      </SubjectsProvider>
    </AuthProvider>
  )
}
