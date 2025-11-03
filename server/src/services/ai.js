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

const SYSTEM_PROMPT = `You are an expert web performance analyst. Analyze the provided Lighthouse performance data and provide detailed insights, issues, recommendations, and code examples.

Return your response in the following JSON format:
{
  "summary": "A brief 2-3 sentence overview of the performance status",
  "issues": [
    {
      "category": "LCP" | "FID" | "CLS" | "JavaScript" | "CSS" | "Images" | "Network" | "Rendering",
      "severity": "high" | "medium" | "low",
      "title": "Issue title",
      "description": "Detailed description of the issue",
      "impact": "Expected impact on user experience"
    }
  ],
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "Recommendation title",
      "description": "Detailed recommendation with actionable steps",
      "expectedImprovement": "Expected performance improvement"
    }
  ],
  "codeExamples": [
    {
      "language": "html" | "css" | "javascript" | "json",
      "title": "Example title",
      "code": "Code snippet here",
      "description": "Explanation of the code example"
    }
  ],
  "overallScore": 0-100
}

Be specific, actionable, and focus on the most impactful optimizations first.`;

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
  const prompt = `Analyze the following Lighthouse performance data:

URL: ${lighthouseResult.url}
Performance Score: ${lighthouseResult.score}/100

Key Metrics:
- LCP (Largest Contentful Paint): ${
    lighthouseResult.metrics.lcp?.toFixed(0) || "N/A"
  }ms
- FID (First Input Delay): ${
    lighthouseResult.metrics.fid?.toFixed(0) || "N/A"
  }ms
- CLS (Cumulative Layout Shift): ${
    lighthouseResult.metrics.cls?.toFixed(3) || "N/A"
  }
- FCP (First Contentful Paint): ${
    lighthouseResult.metrics.fcp?.toFixed(0) || "N/A"
  }ms
- TBT (Total Blocking Time): ${
    lighthouseResult.metrics.tbt?.toFixed(0) || "N/A"
  }ms
- Speed Index: ${lighthouseResult.metrics.speedIndex?.toFixed(0) || "N/A"}

Top Issues (from audits):
${Object.values(lighthouseResult.audits)
  .filter((audit) => audit.score !== null && audit.score < 0.9)
  .slice(0, 10)
  .map(
    (audit) =>
      `- ${audit.title}: ${audit.displayValue || "Failed"} (Score: ${
        audit.score
      })`
  )
  .join("\n")}

Please provide a comprehensive analysis with specific, actionable recommendations and code examples. Return your response in valid JSON format only.`;

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
      summary: `Performance analysis for ${lighthouseResult.url}. Current score: ${lighthouseResult.score}/100. There are several areas for optimization.`,
      issues: [
        {
          category: "Performance",
          severity: "medium",
          title: "Performance Optimization Needed",
          description: "The page has performance issues that can be improved.",
          impact: "User experience may be affected by slower load times.",
        },
      ],
      recommendations: [
        {
          priority: "high",
          title: "Optimize Core Web Vitals",
          description: "Focus on improving LCP, FID, and CLS metrics.",
          expectedImprovement: "10-20% improvement in overall score",
        },
      ],
      codeExamples: [],
      overallScore: lighthouseResult.score,
    };
  }
}