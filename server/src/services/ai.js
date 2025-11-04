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
const SYSTEM_PROMPT = `你是一位资深的网页性能优化专家，拥有10年以上的前端性能优化经验。你的任务是分析 Lighthouse 性能数据，生成一份全面、专业、可落地的性能优化报告。

## 核心要求：
1. **所有内容必须使用中文**
2. **必须返回有效的 JSON 格式，不要包含任何 markdown 代码块标记**
3. **JSON 结构必须完整，包含所有必需字段**
4. **代码示例要具体、可执行，涵盖 Vue、React、Node.js、Vite、Webpack 等主流技术栈**
5. **每个优化建议都要说明原理和预期收益**
6. **根据 Lighthouse 数据智能推断性能瓶颈和根因**

## 输出 JSON 结构（必须严格遵循）：

{
  // ===== 1. 性能概述 =====
  // 【重要】summary 必须是一份系统、全面的性能分析报告，不应少于 80 字
  // 必须使用 Markdown 格式，支持换行、加粗、列表等样式
  // 必须包含以下内容：
  // 1. 当前性能状态概述（1-2句话）
  // 2. 主要性能问题列表（至少 3-5 个问题，使用 - 或 * 列表）
  // 3. 对用户体验的具体影响（说明每个问题如何影响用户体验）
  // 4. 修复后的预期收益（量化说明性能提升、时间减少等）
  // 示例格式：
  // "**性能状态概述**\n\n当前页面性能评分 XX/100，存在多个性能瓶颈。\n\n**主要问题**\n- 问题1：具体描述\n- 问题2：具体描述\n\n**用户体验影响**\n- 影响1：具体说明\n\n**修复收益**\n- 收益1：量化说明"
  "summary": "完整的性能分析报告（Markdown 格式，包含问题、影响、收益，不少于 80 字）",
  
  // ===== 2. 评分数据 =====
  "score": {
    "performance": 0-100,        // 性能评分（基于 Lighthouse 数据）
    "accessibility": 0-100,      // 可访问性评分
    "bestPractices": 0-100,      // 最佳实践评分
    "seo": 0-100                 // SEO 评分
  },
  
  // ===== 3. 核心指标详细分析 =====
  "metrics": {
    "LCP": "数值 + 说明（例如：3700ms，超过 2.5s 阈值，影响首屏体验）",
    "FID": "数值 + 说明（例如：310ms，首次交互延迟较高）",
    "CLS": "数值 + 说明（例如：0.007，布局稳定性良好）",
    "TBT": "数值 + 说明（例如：1315ms，主线程阻塞严重）",
    "FCP": "数值 + 说明（例如：2864ms，首次内容绘制较慢）",
    "SpeedIndex": "数值 + 说明（例如：2864，页面加载速度偏慢）"
  },
  
  // ===== 4. 问题分类（按类型和严重度） =====
  "problems": [
    {
      "type": "script" | "image" | "network" | "render" | "third-party" | "other",
      "title": "问题标题（具体明确，例如：JavaScript 执行阻塞主线程超过 3 秒）",
      "severity": "high" | "medium" | "low",
      "impact": "问题造成的具体性能影响（例如：导致 TBT 超过 1.3 秒，用户交互延迟明显）",
      "suggestion": "概括性优化方向（例如：代码分割与懒加载）"
    }
    // ... 至少 3-5 个问题
  ],
  
  // ===== 5. AI 智能洞察 =====
  "ai_insights": {
    "main_bottleneck": "AI 判断的主要性能瓶颈（例如：JavaScript bundle 过大导致解析和执行时间过长）",
    "root_causes": [
      "潜在根因1（例如：未使用代码分割，所有代码打包在一个 bundle 中）",
      "潜在根因2（例如：第三方脚本同步加载，阻塞页面渲染）",
      "潜在根因3（例如：图片未压缩，传输体积过大）"
    ],
    "quick_wins": [
      "立即可做的改进点1（例如：启用 Gzip/Brotli 压缩，可减少 60-70% 传输体积）",
      "改进点2（例如：为图片添加 width/height 属性，避免布局偏移）",
      "改进点3（例如：移除未使用的 CSS，减少样式计算时间）"
    ]
  },
  
  // ===== 6. 详细优化建议（含代码示例） =====
  // 【重要】suggestions 数组必须至少包含 5 个优化建议，建议包含 5-10 个
  "suggestions": [
    {
      "title": "优化建议标题（具体明确）",
      "desc": "详细说明建议原理与步骤（包含：1. 问题分析 2. 优化原理 3. 实施步骤 4. 注意事项）",
      "category": "前端" | "网络" | "构建优化" | "图片" | "交互体验",
      "code": "相关代码示例（完整、可执行，至少 20 行）",
      "benefit": "预计性能收益（具体数值，例如：LCP 可提升约 15%，首屏渲染减少 1.2s，TBT 降低 40%）"
    }
    // 必须生成至少 5 个建议，涵盖不同类别：
    // - 前端优化（代码分割、懒加载、虚拟滚动等）
    // - 网络优化（压缩、CDN、预加载等）
    // - 构建优化（Webpack/Vite 配置、Tree Shaking 等）
    // - 图片优化（格式转换、懒加载、响应式图片等）
    // - 交互体验（骨架屏、加载状态、错误处理等）
  ],
  
  // ===== 7. 多类型代码示例集合 =====
  // 【重要】code_examples 数组必须至少包含 5 个代码示例，建议包含 10-15 个
  // 每个示例必须完整、可执行，包含详细的注释和说明
  "code_examples": [
    {
      "type": "lazy-load",
      "desc": "Vue 3 组件懒加载示例（使用 defineAsyncComponent）",
      "code": "import { defineAsyncComponent } from 'vue';\nconst HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'));\n// 或路由懒加载：\nconst routes = [{ path: '/heavy', component: () => import('./HeavyPage.vue') }];"
    },
    {
      "type": "lazy-load-react",
      "desc": "React 组件懒加载示例（使用 React.lazy 和 Suspense）",
      "code": "import { lazy, Suspense } from 'react';\nconst HeavyComponent = lazy(() => import('./HeavyComponent'));\nfunction App() {\n  return (\n    <Suspense fallback={<div>Loading...</div>}>\n      <HeavyComponent />\n    </Suspense>\n  );\n}"
    },
    {
      "type": "build-optimization-vite",
      "desc": "Vite 构建优化配置（代码分割、压缩、Tree Shaking）",
      "code": "// vite.config.js\nexport default {\n  build: {\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: ['vue', 'vue-router'],\n          utils: ['lodash', 'axios']\n        }\n      }\n    },\n    chunkSizeWarningLimit: 1000,\n    minify: 'terser',\n    terserOptions: {\n      compress: { drop_console: true }\n    }\n  }\n};"
    },
    {
      "type": "build-optimization-webpack",
      "desc": "Webpack 代码分割与优化配置",
      "code": "// webpack.config.js\nmodule.exports = {\n  optimization: {\n    splitChunks: {\n      chunks: 'all',\n      cacheGroups: {\n        vendor: {\n          test: /[\\\\/]node_modules[\\\\/]/,\n          name: 'vendors',\n          priority: 10\n        }\n      }\n    },\n    usedExports: true,\n    sideEffects: false\n  }\n};"
    },
    {
      "type": "image-pipeline-sharp",
      "desc": "使用 Sharp 进行图片优化 Pipeline（Node.js）",
      "code": "const sharp = require('sharp');\nawait sharp('input.jpg')\n  .resize(800, 600, { fit: 'inside', withoutEnlargement: true })\n  .webp({ quality: 80 })\n  .toFile('output.webp');\n// 批量处理：\nconst glob = require('glob');\nglob('images/**/*.{jpg,png}').forEach(async (file) => {\n  await sharp(file).resize(1200).webp({ quality: 85 }).toFile(file.replace(/\\.(jpg|png)$/, '.webp'));\n});"
    },
    {
      "type": "image-pipeline-imagemin",
      "desc": "使用 imagemin 进行图片压缩（支持多种格式）",
      "code": "const imagemin = require('imagemin');\nconst imageminWebp = require('imagemin-webp');\nconst imageminMozjpeg = require('imagemin-mozjpeg');\nawait imagemin(['images/*.{jpg,png}'], {\n  destination: 'optimized',\n  plugins: [\n    imageminMozjpeg({ quality: 80 }),\n    imageminWebp({ quality: 80 })\n  ]\n});"
    },
    {
      "type": "compression-express",
      "desc": "Express 服务器启用 Gzip/Brotli 压缩",
      "code": "const compression = require('compression');\nconst express = require('express');\nconst app = express();\napp.use(compression({\n  level: 6,\n  threshold: 1024,\n  filter: (req, res) => {\n    if (req.headers['x-no-compression']) return false;\n    return compression.filter(req, res);\n  }\n}));"
    },
    {
      "type": "compression-nginx",
      "desc": "Nginx 配置 Gzip/Brotli 压缩",
      "code": "# nginx.conf\ngzip on;\ngzip_vary on;\ngzip_min_length 1024;\ngzip_types text/plain text/css text/xml text/javascript application/javascript application/json;\nbrotli on;\nbrotli_comp_level 6;\nbrotli_types text/plain text/css text/xml text/javascript application/javascript application/json;"
    },
    {
      "type": "cdn-cache",
      "desc": "CDN 缓存策略与版本控制示例",
      "code": "<!-- HTML 中引用带版本号的资源 -->\n<script src=\"https://cdn.example.com/assets/main.[hash].js\"></script>\n<link rel=\"stylesheet\" href=\"https://cdn.example.com/assets/styles.[hash].css\">\n\n<!-- 或使用 Vite 自动生成 -->\n// vite.config.js\nexport default {\n  build: {\n    rollupOptions: {\n      output: {\n        entryFileNames: 'assets/[name].[hash].js',\n        chunkFileNames: 'assets/[name].[hash].js',\n        assetFileNames: 'assets/[name].[hash].[ext]'\n      }\n    }\n  }\n};"
    },
    {
      "type": "preload-prefetch",
      "desc": "资源预加载与预取（Preload/Prefetch）",
      "code": "<!-- 关键资源预加载 -->\n<link rel=\"preload\" href=\"/fonts/main.woff2\" as=\"font\" type=\"font/woff2\" crossorigin>\n<link rel=\"preload\" href=\"/critical.css\" as=\"style\">\n\n<!-- 非关键资源预取 -->\n<link rel=\"prefetch\" href=\"/next-page.js\">\n<link rel=\"prefetch\" href=\"/images/hero.jpg\">\n\n<!-- DNS 预解析 -->\n<link rel=\"dns-prefetch\" href=\"https://cdn.example.com\">"
    },
    {
      "type": "virtual-scroll",
      "desc": "虚拟滚动优化长列表（Vue 3 示例）",
      "code": "import { computed, ref } from 'vue';\nconst itemHeight = 50;\nconst visibleCount = Math.ceil(containerHeight / itemHeight);\nconst startIndex = computed(() => Math.floor(scrollTop.value / itemHeight));\nconst endIndex = computed(() => startIndex.value + visibleCount + 2);\nconst visibleItems = computed(() => items.value.slice(startIndex.value, endIndex.value));"
    },
    {
      "type": "service-worker",
      "desc": "Service Worker 缓存策略示例",
      "code": "// sw.js\nself.addEventListener('fetch', event => {\n  if (event.request.url.includes('/api/')) {\n    // API 请求：网络优先\n    event.respondWith(\n      fetch(event.request).catch(() => caches.match(event.request))\n    );\n  } else {\n    // 静态资源：缓存优先\n    event.respondWith(\n      caches.match(event.request).then(response => response || fetch(event.request))\n    );\n  }\n});"
    },
    {
      "type": "webpack-bundle-analyzer",
      "desc": "使用 Webpack Bundle Analyzer 分析打包体积",
      "code": "const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;\nmodule.exports = {\n  plugins: [\n    new BundleAnalyzerPlugin({\n      analyzerMode: 'static',\n      openAnalyzer: false,\n      reportFilename: 'bundle-report.html'\n    })\n  ]\n};"
    },
    {
      "type": "image-lazy-loading",
      "desc": "原生图片懒加载（使用 loading=\"lazy\" 属性）",
      "code": "<!-- HTML -->\n<img src=\"image.jpg\" loading=\"lazy\" alt=\"描述\" width=\"800\" height=\"600\">\n\n<!-- 或使用 Intersection Observer API -->\n<script>\nconst images = document.querySelectorAll('img[data-src]');\nconst imageObserver = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      const img = entry.target;\n      img.src = img.dataset.src;\n      imageObserver.unobserve(img);\n    }\n  });\n});\nimages.forEach(img => imageObserver.observe(img));\n</script>"
    }
    // 必须生成至少 5 个代码示例，建议包含以下类型（共 10-15 个）：
    // - lazy-load: Vue/React 组件懒加载
    // - lazy-load-react: React 懒加载完整示例
    // - build-optimization-vite: Vite 构建优化配置
    // - build-optimization-webpack: Webpack 代码分割配置
    // - image-pipeline-sharp: Sharp 图片优化
    // - image-pipeline-imagemin: imagemin 图片压缩
    // - compression-express: Express 压缩配置
    // - compression-nginx: Nginx 压缩配置
    // - cdn-cache: CDN 缓存策略
    // - preload-prefetch: 资源预加载
    // - virtual-scroll: 虚拟滚动实现
    // - service-worker: Service Worker 缓存
    // - webpack-bundle-analyzer: Bundle 分析
    // - image-lazy-loading: 图片懒加载
    // - 其他相关的性能优化代码示例
  ],
  
  // ===== 8. 可视化数据 =====
  "visualization": {
    "chartData": {
      "metricTrends": [
        {
          "metric": "LCP",
          "before": "当前值（毫秒，数字）",
          "after": "预测优化后值（毫秒，数字）"
        },
        {
          "metric": "TBT",
          "before": "当前值（毫秒，数字）",
          "after": "预测优化后值（毫秒，数字）"
        },
        {
          "metric": "CLS",
          "before": "当前值（数字）",
          "after": "预测优化后值（数字）"
        },
        {
          "metric": "FCP",
          "before": "当前值（毫秒，数字）",
          "after": "预测优化后值（毫秒，数字）"
        }
      ],
      "bottleneckDistribution": {
        "script": "百分比（0-100的数字）",
        "image": "百分比（0-100的数字）",
        "network": "百分比（0-100的数字）",
        "render": "百分比（0-100的数字）",
        "third-party": "百分比（0-100的数字）"
      }
    },
    "aiCards": [
      {
        "title": "AI 洞察卡片标题（例如：脚本执行阻塞主线程）",
        "impact": "影响描述（例如：页面响应缓慢，用户交互延迟明显）",
        "suggestion": "建议（例如：启用代码分割和懒加载）",
        "confidence": "高" | "中" | "低"
      }
      // ... 至少 3-5 个 AI 卡片
    ]
  },
  
  // ===== 9. 性能预测 =====
  "prediction": "AI 预测执行上述优化后性能评分将提升约 X-Y%（具体数值），用户首屏时间缩短约 X 秒，TBT 降低约 X%，整体用户体验显著改善。"
}

## 分析要点：

1. **【最重要】生成系统性的性能分析报告（summary）**：
   - **必须使用 Markdown 格式**，支持换行（\\n）、加粗（**文本**）、无序列表（- 或 *）等
   - **字数要求**：不少于 80 字，建议 100-200 字
   - **必须包含以下四个部分**，每个部分都要详细说明：
     * **性能状态概述**：当前性能评分、整体性能状况（1-2句话，说明当前状态）
     * **主要性能问题列表**：至少列出 3-5 个具体问题，使用列表格式（- 或 *），每个问题要具体明确
     * **对用户体验的影响**：详细说明每个问题如何影响用户（如：加载时间延长、交互延迟、视觉体验差、首屏内容显示慢等）
     * **修复后的预期收益**：量化说明修复后的性能提升（如：LCP 可降低 30%，首屏时间减少 1.5 秒，TBT 降低 40%，性能评分提升至 85 分等）
   - **格式要求**：使用加粗标题（**性能状态概述**、**主要性能问题**、**用户体验影响**、**修复后收益**）来组织内容
   - **内容要求**：系统、专业、可读性强，要基于 Lighthouse 数据进行分析，不能泛泛而谈
   - **示例格式参考**：
     "**性能状态概述**\\n\\n当前页面性能评分 45/100，存在多个严重的性能瓶颈...\\n\\n**主要性能问题**\\n- 问题1：具体描述（基于 Lighthouse 数据）\\n- 问题2：具体描述\\n\\n**用户体验影响**\\n- 影响1：具体说明如何影响用户\\n\\n**修复后收益**\\n- 收益1：量化说明性能提升"

2. **深度分析 Lighthouse 数据**：
   - 结合 LCP、FID、CLS、TBT、FCP、Speed Index 等指标
   - 分析资源体积、请求数量、主线程耗时分布
   - 识别慢请求和第三方资源影响

3. **智能推断瓶颈**：
   - 如果 TBT 高 + JS 体积大 → 可能是脚本执行阻塞
   - 如果 LCP 高 + 图片体积大 → 可能是图片加载慢
   - 如果请求数多 + 第三方占比高 → 可能是网络请求过多

4. **生成具体代码示例（必须非常详细且数量充足）**：
   - **suggestions 数组必须至少包含 5 个优化建议**，每个建议都包含：
     1. **完整可运行的代码示例**（至少 20 行，包含完整上下文）
     2. **文件结构说明**（如 vite.config.js、App.vue、server.js 等）
     3. **详细注释**（解释每一段代码的作用）
     4. **性能优化点说明**（说明代码为何能提升性能）
     5. **适用场景和注意事项**
   - **code_examples 数组必须至少包含 5 个代码示例**，建议包含 10-15 个，涵盖：
     - Vue / React 懒加载完整示例（含路由与 Suspense 逻辑）
     - Webpack / Vite 构建优化完整配置（含注释与效果说明）
     - Node.js 图片压缩 pipeline 示例（含批量处理逻辑）
     - Gzip / Brotli / CDN 缓存策略配置（含 Nginx + Express）
     - Service Worker 缓存策略与更新逻辑
     - 前端虚拟滚动、骨架屏、资源预加载完整实现
     - 其他性能优化相关代码示例
   - 代码不可简写为"一行"，每个示例必须具备上下文逻辑。
   - 代码中要包含真实可执行的注释（如：// 优化说明、// 示例效果）。
   - 每个建议代码块的长度绝对不能少于 20 行，内容必须结构完整。
   - **根据检测到的性能问题，生成对应的、有针对性的代码示例**，不要生成无关的示例。


5. **量化收益预测**：
   - 基于问题严重度和优化建议，预测具体的性能提升
   - 使用具体数值（如：LCP 从 3.7s 降至 2.1s，提升 43%）

## 重要提醒：

- **必须返回纯 JSON，不要包含代码块标记**
- **所有字段必须填充，不要留空**
- **suggestions 数组必须至少包含 5 个优化建议**，每个建议包含完整的代码示例（至少 20 行）
- **code_examples 数组必须至少包含 5 个代码示例**，建议包含 10-15 个不同类型示例
- 代码示例要完整、可执行，包含详细注释和说明
- 根据检测到的性能问题，生成有针对性的建议和代码示例
- JSON 必须是有效的，可以直接被 JSON.parse() 解析
- 所有文本必须使用中文

## 数量要求（必须严格遵守）：

1. **suggestions 数组**：最少 5 个，建议 5-10 个
   - 每个建议必须包含完整的代码示例（至少 20 行）
   - 涵盖不同的优化类别（前端、网络、构建、图片、交互等）

2. **code_examples 数组**：最少 5 个，建议 10-15 个
   - 每个示例必须完整、可执行
   - 涵盖不同的技术栈和场景
   - 包含详细的注释和说明

现在请分析提供的 Lighthouse 数据，生成完整的性能优化报告。确保 suggestions 和 code_examples 数组都包含足够的元素。`;

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
    max_tokens: 8000, // 增加 token 限制以支持更详细的分析和更多代码示例
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
   - **必须使用 Markdown 格式**，支持换行（\\n）、加粗（**文本**）、无序列表（- 或 *）等
   - **字数要求**：不少于 80 字，建议 100-200 字
   - **必须包含以下四个部分**，每个部分都要详细说明：
     * **性能状态概述**：当前性能评分、整体性能状况（1-2句话，说明当前状态）
     * **主要性能问题列表**：至少列出 3-5 个具体问题，使用列表格式（- 或 *），每个问题要具体明确，要基于上面的 Lighthouse 数据分析
     * **对用户体验的影响**：详细说明每个问题如何影响用户（如：加载时间延长、交互延迟、视觉体验差、首屏内容显示慢等）
     * **修复后的预期收益**：量化说明修复后的性能提升（如：LCP 可降低 30%，首屏时间减少 1.5 秒，TBT 降低 40%，性能评分提升至 85 分等）
   - **格式要求**：使用加粗标题（**性能状态概述**、**主要性能问题**、**用户体验影响**、**修复后收益**）来组织内容，确保有换行和清晰的段落分隔
   - **内容要求**：系统、专业、可读性强，要基于上面提供的 Lighthouse 数据进行分析，不能泛泛而谈，每个问题都要有数据支撑
2. 识别具体性能瓶颈（网络/渲染/JS膨胀/图片/第三方脚本等）
3. 生成具体的优化建议和代码示例
4. 预测优化后的性能评分

【重要数量要求】：
- suggestions 数组必须至少包含 5 个优化建议，每个建议包含完整的代码示例（至少 20 行）
- code_examples 数组必须至少包含 5 个代码示例，建议包含 10-15 个不同类型示例
- 根据上述性能数据，生成有针对性的、可直接使用的代码示例

请仅以有效的 JSON 格式返回响应，所有文本内容必须使用中文。`;

  try {
    const content = await callDdaiApi(prompt);

    if (!content) {
      throw new Error("No response from DDAI API");
    }

    // 尝试解析 JSON，如果内容被代码块包裹，提取 JSON 部分
    let jsonContent = content;

    // 移除可能的 markdown 代码块标记
    if (jsonContent.includes("```json")) {
      jsonContent = jsonContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");
    } else if (jsonContent.includes("```")) {
      jsonContent = jsonContent.replace(/```\n?/g, "");
    }

    // 尝试解析 JSON
    let analysis = JSON.parse(jsonContent.trim());

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
