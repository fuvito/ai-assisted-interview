import cors from "cors";
import express from "express";
import type { CandidateProfile } from "@app/shared";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/example", (_req, res) => {
  const candidate: CandidateProfile = { id: "1", name: "Ada" };
  res.json(candidate);
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
