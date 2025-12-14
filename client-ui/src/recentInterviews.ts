import type { SubjectId } from '@app/shared'

export type RecentInterview = {
  interviewId: string
  subjectId: SubjectId
  status: 'in_progress' | 'completed'
  updatedAt: number
}

const KEY = 'recentInterviewsV1'
const MAX_ITEMS = 8

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readRaw(): RecentInterview[] {
  if (!hasStorage()) return []
  const raw = window.localStorage.getItem(KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    const items: RecentInterview[] = []
    for (const x of parsed) {
      if (!x || typeof x !== 'object') continue
      const obj = x as Partial<Record<keyof RecentInterview, unknown>>
      const interviewId = String(obj.interviewId ?? '').trim()
      const subjectId = String(obj.subjectId ?? '').trim()
      const status = obj.status === 'completed' ? 'completed' : 'in_progress'
      const updatedAtNum = Number(obj.updatedAt)
      if (!interviewId || !subjectId) continue
      items.push({
        interviewId,
        subjectId: subjectId as SubjectId,
        status,
        updatedAt: Number.isFinite(updatedAtNum) ? updatedAtNum : Date.now(),
      })
    }

    return items
  } catch {
    return []
  }
}

function writeRaw(items: RecentInterview[]): void {
  if (!hasStorage()) return
  window.localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)))
}

export function getRecentInterviews(): RecentInterview[] {
  return readRaw().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_ITEMS)
}

export function upsertRecentInterview(input: {
  interviewId: string
  subjectId: SubjectId
  status: 'in_progress' | 'completed'
  updatedAt?: number
}): void {
  const interviewId = input.interviewId.trim()
  const subjectId = String(input.subjectId).trim() as SubjectId
  if (!interviewId || !subjectId) return

  const now = input.updatedAt ?? Date.now()

  const items = readRaw()
  const existingIdx = items.findIndex((x) => x.interviewId === interviewId)

  const next: RecentInterview = {
    interviewId,
    subjectId,
    status: input.status,
    updatedAt: now,
  }

  if (existingIdx >= 0) {
    const prev = items[existingIdx]!
    items.splice(existingIdx, 1)
    items.unshift({
      ...prev,
      ...next,
      status: prev.status === 'completed' ? 'completed' : next.status,
    })
  } else {
    items.unshift(next)
  }

  writeRaw(items)
}

export function removeRecentInterview(interviewId: string): void {
  const id = interviewId.trim()
  if (!id) return
  const items = readRaw().filter((x) => x.interviewId !== id)
  writeRaw(items)
}
