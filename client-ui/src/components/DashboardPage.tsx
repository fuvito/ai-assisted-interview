import type { SubjectId } from '@app/shared'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Snackbar } from '@mui/material'

import { Dashboard } from './Dashboard'
import { useSubjects } from '../subjects'
import { getRecentInterviews, removeRecentInterview } from '../recentInterviews'

export function DashboardPage() {
  const { state, error, subjects } = useSubjects()
  const navigate = useNavigate()
  const location = useLocation()

  const initialInterviewId = typeof window !== 'undefined' ? localStorage.getItem('lastInterviewId') || '' : ''

  const [recent, setRecent] = useState(() => getRecentInterviews())
  const [copiedOpen, setCopiedOpen] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  useEffect(() => {
    function refresh() {
      setRecent(getRecentInterviews())
    }

    refresh()

    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)

    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  useEffect(() => {
    setRecent(getRecentInterviews())
  }, [location.key])

  return (
    <>
      <Dashboard
        subjectsState={state}
        subjectsError={error}
        subjects={subjects}
        onStartMockInterview={(subjectId: SubjectId) => {
          navigate(`/interview/${encodeURIComponent(subjectId)}`)
        }}
        onResumeInterview={(interviewId: string) => {
          localStorage.setItem('lastInterviewId', interviewId)
          navigate(`/interview/resume/${encodeURIComponent(interviewId)}`)
        }}
        initialInterviewId={initialInterviewId}
        recentInterviews={recent}
        onCopyInterviewId={async (interviewId: string) => {
          try {
            await navigator.clipboard.writeText(interviewId)
            setCopiedText(interviewId)
            setCopiedOpen(true)
          } catch {
            setCopiedText('')
            setCopiedOpen(true)
          }
        }}
        onRemoveRecentInterview={(interviewId: string) => {
          removeRecentInterview(interviewId)
          setRecent(getRecentInterviews())
        }}
      />

      <Snackbar
        open={copiedOpen}
        autoHideDuration={2500}
        onClose={() => setCopiedOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={copiedText ? 'success' : 'error'} onClose={() => setCopiedOpen(false)}>
          {copiedText ? 'Interview id copied' : 'Failed to copy'}
        </Alert>
      </Snackbar>
    </>
  )
}
