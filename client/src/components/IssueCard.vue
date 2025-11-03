<template>
  <div class="border-l-4 p-4 rounded" :class="getBorderColor()">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg font-bold">#{{ index }}</span>
          <span class="px-2 py-1 rounded text-xs font-semibold" :class="getSeverityBadgeColor()">
            {{ getSeverityText() }}
          </span>
          <span class="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700">
            {{ issue.category }}
          </span>
        </div>
        <h3 class="text-lg font-semibold mb-2">{{ issue.title }}</h3>
        <p class="text-gray-700 mb-2">{{ issue.description }}</p>
        <p class="text-sm text-gray-600">
          <strong>影响：</strong> {{ issue.impact }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  issue: Object,
  index: Number,
});

function getSeverityText() {
  switch (props.issue.severity) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
    default:
      return '未知';
  }
}

function getBorderColor() {
  switch (props.issue.severity) {
    case 'high':
      return 'border-red-500 bg-red-50';
    case 'medium':
      return 'border-yellow-500 bg-yellow-50';
    case 'low':
      return 'border-primary bg-orange-50';
    default:
      return 'border-gray-500 bg-gray-50';
  }
}

function getSeverityBadgeColor() {
  switch (props.issue.severity) {
    case 'high':
      return 'bg-red-500 text-white';
    case 'medium':
      return 'bg-yellow-500 text-white';
    case 'low':
      return 'bg-primary text-white';
    default:
      return 'bg-gray-500 text-white';
  }
}
</script>