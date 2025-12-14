import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Subject } from '@app/shared'

import { getSubjects } from './api'
import { useAuth } from './auth'
import type { LoadState } from './types'

type SubjectsContextValue = {
  state: LoadState
  error: string | null
  subjects: Subject[]
  refresh: () => Promise<void>
}

const SubjectsContext = createContext<SubjectsContextValue | null>(null)

export function SubjectsProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()

  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])

  const refresh = useCallback(async () => {
    if (!accessToken) return

    setState('loading')
    setError(null)
    try {
      const data = await getSubjects()
      setSubjects(data)
      setState('success')
    } catch (e) {
      setState('error')
      setError(e instanceof Error ? e.message : 'Failed to load subjects')
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) {
      setSubjects([])
      setState('idle')
      setError(null)
      return
    }

    refresh()
  }, [accessToken, refresh])

  const value = useMemo<SubjectsContextValue>(() => ({ state, error, subjects, refresh }), [state, error, subjects])

  return <SubjectsContext.Provider value={value}>{children}</SubjectsContext.Provider>
}

export function useSubjects(): SubjectsContextValue {
  const value = useContext(SubjectsContext)
  if (!value) throw new Error('useSubjects must be used within a SubjectsProvider')
  return value
}
