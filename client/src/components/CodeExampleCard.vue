<template>
  <div class="border rounded-lg p-4 bg-gray-50">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-lg font-bold">#{{ index }}</span>
      <span class="px-2 py-1 rounded text-xs bg-blue-200 text-blue-800 font-semibold">
        {{ example.language.toUpperCase() }}
      </span>
      <h3 class="text-lg font-semibold">{{ example.title }}</h3>
    </div>
    <p class="text-gray-700 mb-3">{{ example.description }}</p>
    <pre class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto"><code>{{ example.code }}</code></pre>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  example: Object,
  index: Number,
});
</script>