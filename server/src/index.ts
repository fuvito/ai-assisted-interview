import "dotenv/config";
import cors from "cors";
import express from "express";

import { adminQuestionsRouter } from "./routes/adminQuestionsRoutes.js";
import { contentRouter } from "./routes/contentRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";
import { interviewRouter } from "./routes/interviewRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use("/api", contentRouter);
app.use("/api/interviews", interviewRouter);
app.use("/api/admin", adminQuestionsRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
