export type CandidateProfile = {
  id: string;
  name: string;
};

export type SubjectId = string;

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

export type InterviewStatus = "in_progress" | "completed";

export type InterviewReportItem = {
  questionIndex: number;
  totalQuestions: number;
  review: AnswerReview;
};

export type GetInterviewResponse = {
  interviewId: string;
  subjectId: SubjectId;
  status: InterviewStatus;
  questionIndex: number;
  totalQuestions: number;
  currentQuestion?: PublicQuestion;
  reportCard: InterviewReportItem[];
};
