import type { Question, SubjectId } from "@app/shared";

import {
  adminCreateQuestion,
  adminDeleteQuestion,
  adminListQuestions,
  adminUpdateQuestion,
} from "../repos/adminQuestionsRepo.js";
import { httpError } from "../utils/httpError.js";
import { parseSubjectId } from "./contentService.js";

export async function getAdminQuestions(rawSubject: unknown): Promise<Question[]> {
  const subjectId = parseSubjectId(rawSubject);
  return adminListQuestions(subjectId);
}

export function parseCreateQuestionRequest(raw: unknown): {
  subjectId: SubjectId;
  questionText: string;
  expertAnswer: string;
} {
  if (!raw || typeof raw !== "object") throw httpError(400, "Invalid request body");

  const body = raw as { subjectId?: unknown; questionText?: unknown; expertAnswer?: unknown };

  const subjectId = parseSubjectId(body.subjectId);
  const questionText = String(body.questionText ?? "").trim();
  const expertAnswer = String(body.expertAnswer ?? "").trim();

  if (!questionText) throw httpError(400, "questionText is required");
  if (!expertAnswer) throw httpError(400, "expertAnswer is required");

  return { subjectId, questionText, expertAnswer };
}

export async function createAdminQuestion(input: {
  subjectId: SubjectId;
  questionText: string;
  expertAnswer: string;
}): Promise<Question> {
  return adminCreateQuestion(input);
}

export function parseUpdateQuestionRequest(raw: unknown): {
  questionText?: string;
  expertAnswer?: string;
} {
  if (!raw || typeof raw !== "object") throw httpError(400, "Invalid request body");

  const body = raw as { questionText?: unknown; expertAnswer?: unknown };

  const questionText = body.questionText !== undefined ? String(body.questionText).trim() : undefined;
  const expertAnswer = body.expertAnswer !== undefined ? String(body.expertAnswer).trim() : undefined;

  if (questionText !== undefined && !questionText) throw httpError(400, "questionText cannot be empty");
  if (expertAnswer !== undefined && !expertAnswer) throw httpError(400, "expertAnswer cannot be empty");

  if (questionText === undefined && expertAnswer === undefined) {
    throw httpError(400, "At least one of questionText or expertAnswer must be provided");
  }

  return {
    ...(questionText !== undefined ? { questionText } : {}),
    ...(expertAnswer !== undefined ? { expertAnswer } : {}),
  };
}

export async function updateAdminQuestion(params: {
  id: string;
  questionText?: string;
  expertAnswer?: string;
}): Promise<Question> {
  const id = params.id.trim();
  if (!id) throw httpError(400, "id is required");

  const payload: { id: string; questionText?: string; expertAnswer?: string } = { id };
  if (params.questionText !== undefined) payload.questionText = params.questionText;
  if (params.expertAnswer !== undefined) payload.expertAnswer = params.expertAnswer;

  return adminUpdateQuestion(payload);
}

export async function deleteAdminQuestion(id: string): Promise<void> {
  const normalized = id.trim();
  if (!normalized) throw httpError(400, "id is required");

  return adminDeleteQuestion(normalized);
}
