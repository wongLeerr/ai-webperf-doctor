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

  // 改进的归一化函数，支持极端值和量级差异
  // 对于性能指标，值越小越好，使用反向映射
  // 使用扩展的阈值范围，并支持超出范围的值
  const normalize = (value, excellent, good, poor, veryPoor, extremeMax) => {
    if (value === null || value === undefined || isNaN(value)) return 0;
    
    // 优秀（满分）
    if (value <= excellent) return 100;
    
    // 良好（优秀到良好之间）
    // 当 value = excellent 时返回 100，当 value = good 时返回 80
    if (value <= good) {
      const ratio = (good - value) / (good - excellent);
      return 80 + ratio * 20;
    }
    
    // 一般（良好到差之间）
    // 当 value = good 时返回 80，当 value = poor 时返回 50
    if (value <= poor) {
      const ratio = (poor - value) / (poor - good);
      return 50 + ratio * 30;
    }
    
    // 较差（差到很差之间）
    // 当 value = poor 时返回 50，当 value = veryPoor 时返回 20
    if (value <= veryPoor) {
      const ratio = (veryPoor - value) / (veryPoor - poor);
      return 20 + ratio * 30;
    }
    
    // 极端值（超出很差阈值，使用对数缩放）
    // 使用对数函数，让极端值也能显示在图表上
    // 确保不会超出极端最大值
    const clampedValue = Math.min(value, extremeMax || veryPoor * 10);
    const logValue = Math.log10(clampedValue / veryPoor);
    const maxLog = Math.log10((extremeMax || veryPoor * 10) / veryPoor);
    
    if (maxLog <= 0) return 0;
    
    // 将极端值映射到 0-20 分之间
    const score = Math.max(0, 20 - (logValue / maxLog) * 20);
    return score;
  };

  // CLS 的特殊处理（越小越好）
  const normalizeCLS = (cls) => {
    if (cls === null || cls === undefined || isNaN(cls)) return 0;
    
    // CLS 的范围和阈值
    const excellent = 0.1;   // 优秀
    const good = 0.15;       // 良好
    const poor = 0.25;       // 差
    const veryPoor = 0.5;    // 很差
    const extremeMax = 2.0;  // 极端最大值
    
    if (cls <= excellent) return 100;
    if (cls <= good) {
      const ratio = (good - cls) / (good - excellent);
      return 80 + ratio * 20;
    }
    if (cls <= poor) {
      const ratio = (poor - cls) / (poor - good);
      return 50 + ratio * 30;
    }
    if (cls <= veryPoor) {
      const ratio = (veryPoor - cls) / (veryPoor - poor);
      return 20 + ratio * 30;
    }
    
    // 极端值使用对数缩放
    const clampedValue = Math.min(cls, extremeMax);
    const logValue = Math.log10(clampedValue / veryPoor);
    const maxLog = Math.log10(extremeMax / veryPoor);
    
    if (maxLog <= 0) return 0;
    return Math.max(0, 20 - (logValue / maxLog) * 20);
  };

  // 使用扩展的阈值范围，支持极端值
  // LCP: 优秀2.5s, 良好4s, 差6s, 很差10s, 极端最大60s
  const lcpScore = normalize(
    props.metrics.lcp || 0, 
    2500,   // 优秀
    4000,   // 良好
    6000,   // 差
    10000,  // 很差
    60000   // 极端最大值（60秒）
  );
  
  // FID: 优秀100ms, 良好200ms, 差300ms, 很差600ms, 极端最大3000ms
  const fidScore = normalize(
    props.metrics.fid || 0, 
    100,    // 优秀
    200,    // 良好
    300,    // 差
    600,    // 很差
    3000    // 极端最大值（3秒）
  );
  
  // CLS 使用特殊处理
  const clsScore = normalizeCLS(props.metrics.cls || 0);
  
  // FCP: 优秀1.8s, 良好3s, 差4.5s, 很差8s, 极端最大50s
  const fcpScore = normalize(
    props.metrics.fcp || 0, 
    1800,   // 优秀
    3000,   // 良好
    4500,   // 差
    8000,   // 很差
    50000   // 极端最大值（50秒）
  );
  
  // TBT: 优秀200ms, 良好400ms, 差600ms, 很差1200ms, 极端最大5000ms
  // 如果 TBT 为 0，说明没有阻塞，应该给高分
  const tbtValue = props.metrics.tbt || 0;
  const tbtScore = tbtValue === 0 
    ? 100  // 没有阻塞，满分
    : normalize(tbtValue, 200, 400, 600, 1200, 5000);

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
