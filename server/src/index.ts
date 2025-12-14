import "dotenv/config";
import cors from "cors";
import express from "express";

import { contentRouter } from "./routes/contentRoutes.js";
import { healthRouter } from "./routes/healthRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(healthRouter);
app.use("/api", contentRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
