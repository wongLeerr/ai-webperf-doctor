import { Router } from "express";
import PDFDocument from "pdfkit";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const analysisData = req.body;

    if (!analysisData) {
      return res.status(400).json({ error: "需要分析数据" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="webperf-report-${Date.now()}.pdf"`
    );

    doc.pipe(res);

    // Title
    doc.fontSize(24).text("AI 网页性能诊断报告", { align: "center" });
    doc.moveDown();

    // URL and Score
    doc.fontSize(16).text(`网址: ${analysisData.lighthouse.url}`);
    doc
      .fontSize(18)
      .fillColor("#ff6b00")
      .text(`性能评分: ${analysisData.lighthouse.score}/100`, {
        align: "center",
      });
    doc.fillColor("black");
    doc.moveDown();

    // Metrics Section
    doc.fontSize(16).text("核心 Web 指标", { underline: true });
    doc.moveDown(0.5);
    const metrics = analysisData.lighthouse.metrics;
    doc.fontSize(12);
    doc.text(
      `LCP (最大内容绘制): ${metrics.lcp?.toFixed(0) || "无数据"}ms`
    );
    doc.text(`FID (首次输入延迟): ${metrics.fid?.toFixed(0) || "无数据"}ms`);
    doc.text(
      `CLS (累积布局偏移): ${metrics.cls?.toFixed(3) || "无数据"}`
    );
    doc.text(
      `FCP (首次内容绘制): ${metrics.fcp?.toFixed(0) || "无数据"}ms`
    );
    doc.text(
      `TBT (总阻塞时间): ${metrics.tbt?.toFixed(0) || "无数据"}ms`
    );
    doc.moveDown();

    // AI Analysis Summary
    doc.fontSize(16).text("AI 分析摘要", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(analysisData.aiAnalysis.summary);
    doc.moveDown();

    // Issues
    doc.fontSize(16).text("性能问题", { underline: true });
    doc.moveDown(0.5);
    analysisData.aiAnalysis.issues.forEach((issue, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${issue.title} [${issue.severity.toUpperCase()}]`);
      doc.fontSize(10).fillColor("gray").text(issue.description);
      doc.text(`影响: ${issue.impact}`);
      doc.fillColor("black");
      doc.moveDown(0.5);
    });

    // Recommendations
    doc.fontSize(16).text("优化建议", { underline: true });
    doc.moveDown(0.5);
    analysisData.aiAnalysis.recommendations.forEach((rec, index) => {
      doc
        .fontSize(12)
        .text(
          `${index + 1}. ${rec.title} [${rec.priority.toUpperCase()} 优先级]`
        );
      doc.fontSize(10).fillColor("gray").text(rec.description);
      doc.text(`预期改进: ${rec.expectedImprovement}`);
      doc.fillColor("black");
      doc.moveDown(0.5);
    });

    // Code Examples
    if (analysisData.aiAnalysis.codeExamples.length > 0) {
      doc.addPage();
      doc.fontSize(16).text("代码示例", { underline: true });
      doc.moveDown(0.5);
      analysisData.aiAnalysis.codeExamples.forEach((example, index) => {
        doc.fontSize(12).text(`${index + 1}. ${example.title}`);
        doc.fontSize(10).fillColor("#ff6b00").text(example.description);
        doc.fillColor("black");
        doc.moveDown(0.3);
        doc.font("Courier").fontSize(9).text(example.code, {
          align: "left",
          indent: 10,
        });
        doc.font("Helvetica");
        doc.moveDown();
      });
    }

    // Footer
    doc
      .fontSize(8)
      .fillColor("gray")
      .text(
        `由 AI 网页性能诊断工具生成于 ${new Date().toLocaleString("zh-CN")}`,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      error: "生成 PDF 失败",
      message: error.message,
    });
  }
});

export { router as exportRoute };
