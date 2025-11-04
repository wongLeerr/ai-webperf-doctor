import { Router } from "express";
import { runLighthouse } from "../services/lighthouse.js";
import { analyzeWithAI } from "../services/ai.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body));
    console.log("Content-Type:", req.headers["content-type"]);

    let { url } = req.body;

    console.log("request>>>", url);

    if (!url || typeof url !== "string") {
      console.error("Invalid URL:", url, "Type:", typeof url);
      return res.status(400).json({
        error: "URL 是必需的且必须是字符串",
        received: req.body,
      });
    }

    // 规范化 URL：自动补全协议
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) {
      // 如果没有协议，添加 https://
      url = `https://${url}`;
      console.log("Normalized URL:", url);
    }

    // Validate URL
    let validatedUrl;
    try {
      validatedUrl = new URL(url);
    } catch {
      return res.status(400).json({ error: "无效的 URL 格式" });
    }

    // 确保使用规范化后的 URL
    url = validatedUrl.href;

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

    console.log("aiAnalysis>>>", JSON.stringify(aiAnalysis, null, 2));

    // Save to local file (optional)
    const fs = await import("fs/promises");
    const reportsDir = "./reports";
    // try {
    //   await fs.mkdir(reportsDir, { recursive: true });
    //   const filename = `${reportsDir}/report-${Date.now()}.json`;
    //   await fs.writeFile(filename, JSON.stringify(response, null, 2));
    //   console.log(`💾 Report saved to ${filename}`);
    // } catch (err) {
    //   console.warn("Failed to save report:", err);
    // }

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
