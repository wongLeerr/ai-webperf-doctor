import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DDAI 配置
const DDAI_URL =
  "http://ddai.prod.svc.luojilab.dc/ddai/mix/model/order/chat/completions";
const DDAI_APP_ID = "192e4058c0000f91";
const DDAI_MIX = "cloudsway";
const DDAI_MODEL = "sonnet-4-2025-05-23, gpt-4.1-2025-04-14";
const DDAI_MODE = "model";

const SYSTEM_PROMPT = `你是一位专业的网页性能分析专家。请分析提供的 Lighthouse 性能数据，并提供详细的分析、问题、建议和代码示例。

请使用中文回复，并按以下 JSON 格式返回：
{
  "summary": "性能状态的简要概述（2-3句话）",
  "issues": [
    {
      "category": "LCP" | "FID" | "CLS" | "JavaScript" | "CSS" | "Images" | "Network" | "Rendering",
      "severity": "high" | "medium" | "low",
      "title": "问题标题",
      "description": "问题的详细描述",
      "impact": "对用户体验的预期影响"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "建议标题",
      "description": "包含可操作步骤的详细建议",
      "expectedImprovement": "预期的性能改进"
    }
  ],
  "codeExamples": [
    {
      "language": "html" | "css" | "javascript" | "json",
      "title": "示例标题",
      "code": "代码片段",
      "description": "代码示例的说明"
    }
  ],
  "overallScore": 0-100
}

请确保内容具体、可操作，并优先关注最具影响力的优化。所有文本内容必须使用中文。`;

/**
 * 调用 DDAI 接口，传入用户输入，返回模型结果
 * @param {string} userContent - 用户输入内容
 * @returns {Promise<string>} - 模型返回的内容
 */
async function callDdaiApi(userContent) {
  const payload = {
    top_p: 0.0,
    frequency_penalty: 0.3,
    stop: [],
    max_tokens: 4000, // 增加 token 限制以支持更详细的分析
    stream: false,
    presence_penalty: 0.0,
    temperature: 0.7,
    messages: [
      {
        content: SYSTEM_PROMPT,
        role: "system",
      },
      {
        content: userContent,
        role: "user",
      },
    ],
  };

  // 将 payload 写入临时文件（避免 shell 转义问题）
  const tempFile = path.join(__dirname, `temp_payload_${Date.now()}.json`);
  await fs.writeFile(tempFile, JSON.stringify(payload, null, 2));

  try {
    // 构建 curl 命令（使用数组格式以避免 shell 转义问题）
    const curlArgs = [
      "curl",
      "--location",
      "--silent",
      "--show-error",
      DDAI_URL,
      "--header",
      "Content-Type: application/json",
      "--header",
      `G-Auth-Appid: ${DDAI_APP_ID}`,
      "--header",
      `Xi-Mix: ${DDAI_MIX}`,
      "--header",
      `Xi-Mix-Model: ${DDAI_MODEL}`,
      "--header",
      `Xi-Mode: ${DDAI_MODE}`,
      "--data",
      `@${tempFile}`, // 从文件读取数据
      "--max-time",
      "60", // 60秒超时
    ];

    // 执行 curl 命令
    const { stdout, stderr } = await execAsync(curlArgs.join(" "), {
      timeout: 65000, // 65秒超时（略大于 curl 的 60 秒）
      maxBuffer: 10 * 1024 * 1024, // 10MB 缓冲区
      shell: true, // 使用 shell 执行
    });

    // curl 的 stderr 可能包含进度信息，只有在出现错误时才警告
    if (stderr && !stderr.match(/^(%|curl:)/)) {
      console.warn("Curl stderr:", stderr);
    }

    // 解析响应
    const responseData = JSON.parse(stdout);

    // 提取AI生成的内容
    if (responseData.choices && responseData.choices.length > 0) {
      const choice = responseData.choices[0];
      if (choice.message && choice.message.content) {
        return choice.message.content.trim();
      } else if (choice.text) {
        return choice.text.trim();
      }
    }

    throw new Error("No valid response from DDAI API");
  } catch (error) {
    console.error("DDAI API Error:", error.message);
    if (error.stdout) {
      console.error("Response:", error.stdout);
    }
    throw error;
  } finally {
    // 清理临时文件
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // 忽略清理错误
    }
  }
}

export async function analyzeWithAI(lighthouseResult) {
  const prompt = `请分析以下 Lighthouse 性能数据：

网址: ${lighthouseResult.url}
性能评分: ${lighthouseResult.score}/100

关键指标:
- LCP (最大内容绘制): ${
    lighthouseResult.metrics.lcp?.toFixed(0) || "无数据"
  }ms
- FID (首次输入延迟): ${
    lighthouseResult.metrics.fid?.toFixed(0) || "无数据"
  }ms
- CLS (累积布局偏移): ${
    lighthouseResult.metrics.cls?.toFixed(3) || "无数据"
  }
- FCP (首次内容绘制): ${
    lighthouseResult.metrics.fcp?.toFixed(0) || "无数据"
  }ms
- TBT (总阻塞时间): ${
    lighthouseResult.metrics.tbt?.toFixed(0) || "无数据"
  }ms
- Speed Index (速度指数): ${lighthouseResult.metrics.speedIndex?.toFixed(0) || "无数据"}

主要问题（来自审核）:
${Object.values(lighthouseResult.audits)
  .filter((audit) => audit.score !== null && audit.score < 0.9)
  .slice(0, 10)
  .map(
    (audit) =>
      `- ${audit.title}: ${audit.displayValue || "失败"} (评分: ${
        audit.score
      })`
  )
  .join("\n")}

请提供全面的分析，包括具体的、可操作的建议和代码示例。请仅以有效的 JSON 格式返回响应，所有文本内容必须使用中文。`;

  try {
    const content = await callDdaiApi(prompt);

    if (!content) {
      throw new Error("No response from DDAI API");
    }

    // 尝试解析 JSON，如果内容被代码块包裹，提取 JSON 部分
    let jsonContent = content;
    
    // 移除可能的 markdown 代码块标记
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    // 尝试解析 JSON
    const analysis = JSON.parse(jsonContent.trim());
    return analysis;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Return a fallback analysis
    return {
      summary: `${lighthouseResult.url} 的性能分析。当前评分：${lighthouseResult.score}/100。有几个可以优化的方面。`,
      issues: [
        {
          category: "Performance",
          severity: "medium",
          title: "需要性能优化",
          description: "页面存在可以改进的性能问题。",
          impact: "用户体验可能因加载时间较慢而受到影响。",
        },
      ],
      recommendations: [
        {
          priority: "high",
          title: "优化核心 Web 指标",
          description: "重点改善 LCP、FID 和 CLS 指标。",
          expectedImprovement: "整体评分提升 10-20%",
        },
      ],
      codeExamples: [],
      overallScore: lighthouseResult.score,
    };
  }
}