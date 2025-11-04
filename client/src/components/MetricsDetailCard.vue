<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <h3 class="text-xl font-bold mb-4 text-gray-800">核心指标详细分析</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="(value, key) in metrics" 
        :key="key"
        class="border-l-4 p-4 rounded bg-gray-50"
        :class="getMetricBorderColor(key)"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-gray-700">{{ key }}</span>
          <span class="text-xs px-2 py-1 rounded" :class="getMetricStatusClass(value)">
            {{ getMetricStatus(value) }}
          </span>
        </div>
        <p class="text-sm text-gray-600">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metrics: {
    type: Object,
    required: true,
  },
});

function getMetricBorderColor(key) {
  const colors = {
    'LCP': 'border-blue-500',
    'FID': 'border-green-500',
    'CLS': 'border-purple-500',
    'TBT': 'border-red-500',
    'FCP': 'border-orange-500',
    'SpeedIndex': 'border-yellow-500',
  };
  return colors[key] || 'border-gray-500';
}

function getMetricStatus(value) {
  if (typeof value === 'string') {
    if (value.includes('良好') || value.includes('优秀')) return '良好';
    if (value.includes('可优化') || value.includes('可改善')) return '需优化';
    if (value.includes('较慢') || value.includes('严重') || value.includes('超过阈值')) return '需改进';
  }
  return '正常';
}

function getMetricStatusClass(value) {
  const status = getMetricStatus(value);
  if (status === '良好') return 'bg-green-100 text-green-700';
  if (status === '需优化') return 'bg-yellow-100 text-yellow-700';
  if (status === '需改进') return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
}
</script>

