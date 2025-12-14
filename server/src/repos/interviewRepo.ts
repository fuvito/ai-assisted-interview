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
    .insert({ subject_id: subjectId, total_questions: totalQuestions, current_index: 0, status: "active" })
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

  const { error } = await supabase
    .from("interviews")
    .update({ current_index: params.currentIndex, status: params.status })
    .eq("id", params.interviewId);

  if (error) throw httpError(500, error.message);
}
