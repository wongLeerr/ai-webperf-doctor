<template>
  <div class="h-96">
    <v-chart :option="chartOption" class="w-full h-full" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart as EChartsLineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, EChartsLineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

const props = defineProps({
  mainThread: Object,
});

const chartOption = computed(() => {
  if (!props.mainThread) return null;

  const data = [
    { name: '脚本执行', value: props.mainThread.scriptEvaluation || 0 },
    { name: '布局计算', value: props.mainThread.layout || 0 },
    { name: '绘制时间', value: props.mainThread.paint || 0 },
    { name: '样式计算', value: props.mainThread.style || 0 },
    { name: '其他', value: props.mainThread.other || 0 },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0];
        const percentage = total > 0 ? ((param.value / total) * 100).toFixed(1) : 0;
        return `${param.name}<br/>耗时: ${param.value.toFixed(0)}ms (${percentage}%)`;
      },
    },
    legend: {
      data: data.map(d => d.name),
      bottom: 0,
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
    },
    yAxis: {
      type: 'value',
      name: '耗时 (ms)',
    },
    series: [
      {
        name: '主线程耗时',
        type: 'line',
        data: data.map(d => d.value),
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 107, 0, 0.3)' },
              { offset: 1, color: 'rgba(255, 107, 0, 0.1)' },
            ],
          },
        },
        itemStyle: {
          color: '#ff6b00',
        },
        lineStyle: {
          color: '#ff6b00',
          width: 3,
        },
      },
    ],
  };
});
</script>
