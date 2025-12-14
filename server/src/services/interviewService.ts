import type {
  PublicQuestion,
  StartInterviewRequest,
  StartInterviewResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  SubjectId,
} from "@app/shared";

import { getQuestionById, listQuestionsBySubject } from "../repos/contentRepo.js";
import {
  createInterview,
  getInterview,
  getInterviewQuestionIdAt,
  reserveDailyQuestions,
  saveInterviewAnswer,
  setInterviewQuestions,
  updateInterviewProgress,
} from "../repos/interviewRepo.js";
import { httpError } from "../utils/httpError.js";
import { parseSubjectId } from "./contentService.js";
import { evaluateAnswer } from "./evaluationService.js";

function toPublicQuestion(params: { id: string; subjectId: SubjectId; questionText: string }): PublicQuestion {
  return {
    id: params.id,
    subjectId: params.subjectId,
    questionText: params.questionText,
  };
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
}

export function parseStartInterviewRequest(raw: unknown): StartInterviewRequest {
  if (!raw || typeof raw !== "object") {
    throw httpError(400, "Invalid request body");
  }

  const body = raw as { subjectId?: unknown; questionCount?: unknown };
  const subjectId = parseSubjectId(body.subjectId);

  let questionCount: number | undefined;
  if (body.questionCount !== undefined) {
    const n = Number(body.questionCount);
    if (!Number.isFinite(n) || n <= 0) {
      throw httpError(400, "questionCount must be a positive number");
    }
    questionCount = Math.floor(n);
  }

  if (questionCount === undefined) {
    return { subjectId };
  }

  return { subjectId, questionCount };
}

function getDailyQuestionLimit(): number {
  const raw = process.env.DAILY_QUESTION_LIMIT;
  const parsed = raw ? Number(raw) : 20;
  if (!Number.isFinite(parsed) || parsed <= 0) return 20;
  return Math.floor(parsed);
}

export async function startInterview(params: { req: StartInterviewRequest; userId: string }): Promise<StartInterviewResponse> {
  const limit = getDailyQuestionLimit();

  const allQuestions = await listQuestionsBySubject(params.req.subjectId);
  if (allQuestions.length === 0) {
    throw httpError(400, "No questions available for this subject");
  }

  const desiredCount = params.req.questionCount ?? 5;
  const count = Math.max(1, Math.min(desiredCount, allQuestions.length));

  const quota = await reserveDailyQuestions({ userId: params.userId, count, limit });
  if (!quota.allowed) {
    throw httpError(
      429,
      `Daily question limit reached. Remaining today: ${quota.remaining} of ${quota.quotaLimit}.`,
    );
  }

  const pool = [...allQuestions];
  shuffleInPlace(pool);
  const selected = pool.slice(0, count);

  const interview = await createInterview(params.req.subjectId, count);
  await setInterviewQuestions(
    interview.id,
    selected.map((q) => q.id)
  );

  const first = selected[0];
  if (!first) {
    throw httpError(500, "Failed to select the first interview question");
  }
  return {
    interviewId: interview.id,
    question: toPublicQuestion(first),
    questionIndex: 1,
    totalQuestions: count,
  };
}

export function parseSubmitAnswerRequest(raw: unknown): SubmitAnswerRequest {
  if (!raw || typeof raw !== "object") {
    throw httpError(400, "Invalid request body");
  }

  const body = raw as { questionId?: unknown; answerText?: unknown };
  const questionId = String(body.questionId ?? "").trim();
  const answerText = String(body.answerText ?? "").trim();

  if (!questionId) throw httpError(400, "questionId is required");
  if (!answerText) throw httpError(400, "answerText is required");

  return { questionId, answerText };
}

export async function submitAnswer(interviewId: string, req: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
  const interview = await getInterview(interviewId);
  if (interview.status !== "active") {
    throw httpError(400, "Interview is not active");
  }

  const expectedQuestionId = await getInterviewQuestionIdAt(interview.id, interview.currentIndex);
  if (expectedQuestionId !== req.questionId) {
    throw httpError(400, "questionId does not match the current interview question");
  }

  const question = await getQuestionById(expectedQuestionId);
  const evaluation = await evaluateAnswer(req.answerText, question.expertAnswer, question.questionText);

  const review = {
    question: toPublicQuestion(question),
    userAnswer: req.answerText,
    referenceAnswer: question.expertAnswer,
    evaluation,
  };

  await saveInterviewAnswer({
    interviewId: interview.id,
    questionId: question.id,
    answerText: req.answerText,
    score: evaluation.score,
    feedback: evaluation.feedback,
  });

  const nextIndex = interview.currentIndex + 1;
  const done = nextIndex >= interview.totalQuestions;

  await updateInterviewProgress({
    interviewId: interview.id,
    currentIndex: nextIndex,
    status: done ? "completed" : "active",
  });

  if (done) {
    return {
      evaluation,
      review,
      done: true,
      questionIndex: interview.totalQuestions,
      totalQuestions: interview.totalQuestions,
    };
  }

  const nextQuestionId = await getInterviewQuestionIdAt(interview.id, nextIndex);
  const nextQuestion = await getQuestionById(nextQuestionId);

  return {
    evaluation,
    review,
    done: false,
    nextQuestion: toPublicQuestion(nextQuestion),
    questionIndex: nextIndex + 1,
    totalQuestions: interview.totalQuestions,
  };
}
