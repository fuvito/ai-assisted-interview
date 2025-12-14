import type { SubjectId } from '@app/shared'
import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { MockInterview } from './MockInterview'
import { useSubjects } from '../subjects'

export function InterviewPage() {
  const { subjectId } = useParams()
  const navigate = useNavigate()
  const { subjects } = useSubjects()

  const selected = useMemo(() => {
    const raw = (subjectId || '').trim()
    if (!raw) return null

    const id = decodeURIComponent(raw)
    const exists = subjects.some((s) => s.id === id)
    if (!exists) return null

    return { id }
  }, [subjectId, subjects])

  if (!selected) return <Navigate to="/dashboard" replace />

  return (
    <MockInterview
      subjects={subjects}
      subjectId={selected.id as SubjectId}
      onExit={() => {
        navigate('/dashboard')
      }}
    />
  )
}
