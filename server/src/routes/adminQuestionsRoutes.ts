import { Router } from "express";

import { isHttpError } from "../utils/httpError.js";
import {
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuestions,
  parseCreateQuestionRequest,
  parseUpdateQuestionRequest,
  updateAdminQuestion,
} from "../services/adminQuestionsService.js";

export const adminQuestionsRouter = Router();

adminQuestionsRouter.get("/questions", async (req, res) => {
  try {
    const questions = await getAdminQuestions(req.query.subject);
    return res.json({ questions });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

adminQuestionsRouter.post("/questions", async (req, res) => {
  try {
    const payload = parseCreateQuestionRequest(req.body);
    const created = await createAdminQuestion(payload);
    return res.json({ question: created });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

adminQuestionsRouter.put("/questions/:id", async (req, res) => {
  try {
    const id = String(req.params.id ?? "");
    const payload = parseUpdateQuestionRequest(req.body);
    const updated = await updateAdminQuestion({ id, ...payload });
    return res.json({ question: updated });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

adminQuestionsRouter.delete("/questions/:id", async (req, res) => {
  try {
    const id = String(req.params.id ?? "");
    await deleteAdminQuestion(id);
    return res.json({ ok: true });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});
