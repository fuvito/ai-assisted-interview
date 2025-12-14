import type { NextFunction, Request, Response } from "express";

import { getSupabaseClient } from "../config/supabaseClient.js";

function getBearerToken(req: Request): string | null {
  const header = req.header("authorization") || req.header("Authorization");
  if (!header) return null;

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return res.status(500).json({ error: "Missing SUPABASE_URL and SUPABASE_KEY" });

    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ error: "Missing Authorization Bearer token" });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return res.status(401).json({ error: "Invalid or expired token" });

    ;(req as unknown as { userId?: string }).userId = userData.user.id;

    return next();
  } catch {
    return res.status(500).json({ error: "Unexpected error" });
  }
}
