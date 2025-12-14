import type { SubjectId } from "@app/shared";

import { getSupabaseClient } from "../config/supabaseClient.js";
import { httpError } from "../utils/httpError.js";

type InterviewRow = {
  id: string;
  subject_id: string;
  total_questions: number;
  current_index: number;
  status: string;
};

type InterviewQuestionRow = {
  interview_id: string;
  position: number;
  question_id: string;
};

type InterviewAnswerRow = {
  interview_id: string;
  question_id: string;
  answer_text: string;
  score: number;
  feedback: string;
  created_at: string;
};

export type Interview = {
  id: string;
  subjectId: SubjectId;
  totalQuestions: number;
  currentIndex: number;
  status: "active" | "completed";
};

export async function createInterview(subjectId: SubjectId, totalQuestions: number): Promise<Interview> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("interviews")
    .insert({ subject_id: subjectId, total_questions: totalQuestions, current_index: 0, status: "in_progress" })
    .select("id,subject_id,total_questions,current_index,status")
    .single();

  if (error) throw httpError(500, error.message);

  const row = data as InterviewRow;
  return {
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    totalQuestions: row.total_questions,
    currentIndex: row.current_index,
    status: row.status === "completed" ? "completed" : "active",
  };
}

export async function setInterviewQuestions(interviewId: string, questionIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { error: deleteError } = await supabase
    .from("interview_questions")
    .delete()
    .eq("interview_id", interviewId);

  if (deleteError) throw httpError(500, deleteError.message);

  const rows = questionIds.map((questionId, idx) => ({
    interview_id: interviewId,
    position: idx,
    question_id: questionId,
  }));

  const { error } = await supabase.from("interview_questions").insert(rows);
  if (error) throw httpError(500, error.message);
}

export async function reserveDailyQuestions(params: {
  userId: string;
  count: number;
  limit: number;
}): Promise<{ allowed: boolean; used: number; remaining: number; quotaLimit: number }> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase.rpc("reserve_daily_questions", {
    p_user_id: params.userId,
    p_count: params.count,
    p_limit: params.limit,
  });

  if (error) throw httpError(500, error.message);

  const row = (Array.isArray(data) ? data[0] : data) as
    | { allowed?: unknown; used?: unknown; remaining?: unknown; quota_limit?: unknown }
    | null
    | undefined;

  if (!row) throw httpError(500, "Failed to reserve daily quota");

  return {
    allowed: Boolean(row.allowed),
    used: Number(row.used ?? 0),
    remaining: Number(row.remaining ?? 0),
    quotaLimit: Number(row.quota_limit ?? params.limit),
  };
}

export async function listInterviewQuestionIds(interviewId: string): Promise<Array<{ position: number; questionId: string }>> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("interview_questions")
    .select("interview_id,position,question_id")
    .eq("interview_id", interviewId)
    .order("position", { ascending: true });

  if (error) throw httpError(500, error.message);

  return ((data as InterviewQuestionRow[] | null | undefined) ?? []).map((row) => ({
    position: row.position,
    questionId: row.question_id,
  }));
}

export async function listInterviewAnswers(interviewId: string): Promise<
  Array<{ questionId: string; answerText: string; score: number; feedback: string }>
> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("interview_answers")
    .select("interview_id,question_id,answer_text,score,feedback,created_at")
    .eq("interview_id", interviewId)
    .order("created_at", { ascending: true });

  if (error) throw httpError(500, error.message);

  return ((data as InterviewAnswerRow[] | null | undefined) ?? []).map((row) => ({
    questionId: row.question_id,
    answerText: row.answer_text,
    score: row.score,
    feedback: row.feedback,
  }));
}

export async function getInterview(interviewId: string): Promise<Interview> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("interviews")
    .select("id,subject_id,total_questions,current_index,status")
    .eq("id", interviewId)
    .limit(1)
    .maybeSingle();

  if (error) throw httpError(500, error.message);
  if (!data) throw httpError(404, "Interview not found");

  const row = data as InterviewRow;
  return {
    id: row.id,
    subjectId: row.subject_id as SubjectId,
    totalQuestions: row.total_questions,
    currentIndex: row.current_index,
    status: row.status === "completed" ? "completed" : "active",
  };
}

export async function getInterviewQuestionIdAt(interviewId: string, position: number): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("interview_questions")
    .select("interview_id,position,question_id")
    .eq("interview_id", interviewId)
    .eq("position", position)
    .limit(1)
    .maybeSingle();

  if (error) throw httpError(500, error.message);
  if (!data) throw httpError(404, "Interview question not found");

  const row = data as InterviewQuestionRow;
  return row.question_id;
}

export async function saveInterviewAnswer(params: {
  interviewId: string;
  questionId: string;
  answerText: string;
  score: number;
  feedback: string;
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { error } = await supabase.from("interview_answers").insert({
    interview_id: params.interviewId,
    question_id: params.questionId,
    answer_text: params.answerText,
    score: params.score,
    feedback: params.feedback,
  });

  if (error) throw httpError(500, error.message);
}

export async function updateInterviewProgress(params: {
  interviewId: string;
  currentIndex: number;
  status: "active" | "completed";
}): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const dbStatus = params.status === "active" ? "in_progress" : "completed";

  const { error } = await supabase
    .from("interviews")
    .update({ current_index: params.currentIndex, status: dbStatus })
    .eq("id", params.interviewId);

  if (error) throw httpError(500, error.message);
}
