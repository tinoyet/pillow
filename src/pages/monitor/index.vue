<template>
  <view class="monitor">
    <!-- 顶部状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <view class="status-left">
          <text class="status-icon">🌙</text>
          <view class="status-info">
            <text class="status-title">{{ t('realTimeMonitor') }}</text>
            <text class="status-time">{{ startTimeStr }} - {{ endTimeStr }}</text>
          </view>
        </view>
        <view class="status-right">
          <view class="setting-btn" @tap="showTimeSetting = !showTimeSetting">⚙️</view>
          <view class="stop-btn" :class="{ active: isMonitoring }" @tap="toggleMonitor">
            {{ isMonitoring ? t('stop') : t('start') }}
          </view>
        </view>
      </view>
      <view class="monitoring-status">
        <view class="status-dot" :class="{ active: isMonitoring }"></view>
        <text>{{ isMonitoring ? t('monitoringNow') : t('monitorStopped') }}</text>
      </view>

      <!-- 时间设置面板 -->
      <view v-if="showTimeSetting" class="time-picker-panel">
        <view class="time-row">
          <text class="time-label">{{ t('startTime') }}</text>
          <picker mode="time" :value="startTimeStr" @change="onStartTimeChange">
            <view class="time-value">{{ startTimeStr }}</view>
          </picker>
        </view>
        <view class="time-row">
          <text class="time-label">{{ t('endTime') }}</text>
          <picker mode="time" :value="endTimeStr" @change="onEndTimeChange">
            <view class="time-value">{{ endTimeStr }}</view>
          </picker>
        </view>
        <button class="save-btn" @tap="saveTimeSetting">{{ t('save') }}</button>
      </view>
    </view>

    <!-- 实时数据三栏 -->
    <view class="realtime-metrics">
      <view class="metric-box">
        <view class="metric-header">
          <text class="metric-icon heart">❤️</text>
          <text class="metric-label">{{ t('heartRate') }}</text>
        </view>
        <view class="metric-body">
          <text class="metric-value">{{ heartRate }}</text>
          <text class="metric-unit">{{ t('bpm') }}</text>
        </view>
      </view>
      <view class="metric-box">
        <view class="metric-header">
          <text class="metric-icon breath">🌬️</text>
          <text class="metric-label">{{ t('breathRate') }}</text>
        </view>
        <view class="metric-body">
          <text class="metric-value">{{ breathRate }}</text>
          <text class="metric-unit">{{ t('bpm') }}</text>
        </view>
      </view>
      <view class="metric-box">
        <view class="metric-header">
          <text class="metric-icon status">🛏️</text>
          <text class="metric-label">{{ t('status') }}</text>
        </view>
        <view class="metric-body">
          <view class="status-tag" :class="currentStatus">{{ getStatusText(currentStatus) }}</view>
        </view>
      </view>
    </view>

    <!-- 心率趋势 -->
    <view class="chart-card">
      <view class="card-title">
        <text class="title-icon">❤️</text>
        <text>{{ t('heartRateTrend') }}</text>
      </view>
      <view class="chart-wrap">
        <u-charts canvas-id="heartRateChart" type="area" :chart-data="heartRateChartData"
          :opts="heartRateOpts"></u-charts>
      </view>
    </view>

    <!-- 呼吸率趋势 -->
    <view class="chart-card">
      <view class="card-title">
        <text class="title-icon">🌬️</text>
        <text>{{ t('breathRateTrend') }}</text>
      </view>
      <view class="chart-wrap">
        <u-charts canvas-id="breathRateChart" type="area" :chart-data="breathRateChartData"
          :opts="breathRateOpts"></u-charts>
      </view>
    </view>

    <!-- 睡眠状态时序 -->
    <view class="chart-card">
      <view class="card-title">
        <text class="title-icon">⏱️</text>
        <text>{{ t('sleepStatusTimeline') }}</text>
      </view>
      <view class="sleep-timeline">
        <view class="timeline-bar">
          <view v-for="(seg, idx) in sleepSegments" :key="idx" class="timeline-segment" :class="seg.type"
            :style="{ width: seg.width + '%' }"></view>
        </view>
        <view class="timeline-axis">
          <text v-for="time in timeAxisLabels" :key="time">{{ time }}</text>
        </view>
      </view>
      <view class="status-legend">
        <view class="legend-item">
          <view class="legend-dot in-bed"></view>
          <text>{{ t('inBed') }}</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot moving"></view>
          <text>{{ t('moving') }}</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot snoring"></view>
          <text>{{ t('snoring') }}</text>
        </view>
        <view class="legend-item">
          <view class="legend-dot off-bed"></view>
          <text>{{ t('outOfBed') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import UCharts from '@/components/u-charts/u-charts.vue'
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()

const showTimeSetting = ref(false)
const startTimeStr = ref('22:00')
const endTimeStr = ref('07:00')
const isMonitoring = ref(true)

const onStartTimeChange = (e: any) => { startTimeStr.value = e.detail.value }
const onEndTimeChange = (e: any) => { endTimeStr.value = e.detail.value }
const saveTimeSetting = () => {
  showTimeSetting.value = false
  uni.showToast({ title: t('saved'), icon: 'success' })
}
const toggleMonitor = () => {
  isMonitoring.value = !isMonitoring.value
  uni.showToast({ title: isMonitoring.value ? t('monitorStarted') : t('monitorStopped'), icon: 'none' })
}

const heartRate = ref(70)
const breathRate = ref(17)
const currentStatus = ref<'inBed' | 'moving' | 'snoring' | 'offBed'>('inBed')

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    inBed: t('inBed'),
    moving: t('moving'),
    snoring: t('snoring'),
    offBed: t('outOfBed')
  }
  return map[status] || status
}

// 图表数据
const timeLabels = ['22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00']

const heartRateChartData = reactive({
  categories: timeLabels,
  series: [{
    name: '心率',
    data: [72, 68, 65, 62, 60, 63, 67],
    color: '#ff6b6b'
  }]
})

const breathRateChartData = reactive({
  categories: timeLabels,
  series: [{
    name: '呼吸率',
    data: [18, 17, 16, 15, 14, 15, 16],
    color: '#4dabf7'
  }]
})

const heartRateOpts = {
  yAxis: { min: 50, max: 90 }
}

const breathRateOpts = {
  yAxis: { min: 10, max: 25 }
}

const sleepSegments = ref([
  { type: 'in-bed', width: 25 },
  { type: 'moving', width: 5 },
  { type: 'in-bed', width: 15 },
  { type: 'snoring', width: 8 },
  { type: 'in-bed', width: 20 },
  { type: 'off-bed', width: 5 },
  { type: 'in-bed', width: 22 }
])

const timeAxisLabels = ['22:00', '23:00', '00:00', '01:00']

let timer: number | null = null

onMounted(() => {
  timer = setInterval(() => {
    heartRate.value = 60 + Math.floor(Math.random() * 20)
    breathRate.value = 14 + Math.floor(Math.random() * 6)
    const statuses: ('inBed' | 'moving' | 'snoring' | 'offBed')[] = ['inBed', 'inBed', 'inBed', 'moving', 'snoring']
    currentStatus.value = statuses[Math.floor(Math.random() * statuses.length)]
  }, 3000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
