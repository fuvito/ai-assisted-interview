import { Router } from "express";

import { getQuestions, getSubjects, parseSubjectId } from "../services/contentService.js";
import { isHttpError } from "../utils/httpError.js";

export const contentRouter = Router();

contentRouter.get("/subjects", async (_req, res) => {
  try {
    const subjects = await getSubjects();
    return res.json({ subjects });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

contentRouter.get("/questions", async (req, res) => {
  try {
    const subjectId = parseSubjectId(req.query.subject);
    const questions = await getQuestions(subjectId);
    return res.json({ questions });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});
