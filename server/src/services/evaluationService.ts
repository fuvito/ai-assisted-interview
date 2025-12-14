import type { EvaluationResult } from "@app/shared";

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

export function evaluateAnswer(userAnswer: string, expertAnswer: string): EvaluationResult {
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
