import type { Question, Subject, SubjectId } from "@app/shared";

import { getSupabaseClient } from "../config/supabaseClient.js";
import { httpError } from "../utils/httpError.js";

type SubjectRow = {
  id: string;
  name: string;
};

type QuestionRow = {
  id: string;
  subject_id: string;
  question_text: string;
  expert_answer: string;
};

export async function listSubjects(allowedIds?: SubjectId[]): Promise<Subject[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw httpError(
      500,
      "Missing SUPABASE_URL and SUPABASE_KEY"
    );
  }

  const base = supabase.from("subjects").select("id,name").order("name", { ascending: true });
  const query = allowedIds && allowedIds.length > 0 ? base.in("id", allowedIds) : base;
  const { data, error } = await query;

  if (error) throw httpError(500, error.message);

  return (data as SubjectRow[] | null | undefined ?? []).map((row) => ({
    id: row.id as SubjectId,
    name: row.name,
  }));
}

export async function listQuestionsBySubject(subjectId: SubjectId): Promise<Question[]> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw httpError(
      500,
      "Missing SUPABASE_URL and SUPABASE_KEY"
    );
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id,subject_id,question_text,expert_answer")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: true });

  if (error) throw httpError(500, error.message);

  return (data as QuestionRow[] | null | undefined ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    questionText: row.question_text,
    expertAnswer: row.expert_answer,
  }));
}

export async function getQuestionById(questionId: string): Promise<Question> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");
  }

  const { data, error } = await supabase
    .from("questions")
    .select("id,subject_id,question_text,expert_answer")
    .eq("id", questionId)
    .limit(1)
    .maybeSingle();

  if (error) throw httpError(500, error.message);
  if (!data) throw httpError(404, "Question not found");

  const row = data as QuestionRow;
  return {
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    questionText: row.question_text,
    expertAnswer: row.expert_answer,
  };
}
