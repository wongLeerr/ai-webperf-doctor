<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-gray-800 mb-2">
          🏥 AI WebPerf Doctor
        </h1>
        <p class="text-xl text-gray-600">
          AI-powered web performance analyzer using Lighthouse & GPT-4o-mini
        </p>
      </header>

      <!-- URL Input Section -->
      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex gap-4">
          <input
            v-model="url"
            type="text"
            placeholder="Enter website URL (e.g., https://example.com)"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="analyze"
            :disabled="loading"
          />
          <button
            @click="analyze"
            :disabled="loading || !url"
            class="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {{ loading ? 'Analyzing...' : 'Analyze' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Analyzing website performance...</p>
      </div>

      <!-- Results -->
      <div v-if="results && !loading" class="space-y-6">
        <!-- Performance Score -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Performance Score</h2>
          <div class="text-center">
            <div class="inline-block relative">
              <div class="text-6xl font-bold" :class="getScoreColor(results.lighthouse.score)">
                {{ results.lighthouse.score }}
              </div>
              <div class="text-gray-500">/ 100</div>
            </div>
          </div>
        </div>

        <!-- Metrics Chart -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Core Web Vitals</h2>
          <div class="h-64">
            <v-chart :option="chartOption" class="w-full h-full" />
          </div>
        </div>

        <!-- Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="LCP"
            value="Largest Contentful Paint"
            :metric="results.lighthouse.metrics.lcp"
            unit="ms"
            :good="2500"
            :poor="4000"
          />
          <MetricCard
            title="FID"
            value="First Input Delay"
            :metric="results.lighthouse.metrics.fid"
            unit="ms"
            :good="100"
            :poor="300"
          />
          <MetricCard
            title="CLS"
            value="Cumulative Layout Shift"
            :metric="results.lighthouse.metrics.cls"
            unit=""
            :good="0.1"
            :poor="0.25"
          />
        </div>

        <!-- AI Analysis Summary -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">🤖 AI Analysis Summary</h2>
          <p class="text-gray-700 leading-relaxed">{{ results.aiAnalysis.summary }}</p>
        </div>

        <!-- Performance Issues -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Performance Issues</h2>
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
          <h2 class="text-2xl font-bold mb-4">Optimization Recommendations</h2>
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
        <div v-if="results.aiAnalysis.codeExamples.length > 0" class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold mb-4">Code Examples</h2>
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
            📄 Export PDF Report
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import VChart from 'vue-echarts';
import axios from 'axios';
import MetricCard from './components/MetricCard.vue';
import IssueCard from './components/IssueCard.vue';
import RecommendationCard from './components/RecommendationCard.vue';
import CodeExampleCard from './components/CodeExampleCard.vue';

use([
  CanvasRenderer,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
]);

const url = ref('');
const loading = ref(false);
const results = ref(null);

const chartOption = computed(() => {
  if (!results.value) return null;

  const metrics = results.value.lighthouse.metrics;
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    xAxis: {
      type: 'category',
      data: ['LCP', 'FID', 'CLS', 'FCP', 'TBT'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Value',
        type: 'bar',
        data: [
          metrics.lcp?.toFixed(0) || 0,
          metrics.fid?.toFixed(0) || 0,
          metrics.cls?.toFixed(3) || 0,
          metrics.fcp?.toFixed(0) || 0,
          metrics.tbt?.toFixed(0) || 0,
        ],
        itemStyle: {
          color: (params) => {
            if (params.dataIndex === 0) return '#3b82f6'; // LCP
            if (params.dataIndex === 1) return '#8b5cf6'; // FID
            if (params.dataIndex === 2) return '#ec4899'; // CLS
            if (params.dataIndex === 3) return '#10b981'; // FCP
            return '#f59e0b'; // TBT
          },
        },
      },
    ],
  };
});

function getScoreColor(score) {
  if (score >= 90) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

async function analyze() {
  if (!url.value) return;

  loading.value = true;
  results.value = null;

  try {
    const response = await axios.post('/api/analyze', {
      url: url.value,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    results.value = response.data;
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
    const statusCode = error.response?.status;
    alert(`Error ${statusCode ? `(${statusCode})` : ''}: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
}

async function exportPDF() {
  if (!results.value) return;

  try {
    const response = await axios.post(
      '/api/export',
      results.value,
      {
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `webperf-report-${Date.now()}.pdf`;
    link.click();
  } catch (error) {
    alert(`Error exporting PDF: ${error.message}`);
  }
}
</script>