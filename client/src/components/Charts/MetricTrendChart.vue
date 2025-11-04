<template>
  <div class="h-80">
    <v-chart :option="chartOption" class="w-full h-full" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart as EChartsBarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, EChartsBarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent]);

const props = defineProps({
  trends: Array,
});

const chartOption = computed(() => {
  if (!props.trends || props.trends.length === 0) {
    return {
      title: {
        text: '暂无趋势数据',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#999', fontSize: 14 },
      },
    };
  }

  const metrics = props.trends.map(t => t.metric);
  const beforeValues = props.trends.map(t => t.before);
  const afterValues = props.trends.map(t => t.after);

  // 计算最大值和单位
  const maxValue = Math.max(...beforeValues, ...afterValues);
  const unit = maxValue >= 1000 ? 's' : 'ms';
  const divisor = maxValue >= 1000 ? 1000 : 1;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const before = params[0];
        const after = params[1];
        const metric = metrics[before.dataIndex];
        const beforeVal = (before.value / divisor).toFixed(2);
        const afterVal = (after.value / divisor).toFixed(2);
        const improvement = ((before.value - after.value) / before.value * 100).toFixed(1);
        return `
          <div style="text-align: left;">
            <strong>${metric}</strong><br/>
            优化前: ${beforeVal}${unit}<br/>
            优化后: ${afterVal}${unit}<br/>
            提升: ${improvement}%
          </div>
        `;
      },
    },
    legend: {
      data: ['优化前', '优化后'],
      top: 10,
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: '20%',
    },
    xAxis: {
      type: 'category',
      data: metrics,
      axisLabel: {
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: `时间 (${unit})`,
      axisLabel: {
        formatter: (value) => (value / divisor).toFixed(1) + unit,
      },
    },
    series: [
      {
        name: '优化前',
        type: 'bar',
        data: beforeValues.map(v => v / divisor),
        itemStyle: {
          color: '#ff6b6b',
        },
      },
      {
        name: '优化后',
        type: 'bar',
        data: afterValues.map(v => v / divisor),
        itemStyle: {
          color: '#51cf66',
        },
      },
    ],
  };
});
</script>

