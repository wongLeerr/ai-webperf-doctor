<template>
  <div class="border-l-4 p-4 rounded bg-green-50 border-green-500">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg font-bold">#{{ index }}</span>
          <span class="px-2 py-1 rounded text-xs font-semibold" :class="getPriorityBadgeColor()">
            {{ getPriorityText() }}
          </span>
        </div>
        <h3 class="text-lg font-semibold mb-2">{{ recommendation.title }}</h3>
        <p class="text-gray-700 mb-2">{{ recommendation.description }}</p>
        <p class="text-sm text-green-700">
          <strong>预期改进：</strong> {{ recommendation.expectedImprovement }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  recommendation: Object,
  index: Number,
});

function getPriorityText() {
  switch (props.recommendation.priority) {
    case 'high':
      return '高优先级';
    case 'medium':
      return '中优先级';
    case 'low':
      return '低优先级';
    default:
      return '优先级';
  }
}

function getPriorityBadgeColor() {
  switch (props.recommendation.priority) {
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