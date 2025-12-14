import type { Question, Subject, SubjectId } from "@app/shared";

import { listQuestionsBySubject, listSubjects } from "../repos/contentRepo.js";
import { httpError } from "../utils/httpError.js";

export const supportedSubjectIds: SubjectId[] = ["java", "typescript"];

export async function getSubjects(): Promise<Subject[]> {
  return listSubjects(supportedSubjectIds);
}

export function parseSubjectId(raw: unknown): SubjectId {
  const subject = String(raw ?? "");
  if (!supportedSubjectIds.includes(subject as SubjectId)) {
    throw httpError(400, "Invalid subject. Expected 'java' or 'typescript'.");
  }
  return subject as SubjectId;
}

export async function getQuestions(subjectId: SubjectId): Promise<Question[]> {
  return listQuestionsBySubject(subjectId);
}
