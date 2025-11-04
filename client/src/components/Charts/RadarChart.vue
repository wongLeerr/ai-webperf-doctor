<template>
  <div class="h-96">
    <v-chart :option="chartOption" class="w-full h-full" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { RadarChart as EChartsRadarChart } from 'echarts/charts';
import { RadarComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, EChartsRadarChart, RadarComponent, LegendComponent, TooltipComponent]);

const props = defineProps({
  metrics: Object,
});

const chartOption = computed(() => {
  if (!props.metrics) return null;

  // 归一化指标到 0-100 范围
  const normalize = (value, max) => {
    if (!value || value === 0) return 0;
    return Math.min(100, (1 - value / max) * 100);
  };

  const data = [
    {
      value: [
        normalize(props.metrics.lcp, 4000), // LCP: 4000ms = 0分
        normalize(props.metrics.fid, 300), // FID: 300ms = 0分
        100 - (props.metrics.cls || 0) * 400, // CLS: 0.25 = 0分
        normalize(props.metrics.fcp, 3000), // FCP: 3000ms = 0分
        normalize(props.metrics.tbt, 600), // TBT: 600ms = 0分
      ],
      name: '性能指标',
    },
  ];

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const labels = ['LCP', 'FID', 'CLS', 'FCP', 'TBT'];
        return `${labels[params.dataIndex]}: ${params.value.toFixed(1)}分`;
      },
    },
    radar: {
      indicator: [
        { name: 'LCP', max: 100 },
        { name: 'FID', max: 100 },
        { name: 'CLS', max: 100 },
        { name: 'FCP', max: 100 },
        { name: 'TBT', max: 100 },
      ],
      center: ['50%', '50%'],
      radius: '70%',
    },
    series: [
      {
        type: 'radar',
        data: data,
        areaStyle: {
          color: 'rgba(255, 107, 0, 0.3)',
        },
        lineStyle: {
          color: '#ff6b00',
        },
        itemStyle: {
          color: '#ff6b00',
        },
      },
    ],
  };
});
</script>
