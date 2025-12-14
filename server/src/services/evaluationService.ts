import type { EvaluationResult } from "@app/shared";

import { GoogleGenerativeAI } from "@google/generative-ai";

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

function evaluateAnswerHeuristic(userAnswer: string, expertAnswer: string): EvaluationResult {
  const userTokens = normalize(userAnswer);
  const expertTokens = normalize(expertAnswer);

  if (expertTokens.length === 0) {
    return {
      score: 0,
      feedback: "No expert answer was available to evaluate this response.",
    };
  }

  const userSet = new Set(userTokens);
  let overlap = 0;
  for (const t of expertTokens) {
    if (userSet.has(t)) overlap += 1;
  }

  const ratio = overlap / expertTokens.length;
  const score = Math.max(0, Math.min(10, Math.round(ratio * 10)));

  let feedback = "";
  if (score >= 8) {
    feedback = "Strong answer. You covered most of the key points from the expected solution.";
  } else if (score >= 5) {
    feedback = "Decent answer. You mentioned some key points, but a few important details were missing.";
  } else {
    feedback = "Needs improvement. Your answer missed many of the key points. Try to be more specific and cover core concepts.";
  }

  return { score, feedback };
}

function parseGeminiJson(raw: string): EvaluationResult | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) return null;

  const candidate = raw.slice(start, end + 1);
  try {
    const parsed = JSON.parse(candidate) as {
      score?: unknown;
      feedback?: unknown;
      strengths?: unknown;
      keyPointsExpected?: unknown;
      keyPointsCovered?: unknown;
      keyPointsMissing?: unknown;
      key_points_expected?: unknown;
      key_points_covered?: unknown;
      missing_key_points?: unknown;
    };
    const scoreNum = Number(parsed.score);
    const feedback = typeof parsed.feedback === "string" ? parsed.feedback.trim() : "";
    if (!Number.isFinite(scoreNum)) return null;
    if (!feedback) return null;

    const normalized = scoreNum > 10 && scoreNum <= 100 ? scoreNum / 10 : scoreNum;
    const score = Math.max(0, Math.min(10, Math.round(normalized)));

    const toStringArray = (v: unknown): string[] | undefined => {
      if (!Array.isArray(v)) return undefined;
      const items = v
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter((x) => x.length > 0);
      return items.length ? items : undefined;
    };

    const strengths = toStringArray(parsed.strengths);
    const keyPointsExpected = toStringArray(parsed.keyPointsExpected ?? parsed.key_points_expected);
    const keyPointsCovered = toStringArray(parsed.keyPointsCovered ?? parsed.key_points_covered);
    const keyPointsMissing = toStringArray(parsed.keyPointsMissing ?? parsed.missing_key_points);

    return {
      score,
      feedback,
      ...(strengths ? { strengths } : {}),
      ...(keyPointsExpected ? { keyPointsExpected } : {}),
      ...(keyPointsCovered ? { keyPointsCovered } : {}),
      ...(keyPointsMissing ? { keyPointsMissing } : {}),
    };
  } catch {
    return null;
  }
}

export async function evaluateAnswer(
  userAnswer: string,
  expertAnswer: string,
  questionText?: string
): Promise<EvaluationResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return evaluateAnswerHeuristic(userAnswer, expertAnswer);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = [
      "You are grading a technical interview response.",
      "Grade based on semantic correctness and key concept coverage, not exact wording.",
      "The candidate may use synonyms/paraphrasing; if meaning is equivalent, give full credit.",
      "Do not punish concise answers if they are correct.",
      "Use partial credit when some key concepts are correct but others are missing.",
      "Return ONLY valid JSON.",
      "Required JSON fields: score (integer 0-10) and feedback (string).",
      "Also include these arrays when possible:",
      "- strengths: string[] (what the candidate did well)",
      "- keyPointsExpected: string[] (key concepts from the expert answer)",
      "- keyPointsCovered: string[] (which concepts the candidate covered, allow paraphrases)",
      "- keyPointsMissing: string[] (important missing or incorrect concepts)",
      "",
      questionText ? `Question: ${questionText}` : "",
      `Expert answer: ${expertAnswer}`,
      `Candidate answer: ${userAnswer}`,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 512,
        responseMimeType: "application/json" as unknown as never,
      },
    } as unknown as Parameters<typeof model.generateContent>[0]);
    const text = result.response.text();

    const parsed = parseGeminiJson(text);
    if (parsed) return parsed;

    return evaluateAnswerHeuristic(userAnswer, expertAnswer);
  } catch {
    return evaluateAnswerHeuristic(userAnswer, expertAnswer);
  }
}
