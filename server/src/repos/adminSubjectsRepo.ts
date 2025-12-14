import type { Subject, SubjectId } from "@app/shared";

import { getSupabaseClient } from "../config/supabaseClient.js";
import { httpError } from "../utils/httpError.js";

type SubjectRow = {
  id: string;
  name: string;
};

export async function adminListSubjects(): Promise<Subject[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase.from("subjects").select("id,name").order("name", { ascending: true });
  if (error) throw httpError(500, error.message);

  return ((data as SubjectRow[] | null | undefined) ?? []).map((row) => ({
    id: row.id as SubjectId,
    name: row.name,
  }));
}

export async function adminCreateSubject(params: { id: SubjectId; name: string }): Promise<Subject> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("subjects")
    .insert({ id: params.id, name: params.name })
    .select("id,name")
    .single();

  if (error) throw httpError(500, error.message);

  const row = data as SubjectRow;
  return { id: row.id as SubjectId, name: row.name };
}

export async function adminUpdateSubject(params: { id: SubjectId; name: string }): Promise<Subject> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { data, error } = await supabase
    .from("subjects")
    .update({ name: params.name })
    .eq("id", params.id)
    .select("id,name")
    .single();

  if (error) throw httpError(500, error.message);

  const row = data as SubjectRow;
  return { id: row.id as SubjectId, name: row.name };
}

export async function adminDeleteSubject(id: SubjectId): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) throw httpError(500, "Missing SUPABASE_URL and SUPABASE_KEY");

  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw httpError(500, error.message);
}
