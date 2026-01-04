<template>
  <view class="charts-box">
    <canvas :id="canvasId" :canvas-id="canvasId" class="charts"
      :style="{ width: cWidth + 'px', height: cHeight + 'px' }" @touchstart="touchHandle" @touchmove="moveHandle"
      @touchend="touchEndHandle"></canvas>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, watch } from 'vue'
import uCharts from '@qiun/ucharts'

const props = defineProps<{
  canvasId: string
  type: string
  chartData: {
    categories?: string[]
    series: any[]
  }
  opts?: any
}>()

const cWidth = ref(300)
const cHeight = ref(200)
let uChartsInstance: any = null
const instance = getCurrentInstance()

const initChart = () => {
  const query = uni.createSelectorQuery().in(instance?.proxy)
  query.select('.charts-box').boundingClientRect((res: any) => {
    if (res) {
      cWidth.value = res.width || 300
      cHeight.value = res.height || 200

      setTimeout(() => {
        createChart()
      }, 50)
    }
  }).exec()
}

const createChart = () => {
  const ctx = uni.createCanvasContext(props.canvasId, instance?.proxy)

  const baseOpts: any = {
    type: props.type,
    context: ctx,
    width: cWidth.value,
    height: cHeight.value,
    categories: props.chartData.categories || [],
    series: props.chartData.series,
    animation: true,
    background: '#FFFFFF',
    legend: {
      show: false
    },
    dataLabel: true,
    dataPointShape: true,
    extra: {}
  }

  // 根据图表类型设置不同配置
  if (props.type === 'arcbar') {
    // 圆弧进度条 - 睡眠评分，中间显示数字
    baseOpts.padding = [10, 10, 10, 10]
    baseOpts.title = {
      name: String(props.chartData.series[0]?.data || 0),
      fontSize: 40,
      color: '#333333',
      offsetY: -5
    }
    baseOpts.subtitle = {
      name: '分',
      fontSize: 16,
      color: '#999999',
      offsetY: 25
    }
    baseOpts.extra.arcbar = {
      type: 'circle',
      width: 14,
      backgroundColor: '#f0f0f0',
      startAngle: 0.75,
      endAngle: 0.25,
      gap: 2
    }
  } else if (props.type === 'ring') {
    // 圆环图 - 睡眠比例，不显示标签，关闭动画防止闪烁
    baseOpts.animation = false
    baseOpts.dataLabel = false
    baseOpts.padding = [5, 5, 5, 5]
    baseOpts.extra.ring = {
      ringWidth: 25,
      activeOpacity: 0.5,
      offsetAngle: 0,
      labelWidth: 0,
      border: false
    }
  } else if (props.type === 'area' || props.type === 'line') {
    // 折线图/面积图 - 减少两边空白
    baseOpts.padding = [15, 10, 5, 10]
    baseOpts.dataLabel = false
    baseOpts.xAxis = {
      disableGrid: true,
      fontColor: '#999999',
      fontSize: 10,
      boundaryGap: 'justify',
      ...(props.opts?.xAxis || {})
    }
    baseOpts.yAxis = {
      gridColor: '#f0f0f0',
      fontColor: '#999999',
      fontSize: 10,
      splitNumber: 4,
      ...(props.opts?.yAxis || {})
    }
    baseOpts.extra.line = {
      type: 'curve',
      width: 2
    }
    baseOpts.extra.area = {
      type: 'curve',
      opacity: 0.3,
      addLine: true,
      width: 2
    }
  } else if (props.type === 'column') {
    // 柱状图
    baseOpts.padding = [15, 10, 5, 10]
    baseOpts.dataLabel = false
    baseOpts.xAxis = {
      disableGrid: true,
      fontColor: '#999999',
      fontSize: 9,
      rotateLabel: true,
      ...(props.opts?.xAxis || {})
    }
    baseOpts.yAxis = {
      gridColor: '#f0f0f0',
      fontColor: '#999999',
      fontSize: 10,
      splitNumber: 5,
      min: 0,
      ...(props.opts?.yAxis || {})
    }
    baseOpts.extra.column = {
      width: 12,
      barBorderRadius: [4, 4, 0, 0]
    }
  }

  // 合并用户自定义配置
  if (props.opts) {
    if (props.opts.yAxis) {
      baseOpts.yAxis = { ...baseOpts.yAxis, ...props.opts.yAxis }
    }
    if (props.opts.xAxis) {
      baseOpts.xAxis = { ...baseOpts.xAxis, ...props.opts.xAxis }
    }
    if (props.opts.extra) {
      baseOpts.extra = { ...baseOpts.extra, ...props.opts.extra }
    }
  }

  uChartsInstance = new uCharts(baseOpts)
}

const touchHandle = (e: any) => {
  uChartsInstance?.scrollStart?.(e)
}

const moveHandle = (e: any) => {
  uChartsInstance?.scroll?.(e)
}

const touchEndHandle = (e: any) => {
  uChartsInstance?.scrollEnd?.(e)
}

watch(() => props.chartData, () => {
  if (uChartsInstance) {
    uChartsInstance.updateData({
      categories: props.chartData.categories || [],
      series: props.chartData.series
    })
  }
}, { deep: true })

onMounted(() => {
  setTimeout(initChart, 100)
})

defineExpose({
  updateData: (data: any) => {
    uChartsInstance?.updateData?.(data)
  }
})
</script>

<style scoped>
.charts-box {
  width: 100%;
  height: 100%;
}

.charts {
  width: 100%;
  height: 100%;
}
</style>
