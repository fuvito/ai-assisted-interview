import type { Question, Subject, SubjectId } from "@app/shared";

import { listQuestionsBySubject, listSubjects } from "../repos/contentRepo.js";
import { httpError } from "../utils/httpError.js";

export async function getSubjects(): Promise<Subject[]> {
  return listSubjects();
}

export function parseSubjectId(raw: unknown): SubjectId {
  const subject = String(raw ?? "").trim();
  if (!subject) throw httpError(400, "subjectId is required");
  return subject;
}

export async function getQuestions(subjectId: SubjectId): Promise<Question[]> {
  return listQuestionsBySubject(subjectId);
}
