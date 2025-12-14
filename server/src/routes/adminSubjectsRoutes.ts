import { Router } from "express";

import { isHttpError } from "../utils/httpError.js";
import {
  createAdminSubject,
  deleteAdminSubject,
  getAdminSubjects,
  parseCreateSubjectRequest,
  parseUpdateSubjectRequest,
  updateAdminSubject,
} from "../services/adminSubjectsService.js";

export const adminSubjectsRouter = Router();

adminSubjectsRouter.get("/subjects", async (_req, res) => {
  try {
    const subjects = await getAdminSubjects();
    return res.json({ subjects });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

adminSubjectsRouter.post("/subjects", async (req, res) => {
  try {
    const payload = parseCreateSubjectRequest(req.body);
    const created = await createAdminSubject(payload);
    return res.json({ subject: created });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

adminSubjectsRouter.put("/subjects/:id", async (req, res) => {
  try {
    const id = String(req.params.id ?? "");
    const payload = parseUpdateSubjectRequest(req.body);
    const updated = await updateAdminSubject({ id, ...payload });
    return res.json({ subject: updated });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});

adminSubjectsRouter.delete("/subjects/:id", async (req, res) => {
  try {
    const id = String(req.params.id ?? "");
    await deleteAdminSubject(id);
    return res.json({ ok: true });
  } catch (error) {
    if (isHttpError(error)) return res.status(error.status).json({ error: error.message });
    return res.status(500).json({ error: "Unexpected error" });
  }
});
