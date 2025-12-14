import { Router } from "express";

import { isHttpError } from "../utils/httpError.js";
import {
  parseStartInterviewRequest,
  parseSubmitAnswerRequest,
  startInterview,
  submitAnswer,
} from "../services/interviewService.js";

export const interviewRouter = Router();

interviewRouter.post("/start", async (req, res) => {
  try {
    const payload = parseStartInterviewRequest(req.body);
    const result = await startInterview(payload);
    return res.json(result);
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

interviewRouter.post("/:interviewId/answer", async (req, res) => {
  try {
    const interviewId = String(req.params.interviewId ?? "").trim();
    if (!interviewId) return res.status(400).json({ error: "interviewId is required" });

    const payload = parseSubmitAnswerRequest(req.body);
    const result = await submitAnswer(interviewId, payload);
    return res.json(result);
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});
