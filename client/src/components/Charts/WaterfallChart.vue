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
  if (!props.timeline || props.timeline.length === 0) {
    return {
      title: {
        text: '暂无时间线数据',
        left: 'center',
        top: 'middle',
        textStyle: {
          color: '#999',
          fontSize: 14,
        },
      },
    };
  }

  const data = props.timeline.slice(0, 30); // 限制显示数量
  
  // 计算最大时间，并添加一些边距
  const maxTime = Math.max(...data.map(d => d.endTime || 0));
  const timeRange = maxTime > 0 ? maxTime * 1.1 : 1000; // 添加10%边距

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
        const urlDisplay = item.url.length > 60 ? item.url.substring(0, 60) + '...' : item.url;
        return `
          <div style="text-align: left;">
            <strong>${item.name}</strong><br/>
            URL: ${urlDisplay}<br/>
            开始时间: ${item.startTime.toFixed(2)}ms<br/>
            结束时间: ${item.endTime.toFixed(2)}ms<br/>
            耗时: ${item.duration.toFixed(2)}ms<br/>
            大小: ${item.size > 0 ? (item.size / 1024).toFixed(2) + ' KB' : '未知'}<br/>
            类型: ${item.type}
          </div>
        `;
      },
    },
    grid: {
      left: '25%',
      right: '10%',
      bottom: '10%',
      top: '5%',
    },
    xAxis: {
      type: 'value',
      name: '时间 (ms)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: timeRange,
      axisLabel: {
        formatter: (value) => {
          if (value >= 1000) {
            return (value / 1000).toFixed(1) + 's';
          }
          return value.toFixed(0) + 'ms';
        },
      },
    },
    yAxis: {
      type: 'category',
      data: data.map(d => {
        const name = d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name;
        return name;
      }),
      inverse: true,
      axisLabel: {
        fontSize: 10,
        overflow: 'truncate',
        width: 120,
      },
    },
    series: [
      {
        // 空白部分（从0到startTime）
        name: '等待',
        type: 'bar',
        stack: 'timeline',
        silent: true,
        itemStyle: {
          color: 'transparent',
        },
        data: data.map(item => item.startTime),
      },
      {
        // 实际加载部分（duration）
        name: '加载',
        type: 'bar',
        stack: 'timeline',
        data: data.map((item, index) => ({
          value: item.duration,
          itemStyle: {
            color: colors[item.type] || colors.unknown,
          },
        })),
        barWidth: 15,
        label: {
          show: false,
        },
      },
    ],
  };
});

const chartHeight = computed(() => {
  if (!props.timeline) return 400;
  return Math.min(400 + props.timeline.slice(0, 30).length * 20, 1200);
});
</script>