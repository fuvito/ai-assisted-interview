import type { SubjectId } from '@app/shared'
import { useNavigate } from 'react-router-dom'

import { Dashboard } from './Dashboard'
import { useSubjects } from '../subjects'

export function DashboardPage() {
  const { state, error, subjects } = useSubjects()
  const navigate = useNavigate()

  return (
    <Dashboard
      subjectsState={state}
      subjectsError={error}
      subjects={subjects}
      onStartMockInterview={(subjectId: SubjectId) => {
        navigate(`/interview/${encodeURIComponent(subjectId)}`)
      }}
    />
  )
}
