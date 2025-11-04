import { Router } from "express";
import { runLighthouse } from "../services/lighthouse.js";
import { analyzeWithAI } from "../services/ai.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body));
    console.log("Content-Type:", req.headers["content-type"]);

    const { url } = req.body;

    console.log("request>>>", url);

    if (!url || typeof url !== "string") {
      console.error("Invalid URL:", url, "Type:", typeof url);
      return res.status(400).json({
        error: "URL 是必需的且必须是字符串",
        received: req.body,
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "无效的 URL 格式" });
    }

    console.log(`🔍 Analyzing: ${url}`);

    // Run Lighthouse
    console.log("📊 Running Lighthouse...");
    const lighthouseResult = await runLighthouse(url);

    // Analyze with AI
    console.log("🤖 Analyzing with AI...");
    const aiAnalysis = await analyzeWithAI(lighthouseResult);

    const response = {
      lighthouse: lighthouseResult,
      aiAnalysis,
    };

    console.log("server response>>>", response);

    // Save to local file (optional)
    const fs = await import("fs/promises");
    const reportsDir = "./reports";
    try {
      await fs.mkdir(reportsDir, { recursive: true });
      const filename = `${reportsDir}/report-${Date.now()}.json`;
      await fs.writeFile(filename, JSON.stringify(response, null, 2));
      console.log(`💾 Report saved to ${filename}`);
    } catch (err) {
      console.warn("Failed to save report:", err);
    }

    res.json(response);
  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: "分析网站失败",
      message: error.message,
    });
  }
});

export { router as analyzeRoute };
