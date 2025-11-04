<template>
  <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-2">
      <h4 class="font-semibold text-gray-800">{{ card.title }}</h4>
      <span 
        class="px-2 py-1 rounded text-xs font-semibold"
        :class="getConfidenceClass(card.confidence)"
      >
        {{ card.confidence === '高' ? '高置信度' : card.confidence === '中' ? '中置信度' : '低置信度' }}
      </span>
    </div>
    <p class="text-sm text-gray-700 mb-2">
      <span class="font-medium text-red-600">影响：</span>{{ card.impact }}
    </p>
    <p class="text-sm text-gray-700">
      <span class="font-medium text-green-600">建议：</span>{{ card.suggestion }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  card: {
    type: Object,
    required: true,
  },
});

function getConfidenceClass(confidence) {
  if (confidence === '高') return 'bg-green-100 text-green-700';
  if (confidence === '中') return 'bg-yellow-100 text-yellow-700';
  return 'bg-gray-100 text-gray-700';
}
</script>

