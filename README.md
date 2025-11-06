# 🏥 AI WebPerf Doctor

基于 Lighthouse 和 DeepSeek AI 的智能网页性能分析工具。自动分析网站性能，获取 AI 生成的深度洞察，并导出详细的 PDF 报告。

## ✨ 功能特性

- 🔍 **自动化性能分析**：使用 Lighthouse 捕获真实的性能指标数据
- 🤖 **AI 智能洞察**：DeepSeek API 分析性能数据并提供可执行的优化建议
- 📊 **可视化图表**：精美的 ECharts 图表展示核心 Web 指标（LCP、FID、CLS、TBT、FCP、SpeedIndex）
- 📝 **详细分析报告**：包含性能问题、优化建议、代码示例的全面分析
- 📄 **PDF 报告导出**：生成并下载详细的 PDF 性能分析报告
- 🎨 **现代化界面**：基于 Vue 3 和 Tailwind CSS 的美观用户界面
- 📈 **多维度分析**：性能评分、可访问性、最佳实践、SEO 等多维度评估
- 🔧 **代码示例**：提供可直接使用的优化代码示例

## 🛠️ 技术栈

### 前端
- **Vue 3** + JavaScript - 渐进式前端框架
- **Tailwind CSS** - 实用优先的 CSS 框架
- **ECharts** - 强大的数据可视化库
- **Vite** - 快速的前端构建工具
- **Vue Router** - 官方路由管理器
- **Axios** - HTTP 客户端

### 后端
- **Node.js** + **Express** + JavaScript - 服务端运行时和 Web 框架
- **Lighthouse** - Google 的性能分析工具
- **Chrome Launcher** - 无头浏览器启动器
- **DeepSeek API** - AI 智能分析服务
- **PDFKit** - PDF 文档生成库
- **dotenv** - 环境变量管理

## 📦 安装指南

### 环境要求

- **Node.js** 18+ 和 npm
- **Chrome/Chromium** 浏览器（Lighthouse 需要）
- **DeepSeek API Key**（从 [DeepSeek](https://www.deepseek.com/) 获取）

### 安装步骤

1. **克隆项目并安装依赖：**

```bash
# 克隆项目
git clone <repository-url>
cd ai-webperf-doctor

# 安装根目录依赖
npm install

# 安装所有工作区依赖（包括 client 和 server）
npm run install:all
```

2. **配置环境变量：**

在项目根目录创建 `.env` 文件：

```bash
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-reasoner

# 服务器端口（可选，默认 3001）
PORT=3001
```

**注意**：如果没有配置 `DEEPSEEK_API_KEY`，系统会使用默认的 API Key（仅用于测试，建议配置自己的 Key）。


## 🚀 使用方法

### 开发模式

同时启动前端和后端开发服务器：

```bash
npm run dev
```

这将启动：
- **前端**：`http://localhost:3000`（Vite 开发服务器）
- **后端 API**：`http://localhost:3001`（Express 服务器）

### 生产构建

```bash
# 构建前端项目
npm run build

# 启动生产服务器
cd server && npm start
```

### 单独运行

```bash
# 仅运行前端
npm run dev:client

# 仅运行后端
npm run dev:server
```

## 📖 使用指南

1. **打开应用**：在浏览器中访问 `http://localhost:3000`

2. **输入网站 URL**：在输入框中输入要分析的网站地址
   - 支持格式：`example.com`、`www.example.com` 或 `https://www.example.com`
   - 系统会自动补全协议（默认使用 https）

3. **开始分析**：点击"开始分析"按钮，等待分析完成（通常需要 30-60 秒）
   - 分析过程包括：Lighthouse 性能检测 → AI 智能分析
   - 界面会显示实时进度和已用时间

4. **查看分析结果**：
   - **性能评分**：整体性能分数（0-100）
   - **核心 Web 指标**：LCP、FID、CLS、TBT、FCP、SpeedIndex 等
   - **可视化图表**：指标趋势图、瓶颈分布图、瀑布流图等
   - **AI 分析摘要**：智能生成的性能概述
   - **性能问题**：按严重程度分类的问题列表（高/中/低）
   - **优化建议**：详细的优化方案和预期收益
   - **代码示例**：可直接使用的优化代码

5. **导出 PDF 报告**：点击"导出 PDF 报告"按钮，下载完整的性能分析报告

## 📊 API 接口文档

### POST `/api/analyze`

分析网站性能。

**请求体：**
```json
{
  "url": "https://example.com"
}
```

**响应示例：**
```json
{
  "lighthouse": {
    "url": "https://example.com",
    "score": 85,
    "scores": {
      "performance": 85,
      "accessibility": 90,
      "best-practices": 88,
      "seo": 92
    },
    "metrics": {
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1,
      "fcp": 1800,
      "tbt": 200,
      "speedIndex": 3000
    },
    "resources": {
      "jsTotalSize": 500,
      "cssTotalSize": 100,
      "imageTotalSize": 800,
      "thirdPartySize": 300,
      "totalSize": 1700
    },
    "requests": {
      "total": 50,
      "thirdParty": 10,
      "thirdPartyRatio": "20.0",
      "slowRequests": [...]
    },
    "mainThread": {
      "scriptEvaluation": 500,
      "layout": 100,
      "paint": 50
    },
    "timeline": [...],
    "audits": { ... }
  },
  "aiAnalysis": {
    "summary": "性能分析概述...",
    "score": {
      "performance": 85,
      "accessibility": 90,
      "bestPractices": 88,
      "seo": 92
    },
    "metrics": {
      "LCP": "2500ms - 略高于推荐值",
      "FID": "100ms - 可进一步优化",
      "CLS": "0.1 - 布局稳定性可改善"
    },
    "problems": [
      {
        "type": "script",
        "title": "JavaScript 执行时间较长",
        "severity": "high",
        "impact": "主线程阻塞时间 500ms，影响用户交互响应",
        "suggestion": "代码分割与懒加载"
      }
    ],
    "ai_insights": {
      "main_bottleneck": "主要瓶颈描述",
      "root_causes": ["根因1", "根因2"],
      "quick_wins": ["快速优化1", "快速优化2"]
    },
    "suggestions": [
      {
        "title": "优化建议标题",
        "desc": "详细说明",
        "category": "前端",
        "code": "可执行代码示例",
        "benefit": "预期收益"
      }
    ],
    "code_examples": [...],
    "visualization": {
      "chartData": {
        "metricTrends": [...],
        "bottleneckDistribution": {...}
      },
      "aiCards": [...]
    },
    "prediction": "性能提升预测"
  }
}
```

### POST `/api/export`

导出分析结果为 PDF 报告。

**请求体：** 完整的分析响应对象（来自 `/api/analyze`）

**响应：** PDF 文件流（Content-Type: application/pdf）

### GET `/health`

健康检查接口。

**响应：**
```json
{
  "status": "ok"
}
```

## 📁 项目结构

```
ai-webperf-doctor/
├── client/                      # Vue 3 前端应用
│   ├── src/
│   │   ├── components/          # Vue 组件
│   │   │   ├── Charts/          # 图表组件
│   │   │   │   ├── BarChart.vue           # 柱状图
│   │   │   │   ├── BottleneckChart.vue    # 瓶颈分布图
│   │   │   │   ├── LineChart.vue          # 折线图
│   │   │   │   ├── MetricTrendChart.vue   # 指标趋势图
│   │   │   │   ├── PieChart.vue           # 饼图
│   │   │   │   ├── RadarChart.vue         # 雷达图
│   │   │   │   └── WaterfallChart.vue     # 瀑布流图
│   │   │   ├── AICard.vue                 # AI 分析卡片
│   │   │   ├── AIInsightsCard.vue         # AI 洞察卡片
│   │   │   ├── CodeExampleCard.vue        # 代码示例卡片
│   │   │   ├── IssueCard.vue              # 问题卡片
│   │   │   ├── MetricCard.vue             # 指标卡片
│   │   │   ├── MetricsDetailCard.vue      # 指标详情卡片
│   │   │   ├── ProblemCard.vue            # 问题卡片
│   │   │   ├── RecommendationCard.vue      # 推荐卡片
│   │   │   └── SuggestionCard.vue         # 建议卡片
│   │   ├── App.vue              # 主应用组件
│   │   ├── main.js              # 应用入口
│   │   └── style.css            # 全局样式
│   ├── index.html               # HTML 模板
│   ├── package.json             # 前端依赖配置
│   ├── vite.config.js          # Vite 配置
│   ├── tailwind.config.js      # Tailwind CSS 配置
│   └── postcss.config.js       # PostCSS 配置
├── server/                      # Express 后端服务
│   ├── src/
│   │   ├── routes/              # API 路由
│   │   │   ├── analyze.js       # 性能分析路由
│   │   │   └── export.js        # PDF 导出路由
│   │   ├── services/            # 业务服务
│   │   │   ├── lighthouse.js    # Lighthouse 性能分析服务
│   │   │   └── ai.js            # DeepSeek AI 分析服务
│   │   └── index.js             # 服务器入口
│   ├── reports/                 # 分析报告存储目录（可选）
│   ├── fonts/                   # PDF 字体文件
│   └── package.json             # 后端依赖配置
├── .env                         # 环境变量配置（需自行创建）
├── package.json                 # 根工作区配置
└── README.md                    # 项目文档
```

## 🔧 配置说明

### 环境变量

在项目根目录的 `.env` 文件中配置：

- `DEEPSEEK_API_KEY`：DeepSeek API 密钥（必需，建议配置）
- `DEEPSEEK_MODEL`：使用的 DeepSeek 模型（默认：`deepseek-reasoner`）
- `PORT`：服务器端口（默认：`3001`）

**注意**：
- DeepSeek API 配置通过环境变量设置
- API 端点和模型设置可在 `server/src/services/ai.js` 中修改
- 如果未配置 `DEEPSEEK_API_KEY`，系统会使用默认的测试 Key（不推荐用于生产环境）

### Lighthouse 配置

Lighthouse 在无头 Chrome 模式下运行。配置可在 `server/src/services/lighthouse.js` 中修改：

- 修改 `chromeFlags` 调整 Chrome 启动参数
- 修改 `options` 调整 Lighthouse 分析选项
- 可配置分析的类别（performance、accessibility、best-practices、seo）

### 前端配置

- **Vite 配置**：`client/vite.config.js` - 构建和开发服务器配置
- **Tailwind 配置**：`client/tailwind.config.js` - 样式主题配置
- **API 地址**：在 `client/src/App.vue` 中配置后端 API 地址（默认：`http://localhost:3001`）

## 🐛 常见问题

### Chrome/Chromium 未找到

Lighthouse 需要 Chrome/Chromium 浏览器。安装方法：

```bash
# macOS
brew install chromium

# Linux (Ubuntu/Debian)
sudo apt-get install chromium-browser

# Linux (Fedora)
sudo dnf install chromium

# Windows
# 下载并安装 Chrome 或 Chromium
```

如果已安装 Chrome，确保 `chrome-launcher` 可以找到它。

### DeepSeek API 错误

**问题**：API 请求失败或返回错误

**解决方案**：
1. 检查 `.env` 文件中的 `DEEPSEEK_API_KEY` 是否正确配置
2. 验证网络连接，确保可以访问 `https://api.deepseek.com`
3. 确认 API Key 有效且有足够的余额
4. 查看服务器日志获取详细错误信息
5. 检查 API 模型名称是否正确（`deepseek-reasoner` 或 `deepseek-chat`）

### 端口已被占用

**问题**：启动时提示端口 3000 或 3001 已被占用

**解决方案**：

```bash
# macOS/Linux - 查找并终止占用端口的进程
lsof -ti:3001 | xargs kill

# 或者修改 .env 文件中的 PORT 配置
PORT=3002
```

### 分析超时

**问题**：分析过程耗时过长或超时

**解决方案**：
1. 检查网络连接，确保可以正常访问目标网站
2. 某些网站可能有反爬虫机制，导致 Lighthouse 无法正常分析
3. 查看服务器日志，确认 Lighthouse 是否正常启动
4. 尝试分析其他网站，确认是否为特定网站的问题

### PDF 导出失败

**问题**：点击导出 PDF 按钮后没有反应或报错

**解决方案**：
1. 检查浏览器控制台是否有错误信息
2. 确认分析结果数据是否完整
3. 查看服务器日志，确认 PDF 生成过程是否有错误
4. 检查 `server/fonts/` 目录是否存在字体文件（PDF 生成需要）

### 前端无法连接后端

**问题**：前端显示网络错误，无法获取分析结果

**解决方案**：
1. 确认后端服务已启动（`http://localhost:3001`）
2. 检查 `client/src/App.vue` 中的 API 地址配置
3. 确认 CORS 配置正确（后端已启用 `cors` 中间件）
4. 检查防火墙设置，确保端口未被阻止

## 📈 核心功能详解

### 性能指标分析

系统会分析以下核心 Web 指标：

- **LCP (Largest Contentful Paint)**：最大内容绘制时间，衡量首屏加载速度
- **FID (First Input Delay)**：首次输入延迟，衡量交互响应速度
- **CLS (Cumulative Layout Shift)**：累积布局偏移，衡量视觉稳定性
- **FCP (First Contentful Paint)**：首次内容绘制时间
- **TBT (Total Blocking Time)**：总阻塞时间，衡量主线程阻塞程度
- **SpeedIndex**：速度指数，衡量页面加载的视觉完成度

### AI 分析内容

DeepSeek AI 会生成以下分析内容：

1. **性能概述**：整体性能状态和主要问题总结
2. **问题诊断**：按严重程度分类的性能问题（高/中/低）
3. **根因分析**：识别性能瓶颈的根本原因
4. **优化建议**：5 个详细的优化方案，包含：
   - 优化原理说明
   - 实施步骤
   - 可执行代码示例（15-25 行）
   - 预期收益评估
5. **快速优化**：3 个可以快速实施的优化方案
6. **性能预测**：执行优化后的性能提升预测

### 可视化图表

- **指标趋势图**：展示优化前后的指标对比
- **瓶颈分布图**：展示不同类型资源对性能的影响
- **瀑布流图**：展示资源加载的时间线
- **雷达图**：多维度性能评分可视化
- **饼图**：资源类型分布统计

## 📝 许可证

MIT License

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📸 截图

运行应用后，可以在此处添加应用截图。

## 🙏 致谢

感谢以下优秀的开源项目和服务：

- [Lighthouse](https://github.com/GoogleChrome/lighthouse) - Google 的性能分析工具
- [DeepSeek](https://www.deepseek.com/) - 提供强大的 AI 分析能力
- [Vue.js](https://vuejs.org/) - 渐进式前端框架
- [ECharts](https://echarts.apache.org/) - 强大的数据可视化库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [PDFKit](https://pdfkit.org/) - PDF 文档生成库

**注意**：本项目仅供学习和研究使用。在生产环境中使用前，请确保：
- 配置自己的 DeepSeek API Key
- 遵守目标网站的 robots.txt 和使用条款
- 合理控制分析频率，避免对目标网站造成压力
