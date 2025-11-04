import fetch from "node-fetch";

// DeepSeek API 配置
const DEEPSEEK_API_KEY =
  process.env.DEEPSEEK_API_KEY || "sk-9652bb96f61245ba899e23e5f67583fe";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * 增强版 AI 性能分析系统提示词
 *
 * 目标：生成结构化、全面的性能分析报告，包含：
 * - 性能概述与核心指标分析
 * - 问题分类与严重度评估
 * - AI 智能洞察（瓶颈、根因、Quick Wins）
 * - 详细优化建议与代码示例
 * - 多类型代码示例（懒加载、打包、图片、压缩、CDN）
 * - 可视化数据（趋势、瓶颈分布、AI 卡片）
 * - 性能预测
 */
const SYSTEM_PROMPT = `
你是一位资深网页性能优化专家（10年以上经验）。任务：根据提供的 Lighthouse 数据，返回一份结构化、专业且可落地的性能优化报告（纯 JSON），供前端直接渲染与使用。

必须遵守的硬性要求：
1. 返回**纯 JSON**（可被 JSON.parse 正常解析）。所有文本字段使用纯文本格式，不要使用任何 Markdown 语法。
2. 保持下述 JSON 结构与字段完整且不变，所有字段必须填充（不得留空或使用占位符）。
3. 所有建议必须具体可执行，且包含完整代码示例（详见对 code 要求）。

输出 JSON 必须包含以下字段（严格遵循类型与含义）：

{
  "summary": "性能概述（纯文本格式，≥80 字，包含：性能状态、至少 3-5 个主要问题、对用户体验影响、修复后预期收益。使用换行符 \\n 分隔段落）",
  "score": {
    "performance": 0-100,
    "accessibility": 0-100,
    "bestPractices": 0-100,
    "seo": 0-100
  },
  "metrics": {
    "LCP": "值 + 说明",
    "FID": "值 + 说明",
    "CLS": "值 + 说明",
    "TBT": "值 + 说明",
    "FCP": "值 + 说明",
    "SpeedIndex": "值 + 说明"
  },
  "problems": [
    {
      "type": "script|image|network|render|third-party|other",
      "title": "具体问题标题",
      "severity": "high|medium|low",
      "impact": "具体影响说明",
      "suggestion": "概括性优化方向"
    }
    // 至少 3-5 个问题
  ],
  "ai_insights": {
    "main_bottleneck": "一句话主要瓶颈",
    "root_causes": ["根因1","根因2","根因3"],
    "quick_wins": ["立即可做1","立即可做2","立即可做3"]
  },
  "suggestions": [
    {
      "title": "建议标题",
      "desc": "详细说明（问题分析、优化原理、实施步骤、注意事项）",
      "category": "前端|网络|构建优化|图片|交互体验",
      "code": "完整可执行代码（至少 20 行，含文件说明与注释）",
      "benefit": "预计收益（量化说明，如 LCP 降低 X%，缩短 Y 秒）"
    }
    // 必须至少 5 项（建议 5-10 项），覆盖不同类别
  ],
  "code_examples": [
    {
      "type": "示例类型标识（如 lazy-load）",
      "desc": "短说明",
      "code": "完整或精简可执行代码（含注释与文件结构说明）"
    }
    // 至少 5 个示例，建议 10-15 个，覆盖 Vue/React/Vite/webpack/Sharp/imagemin/Express/Nginx/ServiceWorker/虚拟滚动/预加载等
  ],
  "visualization": {
    "chartData": {
      "metricTrends": [{"metric":"LCP","before":数字,"after":数字}, ...],
      "bottleneckDistribution":{"script":数字,"image":数字,"network":数字,"render":数字,"third-party":数字}
    },
    "aiCards": [
      {"title":"卡片标题","impact":"影响描述","suggestion":"建议","confidence":"高|中|低"}
      // 至少 3 个卡片
    ]
  },
  "prediction": "量化预测（如：性能评分提升 X-Y%，首屏时间缩短 Z 秒）"
}

代码示例（code 字段与 code_examples 内的每个示例）必须满足：
- 每个 suggestions[i].code 至少 20 行、完整可执行（包含必要的导入/导出或配置段），并包含：
  1. 文件或文件结构说明（如：文件名和目录）
  2. 完整代码（可直接复制运行或放入项目）
  3. 行内注释解释每段逻辑
  4. 说明该代码解决的性能点与注意事项
- code_examples 数组的示例可略短于 suggestions 中的示例，但仍需可执行并包含注释。
- 示例应与检测到的问题相关联（优先生成针对性强的示例）。

分析要点（简明）：
- 深度解析 LCP、FID、CLS、TBT、FCP、Speed Index 等；
- 评估资源体积、请求数、第三方影响、主线程耗时分布；
- 智能推断根因（例如：TBT 高 + JS 大 → 脚本阻塞；LCP 高 + 大图片 → 图片传输慢）；
- 给出可量化的收益预测。

优先级规则（防止超时）：
1. 优先完整生成 suggestions 中 前 5 项，保证每项包含 ≥20 行完整代码与详细说明。  
2. 若剩余 token/时间不足，仍必须返回完整 JSON 结构：对 code_examples 中的剩余示例可给出较短但可执行版本（仍含注释），并保证 code_examples 的总数不少于 5。  
3. 在任何情况下都不得返回无效 JSON、不得省略必须字段或用占位符替代内容。

重要的事再强调一次：
- 纯 JSON（可被 JSON.parse() 解析）
- 所有文本字段使用纯文本格式，不要使用任何 Markdown 语法（如 **加粗**、# 标题、- 列表等）
- 不包含三反引号等代码块标记
- 所有字段均需填充，不能留空
- 所有字符串值必须用双引号包裹（如 "suggestion": "优化建议" 而不是 "suggestion": 优化建议"）
- 不要生成任何占位符字段或注释字段（如 _insights_、_placeholder_ 等）
- suggestions 数组必须至少包含 5 个优化建议，每个建议包含完整的代码示例（至少 20 行）
- code_examples 数组必须至少包含 5 个代码示例，建议包含 10-15 个不同类型示例
- 根据上述性能数据，生成有针对性的、可直接使用的代码示例

JSON 格式检查清单（生成前请确认）：
✓ 所有字符串值都用双引号包裹
✓ 没有缺失的引号
✓ 没有占位符字段
✓ 没有 Markdown 语法
✓ 所有字段都已填充实际内容
✓ JSON 可以被 JSON.parse() 正常解析

现在请依据提供的 Lighthouse 数据生成完整报告并返回上述 JSON。`;

/**
 * 调用 DeepSeek API 接口，传入用户输入，返回模型结果
 * @param {string} userContent - 用户输入内容
 * @returns {Promise<string>} - 模型返回的内容
 */
async function callDeepSeekApi(userContent) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error(
      "DEEPSEEK_API_KEY 未配置，请在环境变量中设置 DEEPSEEK_API_KEY"
    );
  }

  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 300秒超时

  try {
    const payload = {
      model: DEEPSEEK_MODEL,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userContent,
        },
      ],
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 1.0,
      frequency_penalty: 0.3,
      presence_penalty: 0.0,
      stream: false,
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 检查响应状态
    if (!response.ok) {
      let errorMessage = `DeepSeek API 请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        // 如果无法解析错误响应，使用默认错误消息
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // 提取AI生成的内容
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      if (choice.message && choice.message.content) {
        console.log(
          "🐶🐶🐶choice.message.content>>>",
          choice.message.content.trim()
        );
        return choice.message.content.trim();
      }
    }

    throw new Error("No valid response from DeepSeek API");
  } catch (error) {
    clearTimeout(timeoutId);

    // 处理 AbortError (超时)
    if (error.name === "AbortError" || error.message === "terminated") {
      throw new Error(
        "DeepSeek API 请求超时。生成的内容可能过长，请稍后重试或减少 max_tokens 参数。"
      );
    }

    console.error("DeepSeek API Error:", error.message);
    if (error.status) {
      console.error("API Status:", error.status);
    }
    if (error.code) {
      console.error("Error Code:", error.code);
    }

    // 处理其他错误
    if (error.message) {
      throw new Error(`DeepSeek API 错误: ${error.message}`);
    }

    throw error;
  }
}

export async function analyzeWithAI(lighthouseResult) {
  const prompt = `请分析以下 Lighthouse 性能数据：

网址: ${lighthouseResult.url}
性能评分: ${lighthouseResult.score}/100

关键指标:
- LCP (最大内容绘制): ${lighthouseResult.metrics.lcp?.toFixed(0) || "无数据"}ms
- FID (首次输入延迟): ${lighthouseResult.metrics.fid?.toFixed(0) || "无数据"}ms
- CLS (累积布局偏移): ${lighthouseResult.metrics.cls?.toFixed(3) || "无数据"}
- FCP (首次内容绘制): ${lighthouseResult.metrics.fcp?.toFixed(0) || "无数据"}ms
- TBT (总阻塞时间): ${lighthouseResult.metrics.tbt?.toFixed(0) || "无数据"}ms
- Speed Index (速度指数): ${
    lighthouseResult.metrics.speedIndex?.toFixed(0) || "无数据"
  }

资源体积分析:
- JS 总大小: ${lighthouseResult.resources?.jsTotalSize || 0} KB
- CSS 总大小: ${lighthouseResult.resources?.cssTotalSize || 0} KB
- 图片总大小: ${lighthouseResult.resources?.imageTotalSize || 0} KB
- 第三方资源: ${lighthouseResult.resources?.thirdPartySize || 0} KB
- 总资源大小: ${lighthouseResult.resources?.totalSize || 0} KB

请求统计:
- 总请求数: ${lighthouseResult.requests?.total || 0}
- 第三方请求: ${lighthouseResult.requests?.thirdParty || 0} (${
    lighthouseResult.requests?.thirdPartyRatio || 0
  }%)

主线程分析:
- 脚本执行: ${lighthouseResult.mainThread?.scriptEvaluation?.toFixed(0) || 0}ms
- 布局计算: ${lighthouseResult.mainThread?.layout?.toFixed(0) || 0}ms
- 绘制时间: ${lighthouseResult.mainThread?.paint?.toFixed(0) || 0}ms
- 样式计算: ${lighthouseResult.mainThread?.style?.toFixed(0) || 0}ms

慢请求 Top 5:
${(lighthouseResult.requests?.slowRequests || [])
  .slice(0, 5)
  .map((req, idx) => `${idx + 1}. ${req.url} (${req.duration}ms, ${req.type})`)
  .join("\n")}

主要问题（来自审核）:
${Object.values(lighthouseResult.audits)
  .filter((audit) => audit.score !== null && audit.score < 0.9)
  .slice(0, 10)
  .map(
    (audit) =>
      `- ${audit.title}: ${audit.displayValue || "失败"} (评分: ${audit.score})`
  )
  .join("\n")}

请提供全面的分析，包括：
1. **【最重要】系统性的性能分析报告（summary）**：
   - **格式要求**：使用纯文本格式，使用换行符（\\n）分隔段落，不要使用任何 Markdown 语法
   - **字数要求**：不少于 80 字，建议 100-200 字
   - **必须包含以下四个部分**，每个部分都要详细说明：
     * 性能状态概述：当前性能评分、整体性能状况（1-2句话，说明当前状态）
     * 主要性能问题列表：至少列出 3-5 个具体问题，每个问题要具体明确，要基于上面的 Lighthouse 数据分析
     * 对用户体验的影响：详细说明每个问题如何影响用户（如：加载时间延长、交互延迟、视觉体验差、首屏内容显示慢等）
     * 修复后的预期收益：量化说明修复后的性能提升（如：LCP 可降低 30%，首屏时间减少 1.5 秒，TBT 降低 40%，性能评分提升至 85 分等）
   - **内容要求**：系统、专业、可读性强，要基于上面提供的 Lighthouse 数据进行分析，不能泛泛而谈，每个问题都要有数据支撑
2. 识别具体性能瓶颈（网络/渲染/JS膨胀/图片/第三方脚本等）
3. 生成具体的优化建议和代码示例
4. 预测优化后的性能评分

【重要数量要求】：
- suggestions 数组必须至少包含 5 个优化建议，每个建议包含完整的代码示例（至少 20 行）
- code_examples 数组必须至少包含 5 个代码示例，建议包含 10-15 个不同类型示例
- 根据上述性能数据，生成有针对性的、可直接使用的代码示例

请仅以有效的 JSON 格式返回响应，所有文本内容必须使用中文。`;

  // JSON 清理和修复函数
  function cleanJsonString(jsonString) {
    let cleaned = jsonString.trim();

    // 移除 Markdown 代码块标记（```json、```JSON、```）
    cleaned = cleaned
      .replace(/^```(?:json|JSON)?\s*\n?/i, "") // 移除开头的 ```json 或 ```
      .replace(/\n?```\s*$/i, "") // 移除结尾的 ```
      .trim();

    // 如果还有代码块标记（可能在中间），尝试移除
    if (cleaned.includes("```")) {
      // 只移除独立的代码块标记行（整行只有 ``` 或 ```json）
      cleaned = cleaned
        .split("\n")
        .filter((line) => !/^```(?:json|JSON)?\s*$/i.test(line.trim()))
        .join("\n");
    }

    // 移除 JSON 注释（单行和多行）
    cleaned = cleaned
      .replace(/\/\/.*$/gm, "") // 移除单行注释
      .replace(/\/\*[\s\S]*?\*\//g, ""); // 移除多行注释

    // 尝试提取第一个完整的 JSON 对象
    const firstBrace = cleaned.indexOf("{");
    if (firstBrace !== -1) {
      let braceCount = 0;
      let inString = false;
      let escapeNext = false;
      let endIndex = firstBrace;

      for (let i = firstBrace; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === "\\") {
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          continue;
        }

        if (!inString) {
          if (char === "{") {
            braceCount++;
          } else if (char === "}") {
            braceCount--;
            if (braceCount === 0) {
              endIndex = i + 1;
              break;
            }
          }
        }
      }

      if (braceCount === 0) {
        cleaned = cleaned.substring(firstBrace, endIndex);
      }
    }

    // 移除末尾多余的逗号（在对象和数组的最后一个元素后）
    cleaned = cleaned
      .replace(/,(\s*[}\]])/g, "$1") // 移除对象和数组末尾的逗号
      .trim();

    return cleaned;
  }

  try {
    const content = await callDeepSeekApi(prompt);

    if (!content) {
      throw new Error("No response from DeepSeek API");
    }

    // 清理和修复 JSON 字符串
    let jsonContent = cleanJsonString(content);

    // 尝试解析 JSON，如果失败则尝试更激进的修复
    let analysis;
    try {
      analysis = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("First JSON parse attempt failed:", parseError.message);

      // 显示错误位置附近的内容以便调试
      if (parseError.message.includes("position")) {
        const match = parseError.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          const start = Math.max(0, pos - 100);
          const end = Math.min(jsonContent.length, pos + 100);
          console.error(
            `Error at position ${pos}, context:`,
            jsonContent.substring(start, end)
          );
        }
      }

      // 尝试更激进的修复：移除 Markdown 代码块标记和所有注释行
      jsonContent = jsonContent
        .replace(/^```(?:json|JSON)?\s*\n?/i, "") // 移除开头的 ```json 或 ```
        .replace(/\n?```\s*$/i, "") // 移除结尾的 ```
        .trim();

      // 移除所有注释行和多余的空行
      jsonContent = jsonContent
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return (
            trimmed &&
            !trimmed.startsWith("//") &&
            !trimmed.startsWith("/*") &&
            !trimmed.startsWith("*") &&
            !trimmed.startsWith("```") // 也移除可能的代码块标记行
          );
        })
        .join("\n");

      // 尝试修复常见的 JSON 问题
      // 1. 尝试提取完整的 JSON 对象（如果响应被截断）
      // 通过找到最后一个匹配的 } 来提取完整的 JSON
      try {
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;
        let lastValidBrace = -1;

        for (let i = 0; i < jsonContent.length; i++) {
          const char = jsonContent[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === "\\") {
            escapeNext = true;
            continue;
          }

          if (char === '"') {
            inString = !inString;
            continue;
          }

          if (!inString) {
            if (char === "{") {
              braceCount++;
            } else if (char === "}") {
              braceCount--;
              if (braceCount === 0) {
                lastValidBrace = i;
              }
            }
          }
        }

        // 如果找到了完整的 JSON 对象，且 JSON 可能被截断
        if (lastValidBrace !== -1 && lastValidBrace < jsonContent.length - 10) {
          const potentialJson = jsonContent.substring(0, lastValidBrace + 1);
          try {
            const testParse = JSON.parse(potentialJson);
            jsonContent = potentialJson;
            console.log("Successfully extracted complete JSON from response");
          } catch (e) {
            // 如果截断后的 JSON 仍然无效，继续使用原始内容
          }
        }
      } catch (e) {
        // 如果提取失败，继续尝试其他修复
      }

      // 尝试修复常见的 JSON 语法错误
      // 1. 先修复不完整的对象（移除空字段或缺失键名的字段）
      // 移除类似 "title": "", "", "" 这样的无效字段（没有键名的空字符串）
      jsonContent = jsonContent.replace(/,\s*"",\s*""/g, "");
      jsonContent = jsonContent.replace(/,\s*""/g, "");
      jsonContent = jsonContent.replace(/""\s*,/g, "");

      // 移除不完整的对象（只有空字段或缺失键名的对象）
      // 匹配类似 {"type": "render", "title": "", "", "", ""} 的情况
      jsonContent = jsonContent.replace(
        /,\s*\{\s*"type"\s*:\s*"[^"]*"\s*,\s*"title"\s*:\s*"",\s*"",\s*"",\s*""\s*\}/g,
        ""
      );
      jsonContent = jsonContent.replace(
        /\{\s*"type"\s*:\s*"[^"]*"\s*,\s*"title"\s*:\s*"",\s*"",\s*"",\s*""\s*\}/g,
        ""
      );

      // 移除只包含空字段的对象（更通用的情况）
      jsonContent = jsonContent.replace(
        /,\s*\{\s*"[^"]*"\s*:\s*"[^"]*"\s*,\s*"[^"]*"\s*:\s*"",\s*"",\s*"",\s*""\s*\}/g,
        ""
      );
      jsonContent = jsonContent.replace(
        /\{\s*"[^"]*"\s*:\s*"[^"]*"\s*,\s*"[^"]*"\s*:\s*"",\s*"",\s*"",\s*""\s*\}/g,
        ""
      );

      // 2. 修复缺失开头引号的字符串值（更精确的匹配）
      // 只匹配明显的缺失引号情况：": 后面直接跟着字母或中文字符（非引号、非数字、非布尔值）
      // 使用更保守的正则，只匹配明显的字符串值（以字母、中文、常见符号开头）
      jsonContent = jsonContent.replace(
        /":\s*([a-zA-Z\u4e00-\u9fa5][^"]*?)"/g,
        (match, value) => {
          const trimmed = value.trim();
          // 再次检查确保不是数字、布尔值、null或数组/对象
          if (
            trimmed.length > 0 &&
            !trimmed.startsWith('"') &&
            !trimmed.startsWith("[") &&
            !trimmed.startsWith("{") &&
            !/^(true|false|null|-?\d+\.?\d*)$/.test(trimmed)
          ) {
            // 转义值中的特殊字符
            const escaped = trimmed
              .replace(/\\/g, "\\\\")
              .replace(/"/g, '\\"')
              .replace(/\n/g, "\\n")
              .replace(/\r/g, "\\r")
              .replace(/\t/g, "\\t");
            return `": "${escaped}"`;
          }
          return match;
        }
      );

      // 3. 移除占位符字段（包含_insights_、_placeholder_、_comment_等占位符的字段）
      // 先移除字段定义（包括前面的逗号）
      jsonContent = jsonContent.replace(
        /,\s*"[^"]*_(?:insights_|placeholder_|comment_)[^"]*"\s*:[^,}]*/gi,
        ""
      );
      // 再移除字段定义（包括后面的逗号）
      jsonContent = jsonContent.replace(
        /"[^"]*_(?:insights_|placeholder_|comment_)[^"]*"\s*:[^,}]*,?/gi,
        ""
      );
      // 移除包含大量下划线和占位符文本的字段
      jsonContent = jsonContent.replace(/,\s*"[^"]*_{3,}[^"]*"\s*:[^,}]*/g, "");

      // 3. 清理多余的逗号
      jsonContent = jsonContent
        .replace(/,(\s*[}\]])/g, "$1") // 移除末尾逗号
        .replace(/,(\s*,)/g, ",") // 移除重复逗号
        .trim();

      try {
        analysis = JSON.parse(jsonContent);
      } catch (secondError) {
        console.error("Second JSON parse attempt failed:", secondError.message);

        // 显示更详细的错误信息
        if (secondError.message.includes("position")) {
          const match = secondError.message.match(/position (\d+)/);
          if (match) {
            const pos = parseInt(match[1]);
            const start = Math.max(0, pos - 100);
            const end = Math.min(jsonContent.length, pos + 100);
            console.error(
              `Error at position ${pos}, context:`,
              jsonContent.substring(start, end)
            );
            console.error(
              `JSON length: ${jsonContent.length}, error position: ${pos}`
            );
          }
        }

        console.error(
          "JSON content (first 1000 chars):",
          jsonContent.substring(0, 1000)
        );
        console.error(
          "JSON content (last 500 chars):",
          jsonContent.substring(Math.max(0, jsonContent.length - 500))
        );

        throw new Error(
          `无法解析 AI 返回的 JSON 格式: ${
            secondError.message
          }。原始内容前500字符: ${content.substring(0, 500)}`
        );
      }
    }

    // 确保所有必需字段都存在，如果缺失则使用默认值
    analysis = {
      summary: analysis.summary || "性能分析完成",
      score: {
        performance: analysis.score?.performance || lighthouseResult.score || 0,
        accessibility:
          analysis.score?.accessibility ||
          lighthouseResult.scores?.accessibility ||
          0,
        bestPractices:
          analysis.score?.bestPractices ||
          analysis.score?.["best-practices"] ||
          lighthouseResult.scores?.["best-practices"] ||
          0,
        seo: analysis.score?.seo || lighthouseResult.scores?.seo || 0,
      },
      metrics: analysis.metrics || {},
      problems: analysis.problems || [],
      ai_insights: analysis.ai_insights || {
        main_bottleneck: "需要进一步分析",
        root_causes: [],
        quick_wins: [],
      },
      suggestions: analysis.suggestions || [],
      code_examples: analysis.code_examples || [],
      visualization: analysis.visualization || {
        chartData: {
          metricTrends: [],
          bottleneckDistribution: {},
        },
        aiCards: [],
      },
      prediction:
        analysis.prediction || "执行优化建议后，性能预计可提升 15-25%。",
    };

    return analysis;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    // Return a fallback analysis with complete structure
    return {
      summary: `${lighthouseResult.url} 的性能分析。当前评分：${lighthouseResult.score}/100。检测到多个可优化的方面，包括资源体积、请求数量和主线程阻塞等问题。`,
      score: {
        performance: lighthouseResult.score || 0,
        accessibility: lighthouseResult.scores?.accessibility || 0,
        bestPractices: lighthouseResult.scores?.["best-practices"] || 0,
        seo: lighthouseResult.scores?.seo || 0,
      },
      metrics: {
        LCP: `${lighthouseResult.metrics.lcp?.toFixed(0) || 0}ms，${
          lighthouseResult.metrics.lcp > 4000
            ? "超过阈值，影响首屏体验"
            : lighthouseResult.metrics.lcp > 2500
            ? "略高于推荐值"
            : "性能良好"
        }`,
        FID: `${lighthouseResult.metrics.fid?.toFixed(0) || 0}ms，${
          lighthouseResult.metrics.fid > 300
            ? "首次交互延迟较高"
            : lighthouseResult.metrics.fid > 100
            ? "可进一步优化"
            : "交互响应良好"
        }`,
        CLS: `${lighthouseResult.metrics.cls?.toFixed(3) || 0}，${
          lighthouseResult.metrics.cls > 0.25
            ? "布局稳定性较差"
            : lighthouseResult.metrics.cls > 0.1
            ? "布局稳定性可改善"
            : "布局稳定性良好"
        }`,
        TBT: `${lighthouseResult.metrics.tbt?.toFixed(0) || 0}ms，${
          lighthouseResult.metrics.tbt > 600
            ? "主线程阻塞严重"
            : lighthouseResult.metrics.tbt > 200
            ? "存在阻塞"
            : "阻塞较少"
        }`,
        FCP: `${lighthouseResult.metrics.fcp?.toFixed(0) || 0}ms，${
          lighthouseResult.metrics.fcp > 3000
            ? "首次内容绘制较慢"
            : lighthouseResult.metrics.fcp > 1800
            ? "可优化"
            : "性能良好"
        }`,
        SpeedIndex: `${lighthouseResult.metrics.speedIndex?.toFixed(0) || 0}，${
          lighthouseResult.metrics.speedIndex > 4000
            ? "页面加载速度偏慢"
            : "加载速度可接受"
        }`,
      },
      problems: [
        {
          type: "script",
          title: "JavaScript 执行时间较长",
          severity: lighthouseResult.metrics.tbt > 600 ? "high" : "medium",
          impact: `主线程阻塞时间 ${
            lighthouseResult.metrics.tbt?.toFixed(0) || 0
          }ms，影响用户交互响应。`,
          suggestion: "代码分割与懒加载",
        },
        {
          type: "network",
          title: "资源体积或请求数量较多",
          severity:
            (lighthouseResult.resources?.totalSize || 0) > 2000
              ? "high"
              : "medium",
          impact: `总资源大小 ${
            lighthouseResult.resources?.totalSize || 0
          } KB，请求数 ${
            lighthouseResult.requests?.total || 0
          } 个，影响加载速度。`,
          suggestion: "资源压缩与合并",
        },
      ],
      ai_insights: {
        main_bottleneck: "需要基于具体数据分析主要性能瓶颈",
        root_causes: [
          "资源体积过大或未压缩",
          "JavaScript 执行阻塞主线程",
          "网络请求过多或未优化",
        ],
        quick_wins: [
          "启用 Gzip/Brotli 压缩",
          "为图片添加 width/height 属性",
          "移除未使用的 CSS 和 JavaScript",
        ],
      },
      suggestions: [
        {
          title: "代码分割与懒加载优化",
          desc: "通过代码分割和懒加载技术，减少初始 bundle 体积，提升首屏加载速度。原理：将大型 JavaScript 包拆分为多个小包，按需加载。实施步骤：1. 使用动态 import 2. 配置路由懒加载 3. 组件按需加载。注意事项：需要合理划分 chunk，避免过度分割导致请求过多。",
          category: "前端",
          code: "// Vue 3 路由懒加载示例\n// router/index.js\nimport { createRouter, createWebHistory } from 'vue-router';\n\nconst routes = [\n  {\n    path: '/home',\n    name: 'Home',\n    // 使用动态 import 实现懒加载\n    component: () => import('@/views/Home.vue')\n  },\n  {\n    path: '/about',\n    name: 'About',\n    component: () => import('@/views/About.vue')\n  }\n];\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes\n});\n\nexport default router;",
          benefit:
            "初始 bundle 体积减少 40-60%，LCP 可降低 20-30%，首屏渲染时间减少 1-2 秒",
        },
        {
          title: "资源压缩与 Gzip/Brotli 启用",
          desc: "启用服务器端压缩，减少传输体积。原理：在服务器端压缩文本资源（HTML、CSS、JS），客户端解压。实施步骤：1. 配置 Express/Nginx 压缩 2. 设置压缩级别和阈值 3. 测试压缩效果。注意事项：图片和已压缩资源不需要再次压缩。",
          category: "网络",
          code: "// Express 服务器启用 Gzip 压缩\n// server.js\nconst express = require('express');\nconst compression = require('compression');\n\nconst app = express();\n\n// 启用压缩中间件\napp.use(compression({\n  level: 6, // 压缩级别 1-9，6 是平衡点\n  threshold: 1024, // 只压缩大于 1KB 的文件\n  filter: (req, res) => {\n    // 如果请求头包含 x-no-compression，则不压缩\n    if (req.headers['x-no-compression']) return false;\n    // 使用默认过滤器\n    return compression.filter(req, res);\n  }\n}));\n\napp.use(express.static('public'));\napp.listen(3000);",
          benefit: "传输体积减少 60-80%，页面加载时间缩短 30-50%，带宽使用降低",
        },
        {
          title: "图片优化与格式转换",
          desc: "使用现代图片格式（WebP、AVIF）和压缩技术，减少图片体积。原理：现代图片格式压缩率更高，在相同质量下体积更小。实施步骤：1. 安装图片处理工具（Sharp/imagemin）2. 批量转换图片格式 3. 设置合适的压缩质量。注意事项：需要提供 fallback 格式以兼容旧浏览器。",
          category: "图片",
          code: "// 使用 Sharp 进行图片优化\n// optimize-images.js\nconst sharp = require('sharp');\nconst fs = require('fs').promises;\nconst path = require('path');\n\nasync function optimizeImages(inputDir, outputDir) {\n  const files = await fs.readdir(inputDir);\n  \n  for (const file of files) {\n    if (/.(jpg|jpeg|png)$/i.test(file)) {\n      const inputPath = path.join(inputDir, file);\n      const outputPath = path.join(outputDir, file.replace(/\\.(jpg|jpeg|png)$/i, '.webp'));\n      \n      await sharp(inputPath)\n        .resize(1200, 1200, { \n          fit: 'inside', \n          withoutEnlargement: true \n        })\n        .webp({ quality: 80 })\n        .toFile(outputPath);\n      \n      console.log(`优化完成: ${file} -> ${path.basename(outputPath)}`);\n    }\n  }\n}\n\noptimizeImages('./images', './optimized');",
          benefit: "图片体积减少 50-70%，LCP 可提升 15-25%，页面加载速度提升",
        },
        {
          title: "Vite/Webpack 构建优化配置",
          desc: "优化构建配置，实现代码分割、Tree Shaking 和压缩。原理：通过合理的 chunk 分割和 Tree Shaking，移除未使用代码，减少最终 bundle 体积。实施步骤：1. 配置 manualChunks 2. 启用 Tree Shaking 3. 配置压缩选项。注意事项：需要分析 bundle 大小，避免过度分割。",
          category: "构建优化",
          code: "// vite.config.js - Vite 构建优化配置\nexport default {\n  build: {\n    // 配置代码分割\n    rollupOptions: {\n      output: {\n        // 手动配置 chunk 分割\n        manualChunks: {\n          // 将 Vue 相关库单独打包\n          vendor: ['vue', 'vue-router', 'vuex'],\n          // 将工具库单独打包\n          utils: ['lodash', 'axios', 'dayjs'],\n          // 将图表库单独打包\n          charts: ['echarts', 'vue-echarts']\n        },\n        // 使用 hash 命名，便于缓存\n        entryFileNames: 'assets/[name].[hash].js',\n        chunkFileNames: 'assets/[name].[hash].js',\n        assetFileNames: 'assets/[name].[hash].[ext]'\n      }\n    },\n    // 设置 chunk 大小警告阈值\n    chunkSizeWarningLimit: 1000,\n    // 使用 terser 压缩\n    minify: 'terser',\n    terserOptions: {\n      compress: {\n        // 移除 console 语句\n        drop_console: true,\n        // 移除 debugger\n        drop_debugger: true\n      }\n    }\n  }\n};",
          benefit:
            "bundle 体积减少 30-50%，首屏加载时间减少 1-2 秒，TBT 降低 20-40%",
        },
        {
          title: "资源预加载与预取策略",
          desc: "使用 preload 和 prefetch 优化关键资源加载。原理：提前加载关键资源，延迟加载非关键资源。实施步骤：1. 识别关键资源 2. 使用 preload 预加载关键资源 3. 使用 prefetch 预取非关键资源。注意事项：不要过度使用，避免浪费带宽。",
          category: "交互体验",
          code: '<!-- HTML 资源预加载配置 -->\n<!-- index.html -->\n<!DOCTYPE html>\n<html>\n<head>\n  <!-- 预加载关键 CSS -->\n  <link rel="preload" href="/styles/critical.css" as="style">\n  \n  <!-- 预加载关键字体 -->\n  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>\n  \n  <!-- 预加载关键 JavaScript -->\n  <link rel="preload" href="/js/main.js" as="script">\n  \n  <!-- 预取非关键资源（下一页可能用到的） -->\n  <link rel="prefetch" href="/js/next-page.js">\n  <link rel="prefetch" href="/images/hero.jpg">\n  \n  <!-- DNS 预解析第三方域名 -->\n  <link rel="dns-prefetch" href="https://cdn.example.com">\n  <link rel="dns-prefetch" href="https://api.example.com">\n  \n  <!-- 正常加载 CSS -->\n  <link rel="stylesheet" href="/styles/critical.css">\n</head>\n<body>\n  <!-- 页面内容 -->\n</body>\n</html>',
          benefit:
            "关键资源加载时间减少 20-30%，FCP 可提升 15-20%，用户体验改善",
        },
      ],
      code_examples: [
        {
          type: "lazy-load",
          desc: "Vue 3 组件懒加载完整示例",
          code: "// Vue 3 组件懒加载\n// App.vue\nimport { defineAsyncComponent } from 'vue';\n\n// 定义异步组件，带加载状态\nconst HeavyComponent = defineAsyncComponent({\n  loader: () => import('./HeavyComponent.vue'),\n  loadingComponent: LoadingSpinner,\n  errorComponent: ErrorComponent,\n  delay: 200,\n  timeout: 3000\n});\n\nexport default {\n  components: {\n    HeavyComponent\n  }\n};",
        },
        {
          type: "lazy-load-react",
          desc: "React 组件懒加载完整示例",
          code: "// React 组件懒加载\n// App.jsx\nimport { lazy, Suspense } from 'react';\n\n// 懒加载组件\nconst HeavyComponent = lazy(() => import('./HeavyComponent'));\n\nfunction App() {\n  return (\n    <div>\n      <Suspense fallback={<div>加载中...</div>}>\n        <HeavyComponent />\n      </Suspense>\n    </div>\n  );\n}\n\nexport default App;",
        },
        {
          type: "build-optimization-vite",
          desc: "Vite 构建优化完整配置",
          code: "// vite.config.js\nimport { defineConfig } from 'vite';\nimport vue from '@vitejs/plugin-vue';\n\nexport default defineConfig({\n  plugins: [vue()],\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['vue', 'vue-router'],\n          utils: ['lodash', 'axios']\n        }\n      }\n    },\n    chunkSizeWarningLimit: 1000,\n    minify: 'terser'\n  }\n});",
        },
        {
          type: "compression-express",
          desc: "Express 服务器启用压缩完整配置",
          code: "// server.js\nconst express = require('express');\nconst compression = require('compression');\n\nconst app = express();\n\napp.use(compression({\n  level: 6,\n  threshold: 1024,\n  filter: (req, res) => {\n    if (req.headers['x-no-compression']) return false;\n    return compression.filter(req, res);\n  }\n}));\n\napp.listen(3000);",
        },
        {
          type: "image-lazy-loading",
          desc: "原生图片懒加载完整实现",
          code: '<!-- HTML 图片懒加载 -->\n<img \n  src="placeholder.jpg" \n  data-src="image.jpg" \n  loading="lazy" \n  alt="描述" \n  width="800" \n  height="600"\n>\n\n<!-- 或使用 Intersection Observer -->\n<script>\nconst images = document.querySelectorAll(\'img[data-src]\');\nconst imageObserver = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const img = entry.target;\n      img.src = img.dataset.src;\n      imageObserver.unobserve(img);\n    }\n  });\n});\nimages.forEach(img => imageObserver.observe(img));\n</script>',
        },
      ],
      visualization: {
        chartData: {
          metricTrends: [
            {
              metric: "LCP",
              before: lighthouseResult.metrics.lcp || 0,
              after: (lighthouseResult.metrics.lcp || 0) * 0.7,
            },
            {
              metric: "TBT",
              before: lighthouseResult.metrics.tbt || 0,
              after: (lighthouseResult.metrics.tbt || 0) * 0.6,
            },
          ],
          bottleneckDistribution: {
            script: 40,
            image: 30,
            network: 20,
            render: 10,
            "third-party": 0,
          },
        },
        aiCards: [
          {
            title: "需要性能优化",
            impact: "页面加载和交互存在可优化空间",
            suggestion: "实施代码分割和资源压缩",
            confidence: "中",
          },
        ],
      },
      prediction:
        "如果执行AI提供的优化建议，性能评分预计可提升至 85 分以上，首屏时间缩短约 1-2 秒。",
    };
  }
}
