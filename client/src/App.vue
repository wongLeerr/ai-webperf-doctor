<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-gray-800 mb-2">
          🏥 AI 网页性能诊断工具
        </h1>
        <p class="text-xl text-gray-600">
          基于 Lighthouse 和 DDAI 的智能网页性能分析平台
        </p>
      </header>

      <!-- URL Input Section -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex gap-4">
          <input
            v-model="url"
            type="text"
            placeholder="请输入网站 URL（例如：https://example.com）"
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
              <div class="text-3xl font-bold" :class="getScoreColor(results.lighthouse.scores?.performance || results.lighthouse.score)">
                {{ results.lighthouse.scores?.performance || results.lighthouse.score }}
              </div>
              <div class="text-gray-500 text-sm">性能</div>
            </div>
            <div v-if="results.lighthouse.scores?.accessibility" class="text-center">
              <div class="text-3xl font-bold text-blue-600">
                {{ results.lighthouse.scores.accessibility }}
              </div>
              <div class="text-gray-500 text-sm">可访问性</div>
            </div>
            <div v-if="results.lighthouse.scores?.['best-practices']" class="text-center">
              <div class="text-3xl font-bold text-purple-600">
                {{ results.lighthouse.scores['best-practices'] }}
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
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">🤖 AI 分析摘要</h2>
          <p class="text-gray-700 leading-relaxed text-lg">
            {{ results.aiAnalysis.summary }}
          </p>
          <div v-if="results.aiAnalysis.prediction" class="mt-4 p-4 bg-blue-50 rounded-lg">
            <p class="text-blue-800">
              <strong>性能预测：</strong>{{ results.aiAnalysis.prediction }}
            </p>
          </div>
        </div>

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
                  <div class="text-lg font-semibold">{{ results.lighthouse.resources?.jsTotalSize || 0 }} KB</div>
                </div>
                <div class="p-3 bg-green-50 rounded">
                  <div class="text-xs text-gray-600">CSS</div>
                  <div class="text-lg font-semibold">{{ results.lighthouse.resources?.cssTotalSize || 0 }} KB</div>
                </div>
                <div class="p-3 bg-yellow-50 rounded">
                  <div class="text-xs text-gray-600">图片</div>
                  <div class="text-lg font-semibold">{{ results.lighthouse.resources?.imageTotalSize || 0 }} KB</div>
                </div>
                <div class="p-3 bg-purple-50 rounded">
                  <div class="text-xs text-gray-600">第三方</div>
                  <div class="text-lg font-semibold">{{ results.lighthouse.resources?.thirdPartySize || 0 }} KB</div>
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
              <div class="text-3xl font-bold">{{ results.lighthouse.requests?.total || 0 }}</div>
            </div>
            <div class="p-4 bg-orange-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">第三方请求</div>
              <div class="text-3xl font-bold">{{ results.lighthouse.requests?.thirdParty || 0 }}</div>
            </div>
            <div class="p-4 bg-blue-50 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">第三方占比</div>
              <div class="text-3xl font-bold">{{ results.lighthouse.requests?.thirdPartyRatio || 0 }}%</div>
            </div>
          </div>
          <div v-if="results.lighthouse.requests?.slowRequests?.length > 0">
            <h3 class="text-xl font-semibold mb-4">慢请求 Top 10</h3>
            <BarChart :slowRequests="results.lighthouse.requests.slowRequests" />
          </div>
        </div>

        <!-- Main Thread Analysis -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">主线程耗时分析</h2>
          <LineChart :mainThread="results.lighthouse.mainThread" />
        </div>

        <!-- Waterfall Timeline -->
        <div v-if="results.lighthouse.timeline?.length > 0" class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">资源加载时间线（瀑布流）</h2>
          <WaterfallChart :timeline="results.lighthouse.timeline" />
        </div>

        <!-- Performance Problems -->
        <div v-if="results.aiAnalysis.problems?.length > 0" class="bg-white rounded-lg shadow-lg p-6">
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
        <div v-if="results.aiAnalysis.suggestions?.length > 0" class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">优化建议与代码示例</h2>
          <div class="space-y-4">
            <SuggestionCard
              v-for="(suggestion, index) in results.aiAnalysis.suggestions"
              :key="index"
              :suggestion="suggestion"
            />
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
import VChart from "vue-echarts";
import axios from "axios";
import MetricCard from "./components/MetricCard.vue";
import ProblemCard from "./components/ProblemCard.vue";
import SuggestionCard from "./components/SuggestionCard.vue";
import RadarChart from "./components/Charts/RadarChart.vue";
import PieChart from "./components/Charts/PieChart.vue";
import BarChart from "./components/Charts/BarChart.vue";
import LineChart from "./components/Charts/LineChart.vue";
import WaterfallChart from "./components/Charts/WaterfallChart.vue";

use([CanvasRenderer]);

const url = ref("");
const loading = ref(false);
const results = ref(null);

function getScoreColor(score) {
  if (score >= 90) return "text-green-600";
  if (score >= 50) return "text-yellow-600";
  return "text-red-600";
}

async function analyze() {
  if (!url.value) return;

  loading.value = true;
  results.value = null;

  try {
    const response = await axios.post(
      "/api/analyze",
      {
        url: url.value,
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