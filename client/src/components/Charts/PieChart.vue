<template>
  <div class="h-96">
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
  resources: Object,
});

const chartOption = computed(() => {
  if (!props.resources) return null;

  const data = [
    { value: props.resources.jsTotalSize || 0, name: 'JavaScript' },
    { value: props.resources.cssTotalSize || 0, name: 'CSS' },
    { value: props.resources.imageTotalSize || 0, name: '图片' },
    { value: props.resources.thirdPartySize || 0, name: '第三方资源' },
  ].filter(item => item.value > 0);

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} KB ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c} KB',
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
