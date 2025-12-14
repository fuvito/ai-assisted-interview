import type { Question, SubjectId } from "@app/shared";

import { getSupabaseClient } from "../config/supabaseClient.js";
import { httpError } from "../utils/httpError.js";

type QuestionRow = {
  id: string;
  subject_id: string;
  question_text: string;
  expert_answer: string;
};

export async function adminListQuestions(subjectId: SubjectId): Promise<Question[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("questions")
    .select("id,subject_id,question_text,expert_answer")
    .eq("subject_id", subjectId)
    .order("created_at", { ascending: true });

  if (error) throw httpError(500, error.message);

  return ((data as QuestionRow[] | null | undefined) ?? []).map((row) => ({
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    questionText: row.question_text,
    expertAnswer: row.expert_answer,
  }));
}

export async function adminCreateQuestion(params: {
  subjectId: SubjectId;
  questionText: string;
  expertAnswer: string;
}): Promise<Question> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("questions")
    .insert({
      subject_id: params.subjectId,
      question_text: params.questionText,
      expert_answer: params.expertAnswer,
    })
    .select("id,subject_id,question_text,expert_answer")
    .single();

  if (error) throw httpError(500, error.message);

  const row = data as QuestionRow;
  return {
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    questionText: row.question_text,
    expertAnswer: row.expert_answer,
  };
}

export async function adminUpdateQuestion(params: {
  id: string;
  questionText?: string;
  expertAnswer?: string;
}): Promise<Question> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const update: Record<string, unknown> = {};
  if (params.questionText !== undefined) update.question_text = params.questionText;
  if (params.expertAnswer !== undefined) update.expert_answer = params.expertAnswer;

  const { data, error } = await supabase
    .from("questions")
    .update(update)
    .eq("id", params.id)
    .select("id,subject_id,question_text,expert_answer")
    .single();

  if (error) throw httpError(500, error.message);

  const row = data as QuestionRow;
  return {
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    questionText: row.question_text,
    expertAnswer: row.expert_answer,
  };
}

export async function adminDeleteQuestion(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw httpError(500, error.message);
}
