<template>
  <div class="border-l-4 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow" :class="getCategoryBgColor()">
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-gray-800">{{ suggestion.title }}</h3>
          <span v-if="suggestion.category" class="px-2 py-1 rounded text-xs font-semibold bg-white bg-opacity-50" :class="getCategoryBadgeColor()">
            {{ suggestion.category }}
          </span>
        </div>
        <p class="text-gray-700 mb-3 leading-relaxed">{{ suggestion.desc }}</p>
        <div v-if="suggestion.benefit" class="mb-3 p-3 bg-white bg-opacity-50 rounded-lg">
          <p class="text-sm font-semibold text-green-700 mb-1">📈 预期收益</p>
          <p class="text-gray-800">{{ suggestion.benefit }}</p>
        </div>
        <div v-if="suggestion.code" class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-gray-700">💻 代码示例</span>
            <button 
              @click="copyCode"
              class="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 bg-white bg-opacity-50 rounded"
            >
              <span>📋</span>
              <span>复制</span>
            </button>
          </div>
          <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-700"><code>{{ suggestion.code }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  suggestion: Object,
});

function getCategoryBgColor() {
  const category = props.suggestion.category || '其他';
  const colors = {
    '前端': 'bg-blue-50 border-blue-500',
    '网络': 'bg-purple-50 border-purple-500',
    '构建优化': 'bg-green-50 border-green-500',
    '图片': 'bg-yellow-50 border-yellow-500',
    '交互体验': 'bg-pink-50 border-pink-500',
  };
  return colors[category] || 'bg-gray-50 border-gray-500';
}

function getCategoryBadgeColor() {
  const category = props.suggestion.category || '其他';
  const colors = {
    '前端': 'text-blue-700',
    '网络': 'text-purple-700',
    '构建优化': 'text-green-700',
    '图片': 'text-yellow-700',
    '交互体验': 'text-pink-700',
  };
  return colors[category] || 'text-gray-700';
}

function copyCode() {
  if (props.suggestion.code) {
    navigator.clipboard.writeText(props.suggestion.code).then(() => {
      alert('代码已复制到剪贴板！');
    });
  }
}
</script>
