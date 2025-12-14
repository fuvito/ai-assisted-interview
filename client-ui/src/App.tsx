import { Navigate, Route, Routes } from 'react-router-dom'

import { AuthProvider, useAuth } from './auth'
import { SubjectsProvider } from './subjects'
import { Account } from './components/Account'
import { About } from './components/About'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './components/DashboardPage'
import { Home } from './components/Home'
import { InterviewPage } from './components/InterviewPage'
import { InterviewReportPage } from './components/InterviewReportPage'
import { LoginPage } from './components/LoginPage'
import { RecentInterviewsPage } from './components/RecentInterviewsPage'
import { RequireAuth } from './components/RequireAuth'
import { ResumeInterviewPage } from './components/ResumeInterviewPage'

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
          <Route path="/recent-interviews" element={<RecentInterviewsPage />} />
          <Route path="/interview/:subjectId" element={<InterviewPage />} />
          <Route path="/interview/resume/:interviewId" element={<ResumeInterviewPage />} />
          <Route path="/interview/report/:interviewId" element={<InterviewReportPage />} />
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
