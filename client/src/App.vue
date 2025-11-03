<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-gray-800 mb-2">
          🏥 AI 网页性能诊断工具
        </h1>
        <p class="text-xl text-gray-600">
          基于 Lighthouse 和 GPT-4 的 AI 网页性能分析工具
        </p>
      </header>

      <!-- URL Input Section -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex gap-4">
          <input
            v-model="url"
            type="text"
            placeholder="请输入网站 URL（例如：https://example.com）"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="analyze"
            :disabled="loading"
          />
          <button
            @click="analyze"
            :disabled="loading || !url"
            class="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {{ loading ? "分析中..." : "开始分析" }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
        ></div>
        <p class="mt-4 text-gray-600">正在分析网站性能...</p>
      </div>

      <!-- Results -->
      <div v-if="results && !loading" class="space-y-6">
        <!-- Performance Score -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">性能评分</h2>
          <div class="text-center">
            <div class="inline-block relative">
              <div
                class="text-6xl font-bold"
                :class="getScoreColor(results.lighthouse.score)"
              >
                {{ results.lighthouse.score }}
              </div>
              <div class="text-gray-500">/ 100</div>
            </div>
          </div>
        </div>

        <!-- Metrics Chart -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">核心 Web 指标</h2>
          <div class="h-64">
            <v-chart :option="chartOption" class="w-full h-full" />
          </div>
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

        <!-- AI Analysis Summary -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">🤖 AI 分析摘要</h2>
          <p class="text-gray-700 leading-relaxed">
            {{ results.aiAnalysis.summary }}
          </p>
        </div>

        <!-- Performance Issues -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">性能问题</h2>
          <div class="space-y-4">
            <IssueCard
              v-for="(issue, index) in results.aiAnalysis.issues"
              :key="index"
              :issue="issue"
              :index="index + 1"
            />
          </div>
        </div>

        <!-- Recommendations -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">优化建议</h2>
          <div class="space-y-4">
            <RecommendationCard
              v-for="(rec, index) in results.aiAnalysis.recommendations"
              :key="index"
              :recommendation="rec"
              :index="index + 1"
            />
          </div>
        </div>

        <!-- Code Examples -->
        <div
          v-if="results.aiAnalysis.codeExamples.length > 0"
          class="bg-white rounded-lg shadow-lg p-6"
        >
          <h2 class="text-2xl font-bold mb-4">代码示例</h2>
          <div class="space-y-4">
            <CodeExampleCard
              v-for="(example, index) in results.aiAnalysis.codeExamples"
              :key="index"
              :example="example"
              :index="index + 1"
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
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import VChart from "vue-echarts";
import axios from "axios";
import MetricCard from "./components/MetricCard.vue";
import IssueCard from "./components/IssueCard.vue";
import RecommendationCard from "./components/RecommendationCard.vue";
import CodeExampleCard from "./components/CodeExampleCard.vue";

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const url = ref("");
const loading = ref(false);
const results = ref(null);

const chartOption = computed(() => {
  if (!results.value) return null;

  const metrics = results.value.lighthouse.metrics;
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "category",
      data: ["LCP", "FID", "CLS", "FCP", "TBT"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "数值",
        type: "bar",
        data: [
          metrics.lcp?.toFixed(0) || 0,
          metrics.fid?.toFixed(0) || 0,
          metrics.cls?.toFixed(3) || 0,
          metrics.fcp?.toFixed(0) || 0,
          metrics.tbt?.toFixed(0) || 0,
        ],
        itemStyle: {
          color: (params) => {
            if (params.dataIndex === 0) return "#ff6b00"; // LCP
            if (params.dataIndex === 1) return "#ff9933"; // FID
            if (params.dataIndex === 2) return "#ffb366"; // CLS
            if (params.dataIndex === 3) return "#ffcc99"; // FCP
            return "#ffe6cc"; // TBT
          },
        },
      },
    ],
  };
});

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
