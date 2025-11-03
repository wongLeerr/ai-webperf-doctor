import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { analyzeRoute } from "./routes/analyze.js";
import { exportRoute } from "./routes/export.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("public"));

app.use("/api/analyze", analyzeRoute);
app.use("/api/export", exportRoute);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
