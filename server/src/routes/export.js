import { Router } from "express";
import PDFDocument from "pdfkit";

const router = Router();

// 主题色
const PRIMARY_COLOR = "#ff6b00";
const SECONDARY_COLOR = "#ff9933";
const TEXT_COLOR = "#1f2937";
const GRAY_COLOR = "#6b7280";
const LIGHT_GRAY = "#f3f4f6";

// 辅助函数：添加分页标题
function addSectionTitle(doc, title, forceNewPage = false) {
  if (forceNewPage) {
    doc.addPage();
  }
  // 如果当前页空间不足，自动换页
  if (doc.y > doc.page.height - 200) {
    doc.addPage();
  }
  doc.moveDown(0.5);
  doc.fontSize(18).fillColor(PRIMARY_COLOR).text(title, { underline: true });
  doc.fillColor(TEXT_COLOR);
  doc.moveDown(0.5);
}

// 辅助函数：添加表格行
function addTableRow(doc, label, value, indent = 0) {
  doc.fontSize(10);
  doc.fillColor(TEXT_COLOR);
  doc.text(label, { indent, continued: true });
  doc.fillColor(GRAY_COLOR);
  doc.text(`: ${value}`);
  doc.moveDown(0.3);
}

// 辅助函数：添加代码块
function addCodeBlock(doc, code, maxHeight = 200) {
  const lines = code.split("\n");
  const fontSize = 8;
  const lineHeight = fontSize * 1.2;
  const maxLines = Math.floor(maxHeight / lineHeight);

  doc.font("Courier").fontSize(fontSize).fillColor("#1f2937");

  // 添加背景框
  const startY = doc.y;
  const codeWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right - 40;
  const codeHeight = Math.min(lines.length * lineHeight, maxHeight);

  doc
    .rect(doc.x - 20, startY, codeWidth, codeHeight)
    .fillColor("#f9fafb")
    .fill()
    .strokeColor("#e5e7eb")
    .lineWidth(1)
    .stroke();

  doc.fillColor("#1f2937");
  let currentY = startY + 5;

  for (let i = 0; i < Math.min(lines.length, maxLines); i++) {
    if (currentY + lineHeight > startY + codeHeight) break;
    doc.text(lines[i], doc.x - 15, currentY, {
      width: codeWidth - 10,
      ellipsis: true,
    });
    currentY += lineHeight;
  }

  if (lines.length > maxLines) {
    doc.fontSize(7).fillColor(GRAY_COLOR);
    doc.text(`... (还有 ${lines.length - maxLines} 行)`, doc.x - 15, currentY);
  }

  doc.font("Helvetica").fillColor(TEXT_COLOR);
  doc.y = startY + codeHeight + 10;
}

router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (!data || !data.lighthouse || !data.aiAnalysis) {
      return res.status(400).json({ error: "需要完整的分析数据" });
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      info: {
        Title: "AI 网页性能诊断报告",
        Author: "AI WebPerf Doctor",
        Subject: "网页性能分析报告",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="webperf-report-${Date.now()}.pdf"`
    );

    doc.pipe(res);

    // ========== 封面 ==========
    doc
      .fontSize(28)
      .fillColor(PRIMARY_COLOR)
      .text("🏥 AI 网页性能诊断报告", { align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(16)
      .fillColor(TEXT_COLOR)
      .text("基于 Lighthouse 和 DeepSeek AI 的智能性能分析", {
        align: "center",
      });
    doc.moveDown(2);

    // 网址和日期
    doc.fontSize(12).fillColor(GRAY_COLOR);
    doc.text(`分析网址: ${data.lighthouse.url || "未知"}`, { align: "center" });
    doc.text(
      `生成时间: ${new Date().toLocaleString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      { align: "center" }
    );

    doc.addPage();

    // ========== 执行摘要 ==========
    addSectionTitle(doc, "📊 执行摘要");

    // 性能评分卡片
    const scores = data.lighthouse.scores || {};
    const performanceScore = scores.performance || data.lighthouse.score || 0;

    doc
      .fontSize(14)
      .fillColor(TEXT_COLOR)
      .text("性能评分", { underline: false });
    doc.moveDown(0.3);

    // 评分表格
    const scoreData = [
      ["性能", performanceScore, getScoreColor(performanceScore)],
      [
        "可访问性",
        scores.accessibility || 0,
        getScoreColor(scores.accessibility || 0),
      ],
      [
        "最佳实践",
        scores["best-practices"] || 0,
        getScoreColor(scores["best-practices"] || 0),
      ],
      ["SEO", scores.seo || 0, getScoreColor(scores.seo || 0)],
    ];

    doc.fontSize(11);
    scoreData.forEach(([label, score, color]) => {
      doc
        .fillColor(TEXT_COLOR)
        .text(`${label}:`, { continued: true, width: 100 });
      doc.fillColor(color).text(`${score}/100`, { width: 100 });
    });

    doc.moveDown(0.5);

    // AI 评分（如果有）
    if (data.aiAnalysis.score) {
      doc
        .fontSize(12)
        .fillColor(TEXT_COLOR)
        .text("AI 评分详情", { underline: false });
      doc.moveDown(0.3);
      doc.fontSize(10);
      const aiScores = [
        ["性能", data.aiAnalysis.score.performance],
        ["可访问性", data.aiAnalysis.score.accessibility],
        ["最佳实践", data.aiAnalysis.score.bestPractices],
        ["SEO", data.aiAnalysis.score.seo],
      ];
      aiScores.forEach(([label, score]) => {
        if (score !== undefined && score !== null) {
          doc
            .fillColor(TEXT_COLOR)
            .text(`${label}:`, { continued: true, width: 100 });
          doc
            .fillColor(getScoreColor(score))
            .text(`${score}/100`, { width: 100 });
        }
      });
      doc.moveDown(0.5);
    }

    // ========== 核心 Web 指标 ==========
    addSectionTitle(doc, "📡 核心 Web 指标");

    const metrics = data.lighthouse.metrics || {};
    const metricsData = [
      [
        "LCP (最大内容绘制)",
        formatMetric(metrics.lcp, "ms"),
        getMetricStatus(metrics.lcp, 2500, 4000),
      ],
      [
        "FID (首次输入延迟)",
        formatMetric(metrics.fid, "ms"),
        getMetricStatus(metrics.fid, 100, 300),
      ],
      [
        "CLS (累积布局偏移)",
        formatMetric(metrics.cls, ""),
        getMetricStatus(metrics.cls, 0.1, 0.25),
      ],
      ["FCP (首次内容绘制)", formatMetric(metrics.fcp, "ms"), ""],
      ["TBT (总阻塞时间)", formatMetric(metrics.tbt, "ms"), ""],
      ["Speed Index", formatMetric(metrics.speedIndex, ""), ""],
    ];

    doc.fontSize(10);
    metricsData.forEach(([label, value, status]) => {
      if (value !== "无数据") {
        doc
          .fillColor(TEXT_COLOR)
          .text(`${label}:`, { continued: true, width: 150 });
        doc
          .fillColor(PRIMARY_COLOR)
          .text(value, { continued: true, width: 100 });
        if (status) {
          doc.fillColor(GRAY_COLOR).text(`(${status})`, { width: 100 });
        }
        doc.moveDown(0.3);
      }
    });

    doc.moveDown(0.5);

    // ========== AI 分析摘要 ==========
    addSectionTitle(doc, "🤖 AI 智能分析摘要");

    if (data.aiAnalysis.summary) {
      doc.fontSize(11).fillColor(TEXT_COLOR).text(data.aiAnalysis.summary, {
        align: "left",
        indent: 10,
        lineGap: 3,
      });
      doc.moveDown(0.5);
    }

    // AI 性能预测
    if (data.aiAnalysis.prediction) {
      doc
        .fontSize(10)
        .fillColor("#059669")
        .text("📈 性能预测:", { underline: false });
      doc.fontSize(10).fillColor(TEXT_COLOR).text(data.aiAnalysis.prediction, {
        indent: 20,
        lineGap: 2,
      });
      doc.moveDown(0.5);
    }

    // ========== AI 洞察 ==========
    if (data.aiAnalysis.ai_insights) {
      const insights = data.aiAnalysis.ai_insights;
      addSectionTitle(doc, "💡 AI 智能洞察");

      if (insights.main_bottleneck) {
        doc
          .fontSize(11)
          .fillColor("#dc2626")
          .text("主要瓶颈:", { underline: false });
        doc
          .fontSize(10)
          .fillColor(TEXT_COLOR)
          .text(insights.main_bottleneck, { indent: 20 });
        doc.moveDown(0.5);
      }

      if (insights.root_causes && insights.root_causes.length > 0) {
        doc
          .fontSize(11)
          .fillColor("#ea580c")
          .text("潜在根因:", { underline: false });
        insights.root_causes.forEach((cause, idx) => {
          doc
            .fontSize(10)
            .fillColor(TEXT_COLOR)
            .text(`${idx + 1}. ${cause}`, { indent: 20 });
        });
        doc.moveDown(0.5);
      }

      if (insights.quick_wins && insights.quick_wins.length > 0) {
        doc
          .fontSize(11)
          .fillColor("#059669")
          .text("快速优化:", { underline: false });
        insights.quick_wins.forEach((win, idx) => {
          doc
            .fontSize(10)
            .fillColor(TEXT_COLOR)
            .text(`✓ ${win}`, { indent: 20 });
        });
        doc.moveDown(0.5);
      }
    }

    // ========== 资源统计 ==========
    if (data.lighthouse.resources) {
      addSectionTitle(doc, "📦 资源体积分析");

      const resources = data.lighthouse.resources;
      addTableRow(doc, "总资源大小", `${resources.totalSize || 0} KB`);
      addTableRow(doc, "JavaScript", `${resources.jsTotalSize || 0} KB`);
      addTableRow(doc, "CSS", `${resources.cssTotalSize || 0} KB`);
      addTableRow(doc, "图片", `${resources.imageTotalSize || 0} KB`);
      addTableRow(doc, "第三方资源", `${resources.thirdPartySize || 0} KB`);
      doc.moveDown(0.3);
    }

    // ========== 请求统计 ==========
    if (data.lighthouse.requests) {
      addSectionTitle(doc, "🌐 请求统计");

      const requests = data.lighthouse.requests;
      addTableRow(doc, "总请求数", `${requests.total || 0}`);
      addTableRow(doc, "第三方请求", `${requests.thirdParty || 0}`);
      addTableRow(doc, "第三方占比", `${requests.thirdPartyRatio || 0}%`);

      // 慢请求 Top 5
      if (requests.slowRequests && requests.slowRequests.length > 0) {
        doc.moveDown(0.3);
        doc
          .fontSize(11)
          .fillColor(TEXT_COLOR)
          .text("慢请求 Top 5:", { underline: false });
        doc.moveDown(0.2);
        requests.slowRequests.slice(0, 5).forEach((req, idx) => {
          doc
            .fontSize(9)
            .fillColor(TEXT_COLOR)
            .text(`${idx + 1}. ${req.url || "未知"}`, {
              indent: 20,
              continued: true,
            });
          doc.fillColor(PRIMARY_COLOR).text(` (${req.duration || 0}ms)`);
          doc.moveDown(0.2);
        });
      }
      doc.moveDown(0.3);
    }

    // ========== 主线程分析 ==========
    if (data.lighthouse.mainThread) {
      addSectionTitle(doc, "⚡ 主线程耗时分析");

      const mainThread = data.lighthouse.mainThread;
      addTableRow(
        doc,
        "脚本执行",
        `${formatMetric(mainThread.scriptEvaluation, "ms")}`
      );
      addTableRow(doc, "布局", `${formatMetric(mainThread.layout, "ms")}`);
      addTableRow(doc, "绘制", `${formatMetric(mainThread.paint, "ms")}`);
      doc.moveDown(0.3);
    }

    // ========== 性能瓶颈识别 ==========
    if (data.aiAnalysis.problems && data.aiAnalysis.problems.length > 0) {
      addSectionTitle(doc, "🔍 性能瓶颈识别", true);

      data.aiAnalysis.problems.forEach((problem, index) => {
        doc.moveDown(0.3);

        // 问题标题
        const severityLabel = getSeverityLabel(problem.severity);
        const severityColor = getSeverityColor(problem.severity);

        doc
          .fontSize(12)
          .fillColor(severityColor)
          .text(`${index + 1}. ${problem.title} [${severityLabel}]`, {
            underline: false,
          });

        // 问题类型
        if (problem.type) {
          doc
            .fontSize(9)
            .fillColor(GRAY_COLOR)
            .text(`类型: ${getTypeLabel(problem.type)}`, { indent: 20 });
        }

        // 影响描述
        if (problem.impact) {
          doc
            .fontSize(10)
            .fillColor(TEXT_COLOR)
            .text(`影响: ${problem.impact}`, {
              indent: 20,
              lineGap: 2,
            });
        }

        // 建议
        if (problem.suggestion) {
          doc
            .fontSize(10)
            .fillColor(PRIMARY_COLOR)
            .text(`建议: ${problem.suggestion}`, {
              indent: 20,
              lineGap: 2,
            });
        }

        doc.moveDown(0.5);

        // 如果内容太多，换页
        if (doc.y > doc.page.height - 150) {
          doc.addPage();
        }
      });
    }

    // ========== AI 优化建议 ==========
    if (data.aiAnalysis.suggestions && data.aiAnalysis.suggestions.length > 0) {
      addSectionTitle(doc, "💡 AI 优化建议与代码示例", true);

      data.aiAnalysis.suggestions.forEach((suggestion, index) => {
        doc.moveDown(0.3);

        // 建议标题
        doc
          .fontSize(12)
          .fillColor(PRIMARY_COLOR)
          .text(`${index + 1}. ${suggestion.title}`, {
            underline: false,
          });

        // 分类标签
        if (suggestion.category) {
          doc
            .fontSize(9)
            .fillColor(GRAY_COLOR)
            .text(`分类: ${suggestion.category}`, { indent: 20 });
        }

        // 描述
        if (suggestion.desc) {
          doc.fontSize(10).fillColor(TEXT_COLOR).text(suggestion.desc, {
            indent: 20,
            lineGap: 2,
          });
        }

        // 预期收益
        if (suggestion.benefit) {
          doc.moveDown(0.2);
          doc
            .fontSize(10)
            .fillColor("#059669")
            .text(`预期收益: ${suggestion.benefit}`, {
              indent: 20,
              lineGap: 2,
            });
        }

        // 代码示例
        if (suggestion.code) {
          doc.moveDown(0.3);
          doc
            .fontSize(10)
            .fillColor(TEXT_COLOR)
            .text("代码示例:", { indent: 20 });

          // 检查是否需要换页
          if (doc.y > doc.page.height - 250) {
            doc.addPage();
          }

          addCodeBlock(doc, suggestion.code, 150);
        }

        doc.moveDown(0.5);

        // 如果内容太多，换页
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      });
    }

    // ========== 代码示例库 ==========
    if (
      data.aiAnalysis.code_examples &&
      data.aiAnalysis.code_examples.length > 0
    ) {
      addSectionTitle(doc, "💻 AI 推荐代码示例库", true);

      doc
        .fontSize(10)
        .fillColor(GRAY_COLOR)
        .text("以下代码示例可直接复制使用，涵盖多种优化场景", {
          indent: 10,
        });
      doc.moveDown(0.5);

      data.aiAnalysis.code_examples.forEach((example, index) => {
        doc.moveDown(0.3);

        // 示例标题
        doc
          .fontSize(11)
          .fillColor(TEXT_COLOR)
          .text(`${index + 1}. ${example.desc || example.type || "代码示例"}`, {
            underline: false,
          });

        // 代码
        if (example.code) {
          // 检查是否需要换页
          if (doc.y > doc.page.height - 200) {
            doc.addPage();
          }

          addCodeBlock(doc, example.code, 120);
        }

        doc.moveDown(0.5);

        // 如果内容太多，换页
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
        }
      });
    }

    // ========== 页脚 ==========
    // 在所有内容添加完成后，为每一页添加页脚和页码
    const footerText = `由 AI 网页性能诊断工具生成 | ${new Date().toLocaleDateString("zh-CN")}`;
    
    // 获取页面范围（需要在所有内容添加完成后调用）
    // 注意：bufferedPageRange() 返回 {start: number, count: number}
    let pageRange;
    try {
      pageRange = doc.bufferedPageRange();
    } catch (err) {
      // 如果无法获取页面范围，直接结束文档（不添加页脚）
      console.warn("无法获取页面范围，跳过页脚添加:", err.message);
      doc.end();
      return; // 这里 return 是安全的，因为 doc 已经 pipe 到 res
    }
    
    if (!pageRange || pageRange.count === 0) {
      // 没有页面，直接结束
      doc.end();
      return; // 这里 return 是安全的，因为 doc 已经 pipe 到 res
    }
    
    const startPage = pageRange.start;
    const totalPages = pageRange.count;
    
    // 为每一页添加页脚和页码
    for (let i = startPage; i < startPage + totalPages; i++) {
      try {
        doc.switchToPage(i);
        
        // 添加底部信息（左侧）
        doc
          .fontSize(8)
          .fillColor(GRAY_COLOR)
          .text(footerText, 50, doc.page.height - 30, {
            align: "left",
          });
        
        // 添加页码（右侧）
        doc
          .fontSize(8)
          .fillColor(GRAY_COLOR)
          .text(
            `第 ${i - startPage + 1} 页 / 共 ${totalPages} 页`,
            doc.page.width - 100,
            doc.page.height - 30,
            { align: "right" }
          );
      } catch (err) {
        // 如果页面索引无效，记录警告但继续处理其他页面
        console.warn(`无法切换到页面 ${i}:`, err.message);
      }
    }

    doc.end();
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      error: "生成 PDF 失败",
      message: error.message,
    });
  }
});

// ========== 辅助函数 ==========

function formatMetric(value, unit) {
  if (value === undefined || value === null) return "无数据";
  if (unit === "") return value.toFixed(3);
  return `${value.toFixed(unit === "ms" ? 0 : 2)}${unit}`;
}

function getMetricStatus(value, good, poor) {
  if (value === undefined || value === null) return "";
  if (value <= good) return "良好";
  if (value <= poor) return "需要改进";
  return "较差";
}

function getScoreColor(score) {
  if (score >= 90) return "#059669"; // green
  if (score >= 75) return "#2563eb"; // blue
  if (score >= 50) return "#d97706"; // yellow
  return "#dc2626"; // red
}

function getSeverityLabel(severity) {
  const labels = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return labels[severity] || severity;
}

function getSeverityColor(severity) {
  const colors = {
    high: "#dc2626", // red
    medium: "#d97706", // yellow
    low: "#2563eb", // blue
  };
  return colors[severity] || TEXT_COLOR;
}

function getTypeLabel(type) {
  const labels = {
    script: "JavaScript",
    image: "图片",
    network: "网络",
    render: "渲染",
    "third-party": "第三方",
    other: "其他",
  };
  return labels[type] || type;
}

export { router as exportRoute };
