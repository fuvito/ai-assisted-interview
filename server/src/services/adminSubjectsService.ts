import type { Subject, SubjectId } from "@app/shared";

import {
  adminCreateSubject,
  adminDeleteSubject,
  adminListSubjects,
  adminUpdateSubject,
} from "../repos/adminSubjectsRepo.js";
import { httpError } from "../utils/httpError.js";

export async function getAdminSubjects(): Promise<Subject[]> {
  return adminListSubjects();
}

export function parseCreateSubjectRequest(raw: unknown): { id: SubjectId; name: string } {
  if (!raw || typeof raw !== "object") throw httpError(400, "Invalid request body");

  const body = raw as { id?: unknown; name?: unknown };

  const id = String(body.id ?? "").trim();
  const name = String(body.name ?? "").trim();

  if (!id) throw httpError(400, "id is required");
  if (!name) throw httpError(400, "name is required");

  return { id, name };
}

export async function createAdminSubject(input: { id: SubjectId; name: string }): Promise<Subject> {
  return adminCreateSubject(input);
}

export function parseUpdateSubjectRequest(raw: unknown): { name: string } {
  if (!raw || typeof raw !== "object") throw httpError(400, "Invalid request body");

  const body = raw as { name?: unknown };
  const name = String(body.name ?? "").trim();
  if (!name) throw httpError(400, "name is required");

  return { name };
}

export async function updateAdminSubject(params: { id: string; name: string }): Promise<Subject> {
  const id = params.id.trim();
  if (!id) throw httpError(400, "id is required");

  return adminUpdateSubject({ id, name: params.name });
}

export async function deleteAdminSubject(id: string): Promise<void> {
  const normalized = id.trim();
  if (!normalized) throw httpError(400, "id is required");

  return adminDeleteSubject(normalized);
}
