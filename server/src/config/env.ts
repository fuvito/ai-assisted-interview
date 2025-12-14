export type SupabaseEnv = {
  url: string;
  key: string;
};

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) return null;

  return { url, key };
}
