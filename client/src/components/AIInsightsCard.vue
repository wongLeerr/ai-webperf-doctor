<template>
  <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
    <h3 class="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2">
      <span>🧠</span> AI 智能洞察
    </h3>
    
    <!-- 主要瓶颈 -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-semibold text-purple-700">主要瓶颈</span>
        <span class="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">关键问题</span>
      </div>
      <p class="text-gray-800 bg-white p-3 rounded border-l-4 border-red-500">
        {{ insights.main_bottleneck }}
      </p>
    </div>

    <!-- 根因分析 -->
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-semibold text-purple-700">潜在根因</span>
        <span class="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">{{ insights.root_causes?.length || 0 }} 项</span>
      </div>
      <ul class="space-y-2">
        <li 
          v-for="(cause, index) in insights.root_causes" 
          :key="index"
          class="flex items-start gap-2 bg-white p-3 rounded border-l-4 border-orange-400"
        >
          <span class="text-orange-500 mt-1">•</span>
          <span class="text-gray-800">{{ cause }}</span>
        </li>
      </ul>
    </div>

    <!-- Quick Wins -->
    <div>
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-semibold text-purple-700">快速优化</span>
        <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">立即可做</span>
      </div>
      <ul class="space-y-2">
        <li 
          v-for="(win, index) in insights.quick_wins" 
          :key="index"
          class="flex items-start gap-2 bg-white p-3 rounded border-l-4 border-green-400"
        >
          <span class="text-green-500 mt-1">✓</span>
          <span class="text-gray-800">{{ win }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({
  insights: {
    type: Object,
    required: true,
  },
});
</script>

