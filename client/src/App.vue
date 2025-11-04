<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-gray-800 mb-2">
          🏥 AI 网页性能诊断工具
        </h1>
        <p class="text-xl text-gray-600">
          基于 Lighthouse 和 DeepSeek AI 的智能网页性能分析平台
        </p>
      </header>

      <!-- URL Input Section -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex gap-4">
          <input
            v-model="url"
            type="text"
            placeholder="请输入网站 URL（例如：dedao.cn、www.dedao.cn 或 https://www.dedao.cn）"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            @keyup.enter="analyze"
            :disabled="loading"
          />
          <button
            @click="analyze"
            :disabled="loading || !url"
            class="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {{ loading ? "分析中..." : "开始分析" }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"
        ></div>
        <p class="mt-4 text-gray-600">正在分析网站性能...</p>
      </div>

      <!-- Results -->
      <div v-if="results && !loading" class="space-y-6">
        <!-- Performance Score Card -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">性能评分</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
              <div
                class="text-3xl font-bold"
                :class="
                  getScoreColor(
                    results.lighthouse.scores?.performance ||
                      results.lighthouse.score
                  )
                "
              >
                {{
                  results.lighthouse.scores?.performance ||
                  results.lighthouse.score
                }}
              </div>
              <div class="text-gray-500 text-sm">性能</div>
            </div>
            <div
              v-if="results.lighthouse.scores?.accessibility"
              class="text-center"
            >
              <div class="text-3xl font-bold text-blue-600">
                {{ results.lighthouse.scores.accessibility }}
              </div>
              <div class="text-gray-500 text-sm">可访问性</div>
            </div>
            <div
              v-if="results.lighthouse.scores?.['best-practices']"
              class="text-center"
            >
              <div class="text-3xl font-bold text-purple-600">
                {{ results.lighthouse.scores["best-practices"] }}
              </div>
              <div class="text-gray-500 text-sm">最佳实践</div>
            </div>
            <div v-if="results.lighthouse.scores?.seo" class="text-center">
              <div class="text-3xl font-bold text-green-600">
                {{ results.lighthouse.scores.seo }}
              </div>
              <div class="text-gray-500 text-sm">SEO</div>
            </div>
          </div>
        </div>

        <!-- AI Analysis Summary -->
        <div
          class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border border-blue-200"
        >
          <h2
            class="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2"
          >
            <span>🤖</span> AI 分析摘要
          </h2>
          <div
            class="text-gray-700 leading-relaxed text-base mb-4 bg-white p-6 rounded-lg border-l-4 border-blue-500"
          >
            <div class="whitespace-pre-line">{{ results.aiAnalysis.summary }}</div>
          </div>
          <div
            v-if="results.aiAnalysis.prediction"
            class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
          >
            <div class="flex items-start gap-2">
              <span class="text-2xl">📈</span>
              <div>
                <p class="text-sm font-semibold text-green-700 mb-1">
                  性能预测
                </p>
                <p class="text-gray-800">{{ results.aiAnalysis.prediction }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Score Details -->
        <div
          v-if="results.aiAnalysis.score"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 class="text-2xl font-bold mb-4 text-gray-800">AI 评分详情</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div
              class="text-center p-4 rounded-lg"
              :class="getScoreBgColor(results.aiAnalysis.score.performance)"
            >
              <div
                class="text-4xl font-bold mb-2"
                :class="getScoreTextColor(results.aiAnalysis.score.performance)"
              >
                {{ results.aiAnalysis.score.performance }}
              </div>
              <div class="text-sm font-semibold text-gray-700">性能</div>
              <div class="text-xs text-gray-500 mt-1">Performance</div>
            </div>
            <div
              class="text-center p-4 rounded-lg"
              :class="getScoreBgColor(results.aiAnalysis.score.accessibility)"
            >
              <div
                class="text-4xl font-bold mb-2"
                :class="
                  getScoreTextColor(results.aiAnalysis.score.accessibility)
                "
              >
                {{ results.aiAnalysis.score.accessibility }}
              </div>
              <div class="text-sm font-semibold text-gray-700">可访问性</div>
              <div class="text-xs text-gray-500 mt-1">Accessibility</div>
            </div>
            <div
              class="text-center p-4 rounded-lg"
              :class="getScoreBgColor(results.aiAnalysis.score.bestPractices)"
            >
              <div
                class="text-4xl font-bold mb-2"
                :class="
                  getScoreTextColor(results.aiAnalysis.score.bestPractices)
                "
              >
                {{ results.aiAnalysis.score.bestPractices }}
              </div>
              <div class="text-sm font-semibold text-gray-700">最佳实践</div>
              <div class="text-xs text-gray-500 mt-1">Best Practices</div>
            </div>
            <div
              class="text-center p-4 rounded-lg"
              :class="getScoreBgColor(results.aiAnalysis.score.seo)"
            >
              <div
                class="text-4xl font-bold mb-2"
                :class="getScoreTextColor(results.aiAnalysis.score.seo)"
              >
                {{ results.aiAnalysis.score.seo }}
              </div>
              <div class="text-sm font-semibold text-gray-700">SEO</div>
              <div class="text-xs text-gray-500 mt-1">Search Engine</div>
            </div>
          </div>
        </div>

        <!-- AI Metrics Detail -->
        <MetricsDetailCard
          v-if="results.aiAnalysis.metrics"
          :metrics="results.aiAnalysis.metrics"
        />

        <!-- AI Insights -->
        <AIInsightsCard
          v-if="results.aiAnalysis.ai_insights"
          :insights="results.aiAnalysis.ai_insights"
        />

        <!-- Radar Chart - Core Web Vitals -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">核心 Web 指标雷达图</h2>
          <RadarChart :metrics="results.lighthouse.metrics" />
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="LCP"
            value="最大内容绘制"
            :metric="results.lighthouse.metrics.lcp"
            unit="ms"
            :good="2500"
            :poor="4000"
          />
          <MetricCard
            title="FID"
            value="首次输入延迟"
            :metric="results.lighthouse.metrics.fid"
            unit="ms"
            :good="100"
            :poor="300"
          />
          <MetricCard
            title="CLS"
            value="累积布局偏移"
            :metric="results.lighthouse.metrics.cls"
            unit=""
            :good="0.1"
            :poor="0.25"
          />
        </div>

        <!-- Resource Statistics -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">资源体积分析</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <PieChart :resources="results.lighthouse.resources" />
            </div>
            <div class="space-y-4">
              <div class="p-4 bg-gray-50 rounded-lg">
                <div class="text-sm text-gray-600 mb-2">总资源大小</div>
                <div class="text-2xl font-bold text-orange-600">
                  {{ results.lighthouse.resources?.totalSize || 0 }} KB
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-blue-50 rounded">
                  <div class="text-xs text-gray-600">JavaScript</div>
                  <div class="text-lg font-semibold">
                    {{ results.lighthouse.resources?.jsTotalSize || 0 }} KB
                  </div>
                </div>
                <div class="p-3 bg-green-50 rounded">
                  <div class="text-xs text-gray-600">CSS</div>
                  <div class="text-lg font-semibold">
                    {{ results.lighthouse.resources?.cssTotalSize || 0 }} KB
                  </div>
                </div>
                <div class="p-3 bg-yellow-50 rounded">
                  <div class="text-xs text-gray-600">图片</div>
                  <div class="text-lg font-semibold">
                    {{ results.lighthouse.resources?.imageTotalSize || 0 }} KB
                  </div>
                </div>
                <div class="p-3 bg-purple-50 rounded">
                  <div class="text-xs text-gray-600">第三方</div>
                  <div class="text-lg font-semibold">
                    {{ results.lighthouse.resources?.thirdPartySize || 0 }} KB
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Request Statistics -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">请求统计</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="p-4 bg-gray-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">总请求数</div>
              <div class="text-3xl font-bold">
                {{ results.lighthouse.requests?.total || 0 }}
              </div>
            </div>
            <div class="p-4 bg-orange-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">第三方请求</div>
              <div class="text-3xl font-bold">
                {{ results.lighthouse.requests?.thirdParty || 0 }}
              </div>
            </div>
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">第三方占比</div>
              <div class="text-3xl font-bold">
                {{ results.lighthouse.requests?.thirdPartyRatio || 0 }}%
              </div>
            </div>
          </div>
          <div v-if="results.lighthouse.requests?.slowRequests?.length > 0">
            <h3 class="text-xl font-semibold mb-4">慢请求 Top 10</h3>
            <BarChart
              :slowRequests="results.lighthouse.requests.slowRequests"
            />
          </div>
        </div>

        <!-- Main Thread Analysis -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">主线程耗时分析</h2>
          <LineChart :mainThread="results.lighthouse.mainThread" />
        </div>

        <!-- Waterfall Timeline -->
        <div
          v-if="results.lighthouse.timeline?.length > 0"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 class="text-2xl font-bold mb-4">资源加载时间线（瀑布流）</h2>
          <WaterfallChart :timeline="results.lighthouse.timeline" />
        </div>

        <!-- Performance Problems -->
        <div
          v-if="results.aiAnalysis.problems?.length > 0"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 class="text-2xl font-bold mb-4">性能瓶颈识别</h2>
          <div class="space-y-4">
            <ProblemCard
              v-for="(problem, index) in results.aiAnalysis.problems"
              :key="index"
              :problem="problem"
            />
          </div>
        </div>

        <!-- Optimization Suggestions -->
        <div
          v-if="results.aiAnalysis.suggestions?.length > 0"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 class="text-2xl font-bold mb-4 text-gray-800">
            AI 优化建议与代码示例
          </h2>
          <div class="space-y-4">
            <SuggestionCard
              v-for="(suggestion, index) in results.aiAnalysis.suggestions"
              :key="index"
              :suggestion="suggestion"
            />
          </div>
        </div>

        <!-- Code Examples Collection -->
        <div
          v-if="results.aiAnalysis.code_examples?.length > 0"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 class="text-2xl font-bold mb-4 text-gray-800">💻 代码示例库</h2>
          <p class="text-gray-600 mb-4 text-sm">
            以下代码示例可直接复制使用，涵盖多种优化场景
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CodeExampleCard
              v-for="(example, index) in results.aiAnalysis.code_examples"
              :key="index"
              :example="example"
            />
          </div>
        </div>

        <!-- Visualization Data -->
        <div v-if="results.aiAnalysis.visualization" class="space-y-6">
          <!-- Metric Trends Chart -->
          <div
            v-if="
              results.aiAnalysis.visualization.chartData?.metricTrends?.length >
              0
            "
            class="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 class="text-2xl font-bold mb-4 text-gray-800">
              📊 性能趋势预测
            </h2>
            <p class="text-gray-600 mb-4 text-sm">展示优化前后的性能指标对比</p>
            <MetricTrendChart
              :trends="results.aiAnalysis.visualization.chartData.metricTrends"
            />
          </div>

          <!-- Bottleneck Distribution -->
          <div
            v-if="
              results.aiAnalysis.visualization.chartData?.bottleneckDistribution
            "
            class="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 class="text-2xl font-bold mb-4 text-gray-800">
              🎯 性能瓶颈分布
            </h2>
            <p class="text-gray-600 mb-4 text-sm">AI 分析的各类型瓶颈占比</p>
            <BottleneckChart
              :distribution="
                results.aiAnalysis.visualization.chartData
                  .bottleneckDistribution
              "
            />
          </div>

          <!-- AI Cards -->
          <div
            v-if="results.aiAnalysis.visualization.aiCards?.length > 0"
            class="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 class="text-2xl font-bold mb-4 text-gray-800">
              🎴 AI 智能卡片
            </h2>
            <p class="text-gray-600 mb-4 text-sm">
              AI 基于数据生成的智能洞察卡片
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AICard
                v-for="(card, index) in results.aiAnalysis.visualization
                  .aiCards"
                :key="index"
                :card="card"
              />
            </div>
          </div>
        </div>

        <!-- Export Button -->
        <div class="text-center">
          <button
            @click="exportPDF"
            class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
          >
            📄 导出 PDF 报告
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  BarChart as EChartsBarChart,
  PieChart as EChartsPieChart,
  LineChart as EChartsLineChart,
  RadarChart as EChartsRadarChart,
} from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import axios from "axios";
import MetricCard from "./components/MetricCard.vue";
import ProblemCard from "./components/ProblemCard.vue";
import SuggestionCard from "./components/SuggestionCard.vue";
import AIInsightsCard from "./components/AIInsightsCard.vue";
import MetricsDetailCard from "./components/MetricsDetailCard.vue";
import CodeExampleCard from "./components/CodeExampleCard.vue";
import AICard from "./components/AICard.vue";
import RadarChart from "./components/Charts/RadarChart.vue";
import PieChart from "./components/Charts/PieChart.vue";
import BarChart from "./components/Charts/BarChart.vue";
import LineChart from "./components/Charts/LineChart.vue";
import WaterfallChart from "./components/Charts/WaterfallChart.vue";
import MetricTrendChart from "./components/Charts/MetricTrendChart.vue";
import BottleneckChart from "./components/Charts/BottleneckChart.vue";

use([
  CanvasRenderer,
  EChartsBarChart,
  EChartsPieChart,
  EChartsLineChart,
  EChartsRadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent,
]);

const url = ref("");
const loading = ref(false);
const results = ref(null);

function getScoreColor(score) {
  if (score >= 90) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

function getScoreBgColor(score) {
  if (score >= 90) return "bg-green-50 border-2 border-green-200";
  if (score >= 75) return "bg-blue-50 border-2 border-blue-200";
  if (score >= 50) return "bg-yellow-50 border-2 border-yellow-200";
  return "bg-red-50 border-2 border-red-200";
}

function getScoreTextColor(score) {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

/**
 * 规范化 URL，自动补全协议
 * 支持：dedao.cn, www.dedao.cn, https://www.dedao.cn/
 */
function normalizeUrl(inputUrl) {
  if (!inputUrl) return "";

  // 去除首尾空格
  let normalized = inputUrl.trim();

  // 如果已经有协议（http:// 或 https://），直接返回
  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  // 如果没有协议，添加 https://
  return `https://${normalized}`;
}

async function analyze() {
  if (!url.value) return;

  loading.value = true;
  results.value = null;

  try {
    // 规范化 URL（自动补全协议）
    const normalizedUrl = normalizeUrl(url.value);

    const response = await axios.post(
      "/api/analyze",
      {
        url: normalizedUrl,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    results.value = response.data;
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;
    const statusCode = error.response?.status;
    alert(`错误 ${statusCode ? `(${statusCode})` : ""}: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
}

async function exportPDF() {
  if (!results.value) return;

  try {
    const response = await axios.post("/api/export", results.value, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `webperf-report-${Date.now()}.pdf`;
    link.click();
  } catch (error) {
    alert(`导出 PDF 时出错: ${error.message}`);
  }
}
</script>
