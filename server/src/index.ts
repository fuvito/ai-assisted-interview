import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";

import { adminQuestionsRouter } from "./routes/adminQuestionsRoutes.js";
import { adminSubjectsRouter } from "./routes/adminSubjectsRoutes.js";
import { contentRouter } from "./routes/contentRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { interviewRouter } from "./routes/interviewRoutes.js";
import { requireAdmin } from "./middleware/requireAdmin.js";
import { requireAuth } from "./middleware/requireAuth.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const app = express();

app.use(
  cors({
    origin: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());

app.use(healthRouter);
app.use("/api/admin", requireAdmin, adminQuestionsRouter);
app.use("/api/admin", requireAdmin, adminSubjectsRouter);
app.use("/api", requireAuth, contentRouter);
app.use("/api/interviews", requireAuth, interviewRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
