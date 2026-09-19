import cors from "cors";
import express from "express";
import { runAnalysisPipeline } from "./domain/analysis/runAnalysisPipeline.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "risklens-api" });
});

app.post("/documents/analyze", async (req, res) => {
  try {
    const { text, role, language } = req.body ?? {};

    if (typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({
        message: "Document text is required."
      });
    }

    const result = await runAnalysisPipeline({
      fullText: text,
      userRole: role || "general",
      outputLanguage: language || "en"
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Document analysis failed."
    });
  }
});

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`RiskLens API running at http://localhost:${port}`);
});
