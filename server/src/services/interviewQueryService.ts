import type { AnswerReview, GetInterviewResponse, InterviewReportItem, PublicQuestion, SubjectId } from "@app/shared";

import { getQuestionById } from "../repos/contentRepo.js";
import { getInterview, listInterviewAnswers, listInterviewQuestionIds } from "../repos/interviewRepo.js";
import { httpError } from "../utils/httpError.js";

function toPublicQuestion(params: { id: string; subjectId: SubjectId; questionText: string }): PublicQuestion {
  return {
    id: params.id,
    subjectId: params.subjectId,
    questionText: params.questionText,
  };
}

export async function getInterviewById(interviewId: string): Promise<GetInterviewResponse> {
  const id = interviewId.trim();
  if (!id) throw httpError(400, "interviewId is required");

  const interview = await getInterview(id);
  const questionIds = await listInterviewQuestionIds(id);
  const answers = await listInterviewAnswers(id);

  const answersByQuestionId = new Map(answers.map((a) => [a.questionId, a] as const));

  const reportCard: InterviewReportItem[] = [];

  for (const { position, questionId } of questionIds) {
    const answer = answersByQuestionId.get(questionId);
    if (!answer) continue;

    const q = await getQuestionById(questionId);

    const review: AnswerReview = {
      question: toPublicQuestion(q),
      userAnswer: answer.answerText,
      referenceAnswer: q.expertAnswer,
      evaluation: {
        score: answer.score,
        feedback: answer.feedback,
      },
    };

    reportCard.push({
      questionIndex: position + 1,
      totalQuestions: interview.totalQuestions,
      review,
    });
  }

  const status = interview.status === "completed" ? "completed" : "in_progress";

  let currentQuestion: PublicQuestion | undefined;
  if (status === "in_progress") {
    const pos = Math.max(0, Math.min(interview.currentIndex, Math.max(0, questionIds.length - 1)));
    const current = questionIds.find((x) => x.position === pos);
    if (current) {
      const q = await getQuestionById(current.questionId);
      currentQuestion = toPublicQuestion(q);
    }
  }

  return {
    interviewId: interview.id,
    subjectId: interview.subjectId,
    status,
    questionIndex: Math.min(interview.currentIndex + 1, interview.totalQuestions),
    totalQuestions: interview.totalQuestions,
    ...(currentQuestion ? { currentQuestion } : {}),
    reportCard,
  };
}
