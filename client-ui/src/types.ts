import type { AnswerReview, PublicQuestion } from '@app/shared'

export type LoadState = 'idle' | 'loading' | 'success' | 'error'

export type InterviewState = {
  interviewId: string
  question: PublicQuestion
  questionIndex: number
  totalQuestions: number
}

export type ReportCardItem = {
  questionIndex: number
  totalQuestions: number
  review: AnswerReview
}
