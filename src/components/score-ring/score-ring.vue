<template>
  <view class="score-ring-box">
    <canvas :id="canvasId" :canvas-id="canvasId" class="score-canvas"
      :style="{ width: size + 'px', height: size + 'px' }"></canvas>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, watch } from 'vue'
import uCharts from '@qiun/ucharts'

const props = withDefaults(defineProps<{
  score: number
  canvasId?: string
}>(), {
  canvasId: 'scoreRing'
})

const size = ref(180)
let chart: any = null
const instance = getCurrentInstance()

const initChart = () => {
  const query = uni.createSelectorQuery().in(instance?.proxy)
  query.select('.score-ring-box').boundingClientRect((res: any) => {
    if (res) {
      const s = Math.min(res.width, res.height) || 180
      size.value = s

      setTimeout(() => {
        createChart()
      }, 50)
    }
  }).exec()
}

const createChart = () => {
  const ctx = uni.createCanvasContext(props.canvasId, instance?.proxy)

  chart = new uCharts({
    type: 'arcbar',
    context: ctx,
    width: size.value,
    height: size.value,
    series: [{
      name: '睡眠评分',
      data: props.score / 100,
      color: '#5B7FFF'
    }],
    animation: true,
    timing: 'easeOut',
    duration: 500,
    background: '#FFFFFF',
    title: {
      name: String(props.score),
      fontSize: 42,
      color: '#5B7FFF',
      offsetY: -10
    },
    subtitle: {
      name: '/100',
      fontSize: 16,
      color: '#999999',
      offsetY: 0
    },
    extra: {
      arcbar: {
        type: 'circle',
        width: 12,
        backgroundColor: '#e8e8e8',
        startAngle: 1.5,
        endAngle: 1.5,
        gap: 2,
        linearType: 'none'
      }
    }
  })
}

watch(() => props.score, () => {
  if (chart) {
    chart.updateData({
      series: [{
        name: '睡眠评分',
        data: props.score / 100,
        color: '#5B7FFF'
      }],
      title: {
        name: String(props.score)
      }
    })
  }
})

onMounted(() => {
  setTimeout(initChart, 100)
})
</script>

<style scoped>
.score-ring-box {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-canvas {
  display: block;
}
</style>
