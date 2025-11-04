<template>
  <div class="border-l-4 p-4 rounded" :class="getBorderColor()">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 rounded text-xs font-semibold" :class="getSeverityBadgeColor()">
            {{ problem.severity === 'high' ? '高' : problem.severity === 'medium' ? '中' : '低' }}
          </span>
          <span class="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
            {{ getTypeLabel(problem.type) }}
          </span>
        </div>
        <h3 class="text-lg font-semibold mb-2">{{ problem.title }}</h3>
        <p class="text-gray-700 mb-2">{{ problem.impact }}</p>
        <p class="text-sm text-gray-600">
          <strong>建议：</strong> {{ problem.suggestion }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  problem: Object,
});

function getBorderColor() {
  switch (props.problem.severity) {
    case 'high':
      return 'border-red-500 bg-red-50';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50';
    case 'low':
      return 'border-blue-500 bg-blue-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
}

function getSeverityBadgeColor() {
  switch (props.problem.severity) {
    case 'high':
      return 'bg-red-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}

function getTypeLabel(type) {
  const labels = {
    'script': 'JavaScript',
    'image': '图片',
    'network': '网络',
    'render': '渲染',
    'third-party': '第三方',
    'other': '其他'
  };
  return labels[type] || type;
}
</script>
