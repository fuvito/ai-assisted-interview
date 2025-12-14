import { useEffect, useState } from 'react'
import type { Subject, SubjectId } from '@app/shared'

import { getSubjects } from './api'
import { Dashboard } from './components/Dashboard'
import { MockInterview } from './components/MockInterview'
import type { LoadState } from './types'

export default function App() {
  const [subjectsState, setSubjectsState] = useState<LoadState>('idle')
  const [subjectsError, setSubjectsError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const [view, setView] = useState<'dashboard' | 'mock-interview'>('dashboard')
  const [mockInterviewSubjectId, setMockInterviewSubjectId] = useState<SubjectId | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadSubjects() {
      setSubjectsState('loading')
      setSubjectsError(null)

      try {
        const data = await getSubjects()
        if (cancelled) return
        setSubjects(data)
        setSubjectsState('success')
      } catch (err) {
        if (cancelled) return
        setSubjectsState('error')
        setSubjectsError(err instanceof Error ? err.message : 'Failed to load subjects')
      }
    }

    loadSubjects()
    return () => {
      cancelled = true
    }
  }, [])

  if (view === 'mock-interview') {
    return (
      <MockInterview
        subjectsState={subjectsState}
        subjectsError={subjectsError}
        subjects={subjects}
        initialSubjectId={mockInterviewSubjectId}
        onExit={() => {
          setView('dashboard')
        }}
      />
    )
  }

  return (
    <Dashboard
      subjectsState={subjectsState}
      subjectsError={subjectsError}
      subjects={subjects}
      onStartMockInterview={(subjectId) => {
        setMockInterviewSubjectId(subjectId)
        setView('mock-interview')
      }}
    />
  )
}
