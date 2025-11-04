<template>
  <div class="h-80">
    <v-chart :option="chartOption" class="w-full h-full" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { PieChart as EChartsPieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';

use([CanvasRenderer, EChartsPieChart, TitleComponent, TooltipComponent, LegendComponent]);

const props = defineProps({
  distribution: Object,
});

const chartOption = computed(() => {
  if (!props.distribution || Object.keys(props.distribution).length === 0) {
    return {
      title: {
        text: '暂无瓶颈分布数据',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#999', fontSize: 14 },
      },
    };
  }

  const labels = {
    script: '脚本执行',
    image: '图片加载',
    network: '网络请求',
    render: '渲染阻塞',
    'third-party': '第三方资源',
  };

  const colors = {
    script: '#ff6b6b',
    image: '#4ecdc4',
    network: '#45b7d1',
    render: '#f9ca24',
    'third-party': '#6c5ce7',
  };

  const data = Object.entries(props.distribution)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: labels[key] || key,
      value: value,
      itemStyle: { color: colors[key] || '#95a5a6' },
    }));

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}% ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}%',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
          },
        },
        data: data,
      },
    ],
  };
});
</script>

