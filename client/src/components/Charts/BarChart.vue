<template>
  <div class="h-96">
    <v-chart :option="chartOption" class="w-full h-full" />
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
  slowRequests: Array,
});

const chartOption = computed(() => {
  if (!props.slowRequests || props.slowRequests.length === 0) return null;

  const data = props.slowRequests.slice(0, 10).map((req, index) => ({
    name: req.url.length > 30 ? req.url.substring(0, 30) + '...' : req.url,
    value: req.duration,
    size: req.size,
  }));

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const param = params[0];
        const req = props.slowRequests[param.dataIndex];
        return `${param.name}<br/>耗时: ${param.value}ms<br/>大小: ${(req.size / 1024).toFixed(2)} KB`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '耗时 (ms)',
    },
    series: [
      {
        type: 'bar',
        data: data.map(d => d.value),
        itemStyle: {
          color: (params) => {
            const value = params.value;
            if (value > 2000) return '#ef4444';
            if (value > 1000) return '#f59e0b';
            return '#10b981';
          },
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}ms',
        },
      },
    ],
  };
});
</script>
