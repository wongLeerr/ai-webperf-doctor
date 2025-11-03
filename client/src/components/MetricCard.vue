<template>
  <div class="bg-white rounded-lg shadow-lg p-6">
    <div class="text-sm font-semibold text-gray-500 mb-1">{{ title }}</div>
    <div class="text-lg text-gray-400 mb-3">{{ value }}</div>
    <div class="flex items-baseline gap-2">
      <span class="text-3xl font-bold" :class="getMetricColor()">
        {{ formatMetric(metric) }}
      </span>
      <span class="text-gray-500" v-if="unit">{{ unit }}</span>
    </div>
    <div class="mt-2 text-xs" :class="getStatusColor()">
      {{ getStatus() }}
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  title: String,
  value: String,
  metric: Number,
  unit: String,
  good: Number,
  poor: Number,
});

function formatMetric(val) {
  if (val === undefined || val === null) return '无数据';
  if (props.unit === '') return val.toFixed(3);
  return val.toFixed(0);
}

function getMetricColor() {
  if (props.metric === undefined || props.metric === null) return 'text-gray-400';
  if (props.metric <= props.good) return 'text-green-600';
  if (props.metric <= props.poor) return 'text-yellow-600';
  return 'text-red-600';
}

function getStatus() {
  if (props.metric === undefined || props.metric === null) return '无数据';
  if (props.metric <= props.good) return '✓ 良好';
  if (props.metric <= props.poor) return '⚠ 需要改进';
  return '✗ 较差';
}

function getStatusColor() {
  if (props.metric === undefined || props.metric === null) return 'text-gray-400';
  if (props.metric <= props.good) return 'text-green-600';
  if (props.metric <= props.poor) return 'text-yellow-600';
  return 'text-red-600';
}
</script>