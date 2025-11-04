<template>
  <div class="border-l-4 p-4 rounded bg-green-50 border-green-500">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h3 class="text-lg font-semibold mb-2">{{ suggestion.title }}</h3>
        <p class="text-gray-700 mb-2">{{ suggestion.desc }}</p>
        <p v-if="suggestion.benefit" class="text-sm text-green-700 mb-2">
          <strong>预期收益：</strong> {{ suggestion.benefit }}
        </p>
        <div v-if="suggestion.code" class="mt-3">
          <pre class="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto text-sm"><code>{{ suggestion.code }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  suggestion: Object,
});
</script>
