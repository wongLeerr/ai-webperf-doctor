<template>
  <div class="h-96 overflow-auto">
    <v-chart :option="chartOption" class="w-full" :style="{ minHeight: chartHeight + 'px' }" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart as EChartsBarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, EChartsBarChart, TitleComponent, TooltipComponent, GridComponent]);

const props = defineProps({
  timeline: Array,
});

const chartOption = computed(() => {
  if (!props.timeline || props.timeline.length === 0) return null;

  const data = props.timeline.slice(0, 30); // 限制显示数量
  const maxTime = Math.max(...data.map(d => d.endTime));

  const colors = {
    'javascript': '#f59e0b',
    'image': '#10b981',
    'css': '#3b82f6',
    'text': '#8b5cf6',
    'unknown': '#6b7280',
  };

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const param = params[0];
        const item = data[param.dataIndex];
        return `${item.name}<br/>URL: ${item.url.substring(0, 50)}...<br/>开始: ${item.startTime.toFixed(0)}ms<br/>结束: ${item.endTime.toFixed(0)}ms<br/>耗时: ${item.duration.toFixed(0)}ms<br/>大小: ${(item.size / 1024).toFixed(2)} KB<br/>类型: ${item.type}`;
      },
    },
    grid: {
      left: '20%',
      right: '10%',
      bottom: '10%',
      top: '5%',
    },
    xAxis: {
      type: 'value',
      name: '时间 (ms)',
      max: maxTime,
    },
    yAxis: {
      type: 'category',
      data: data.map(d => d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name),
      inverse: true,
      axisLabel: {
        fontSize: 10,
      },
    },
    series: [
      {
        type: 'bar',
        data: data.map((item) => ({
          value: [item.startTime, item.endTime],
          itemStyle: {
            color: colors[item.type] || colors.unknown,
          },
        })),
        barWidth: 15,
        barGap: '10%',
      },
    ],
  };
});

const chartHeight = computed(() => {
  if (!props.timeline) return 400;
  return Math.min(400 + props.timeline.slice(0, 30).length * 20, 1200);
});
</script>