export type CandidateProfile = {
  id: string;
  name: string;
};

export type SubjectId = "java" | "typescript";

export type Subject = {
  id: SubjectId;
  name: string;
};

export type Question = {
  id: string;
  subjectId: SubjectId;
  questionText: string;
  expertAnswer: string;
};

export type PublicQuestion = {
  id: string;
  subjectId: SubjectId;
  questionText: string;
};

export type EvaluationResult = {
  score: number;
  feedback: string;
  strengths?: string[];
  keyPointsExpected?: string[];
  keyPointsCovered?: string[];
  keyPointsMissing?: string[];
};

export type StartInterviewRequest = {
  subjectId: SubjectId;
  questionCount?: number;
};

export type StartInterviewResponse = {
  interviewId: string;
  question: PublicQuestion;
  questionIndex: number;
  totalQuestions: number;
};

export type SubmitAnswerRequest = {
  questionId: string;
  answerText: string;
};

export type AnswerReview = {
  question: PublicQuestion;
  userAnswer: string;
  referenceAnswer: string;
  evaluation: EvaluationResult;
};

export type SubmitAnswerResponse = {
  evaluation: EvaluationResult;
  review: AnswerReview;
  done: boolean;
  nextQuestion?: PublicQuestion;
  questionIndex: number;
  totalQuestions: number;
};
