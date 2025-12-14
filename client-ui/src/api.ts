import type {
  StartInterviewRequest,
  StartInterviewResponse,
  Subject,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from '@app/shared'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function submitAnswer(interviewId: string, payload: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
  return fetchJson<SubmitAnswerResponse>(apiUrl(`/api/interviews/${encodeURIComponent(interviewId)}/answer`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
