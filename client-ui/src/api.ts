import type {
  GetInterviewResponse,
  StartInterviewRequest,
  StartInterviewResponse,
  Subject,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from '@app/shared'

import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = new Headers(init?.headers)
  if (!headers.has('Content-Type') && init?.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(url, { ...init, headers })
  if (!res.ok) {
    if (res.status === 401) await supabase.auth.signOut()
    const text = await res.text()
    throw new Error(text || `Request failed (${res.status})`)
  }
  return (await res.json()) as T
}

export async function getSubjects(): Promise<Subject[]> {
  const data = await fetchJson<{ subjects: Subject[] }>(apiUrl('/api/subjects'))
  return data.subjects
}

export async function startInterview(payload: StartInterviewRequest): Promise<StartInterviewResponse> {
  return fetchJson<StartInterviewResponse>(apiUrl('/api/interviews/start'), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getInterviewById(interviewId: string): Promise<GetInterviewResponse> {
  return fetchJson<GetInterviewResponse>(apiUrl(`/api/interviews/${encodeURIComponent(interviewId)}`))
}

export async function submitAnswer(interviewId: string, payload: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
  return fetchJson<SubmitAnswerResponse>(apiUrl(`/api/interviews/${encodeURIComponent(interviewId)}/answer`), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
