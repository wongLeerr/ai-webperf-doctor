<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
    <div class="bg-gradient-to-r from-blue-500 to-purple-500 p-3">
      <div class="flex items-center justify-between">
        <span class="text-white font-semibold">{{ getTypeLabel(example.type) }}</span>
        <span class="text-xs text-blue-100 px-2 py-1 bg-white bg-opacity-20 rounded">{{ example.type }}</span>
      </div>
    </div>
    <div class="p-4">
      <p class="text-gray-700 mb-3 text-sm">{{ example.desc }}</p>
      <div class="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <pre class="text-green-400 text-sm font-mono"><code>{{ example.code }}</code></pre>
      </div>
      <button 
        @click="copyCode"
        class="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <span>📋</span>
        <span>复制代码</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  example: {
    type: Object,
    required: true,
  },
});

function getTypeLabel(type) {
  const labels = {
    'lazy-load': 'Vue 组件懒加载',
    'lazy-load-react': 'React 组件懒加载',
    'build-optimization-vite': 'Vite 构建优化',
    'build-optimization-webpack': 'Webpack 代码分割',
    'image-pipeline-sharp': 'Sharp 图片优化',
    'image-pipeline-imagemin': 'imagemin 图片压缩',
    'compression-express': 'Express 压缩',
    'compression-nginx': 'Nginx 压缩',
    'cdn-cache': 'CDN 缓存策略',
    'preload-prefetch': '资源预加载',
    'virtual-scroll': '虚拟滚动',
    'service-worker': 'Service Worker',
    'webpack-bundle-analyzer': 'Bundle 分析',
    'image-lazy-loading': '图片懒加载',
  };
  return labels[props.example.type] || props.example.type;
}

function copyCode() {
  navigator.clipboard.writeText(props.example.code).then(() => {
    alert('代码已复制到剪贴板！');
  });
}
</script>
