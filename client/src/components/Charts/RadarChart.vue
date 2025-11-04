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
  // 对于性能指标，值越小越好，所以使用反向映射
  const normalize = (value, good, poor) => {
    if (!value && value !== 0) return 0;
    if (value <= good) return 100; // 优秀
    if (value >= poor) return 0; // 差
    // 线性插值
    return Math.max(0, Math.min(100, ((poor - value) / (poor - good)) * 100));
  };

  // CLS 的特殊处理（越小越好，0.1以下为优秀，0.25以上为差）
  const normalizeCLS = (cls) => {
    if (!cls && cls !== 0) return 0;
    if (cls <= 0.1) return 100;
    if (cls >= 0.25) return 0;
    return Math.max(0, Math.min(100, ((0.25 - cls) / 0.15) * 100));
  };

  const lcpScore = normalize(props.metrics.lcp || 0, 2500, 4000); // LCP: 2.5s优秀, 4s差
  const fidScore = normalize(props.metrics.fid || 0, 100, 300); // FID: 100ms优秀, 300ms差
  const clsScore = normalizeCLS(props.metrics.cls || 0); // CLS: 0.1优秀, 0.25差
  const fcpScore = normalize(props.metrics.fcp || 0, 1800, 3000); // FCP: 1.8s优秀, 3s差
  const tbtScore = normalize(props.metrics.tbt || 0, 200, 600); // TBT: 200ms优秀, 600ms差

  const data = [
    {
      value: [
        lcpScore,
        fidScore,
        clsScore,
        fcpScore,
        tbtScore,
      ],
      name: '性能指标',
    },
  ];

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const labels = ['LCP', 'FID', 'CLS', 'FCP', 'TBT'];
        const values = params.value || [];
        const rawValues = [
          props.metrics.lcp ? `${props.metrics.lcp.toFixed(0)}ms` : '无数据',
          props.metrics.fid ? `${props.metrics.fid.toFixed(0)}ms` : '无数据',
          props.metrics.cls ? props.metrics.cls.toFixed(3) : '无数据',
          props.metrics.fcp ? `${props.metrics.fcp.toFixed(0)}ms` : '无数据',
          props.metrics.tbt ? `${props.metrics.tbt.toFixed(0)}ms` : '无数据',
        ];
        
        // 构建显示所有指标的表格
        let result = '<div style="text-align: left;"><strong>核心 Web 指标</strong><br/>';
        labels.forEach((label, index) => {
          const score = values[index] || 0;
          result += `${label}: ${score.toFixed(1)}分 (${rawValues[index]})<br/>`;
        });
        result += '</div>';
        return result;
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
