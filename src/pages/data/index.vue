<template>
  <view class="data-page">
    <view class="tab-bar">
      <view class="tab-item" :class="{ active: activeTab === 'day' }" @tap="switchTab('day')">{{ t('dayData') }}</view>
      <view class="tab-item" :class="{ active: activeTab === 'month' }" @tap="switchTab('month')">{{ t('monthData') }}
      </view>
    </view>

    <view v-show="activeTab === 'day'" class="day-view">
      <view class="date-selector">
        <view class="arrow" @tap="prevDay">‹</view>
        <picker mode="date" :value="selectedDate" @change="onDateChange">
          <view class="date-info">
            <text class="date-text">{{ formatDateDisplay(selectedDate) }}</text>
            <text class="week-text">{{ getWeekDay(selectedDate) }}</text>
          </view>
        </picker>
        <view class="arrow" @tap="nextDay">›</view>
      </view>

      <view class="score-section">
        <text class="section-label">{{ t('sleepScore') }}</text>
        <view class="score-ring-wrap">
          <score-ring :score="dayData.score" canvas-id="dayScoreRing" />
        </view>
        <text class="score-tip">{{ dayData.sleepTime }} {{ t('fallAsleep') }}, {{ dayData.wakeTime }} {{ t('wakeUp')
        }}</text>
      </view>

      <view class="chart-card">
        <view class="card-title">{{ t('sleepQuality') }}</view>
        <view class="sleep-bar-container">
          <view class="sleep-bar">
            <view v-for="(seg, idx) in sleepSegments" :key="idx" class="sleep-segment" :class="seg.type"
              :style="{ width: seg.width + '%' }"></view>
          </view>
        </view>
        <view class="timeline-axis">
          <text v-for="time in timeLabels" :key="time">{{ time }}</text>
        </view>
        <view class="quality-legend">
          <view class="legend-item">
            <view class="dot deep"></view><text>{{ t('deepSleep') }}</text>
          </view>
          <view class="legend-item">
            <view class="dot light"></view><text>{{ t('lightSleep') }}</text>
          </view>
          <view class="legend-item">
            <view class="dot awake"></view><text>{{ t('awake') }}</text>
          </view>
          <view class="legend-item">
            <view class="dot off-bed"></view><text>{{ t('outOfBed') }}</text>
          </view>
        </view>
        <view class="sleep-pie-section">
          <view class="pie-wrap">
            <u-charts canvas-id="sleepPieChart" type="ring" :chart-data="sleepPieData" :opts="pieOpts" />
          </view>
          <view class="pie-legends">
            <view class="pie-legend-item">
              <view class="pie-dot light"></view>
              <view class="pie-info">
                <text class="pie-percent">{{ dayData.lightPercent }}%</text>
                <text class="pie-label">{{ t('lightSleep') }} {{ dayData.lightDuration }}</text>
              </view>
            </view>
            <view class="pie-legend-item">
              <view class="pie-dot deep"></view>
              <view class="pie-info">
                <text class="pie-percent">{{ dayData.deepPercent }}%</text>
                <text class="pie-label">{{ t('deepSleep') }} {{ dayData.deepDuration }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('heartRate') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avgValue') }}</text>
            <text class="avg-value heart">{{ dayData.avgHeartRate }} <text class="unit">{{ t('bpm') }}</text></text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="heartRateChart" type="area" :chart-data="heartRateChartData" :opts="heartRateOpts" />
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('breathRate') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avgValue') }}</text>
            <text class="avg-value breath">{{ dayData.avgBreathRate }} <text class="unit">{{ t('bpm') }}</text></text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="breathRateChart" type="area" :chart-data="breathRateChartData" :opts="breathRateOpts" />
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('snore') }}</view>
          <view class="count-info">
            <text class="count-value">{{ dayData.snoreCount }}</text>
            <text class="count-unit">{{ t('times') }}</text>
          </view>
        </view>
        <view class="event-timeline-container">
          <view v-if="selectedEvent.type === 'snore'" class="event-tooltip" :style="{ left: selectedEvent.left + '%' }">
            <text class="tooltip-text">{{ selectedEvent.text }}</text>
            <text class="tooltip-time">{{ selectedEvent.time }}</text>
          </view>
          <view class="event-timeline-bar">
            <view v-for="(evt, idx) in snoreEvents" :key="idx" class="event-marker snore"
              :style="{ left: getTimePosition(evt.time) + '%' }">
              <view class="event-click-area" @tap.stop="onEventClick('snore', idx, evt)"></view>
            </view>
          </view>
          <view class="timeline-axis">
            <text v-for="time in timeLabels" :key="time">{{ time }}</text>
          </view>
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('bodyMove') }}</view>
          <view class="count-info">
            <text class="count-value">{{ dayData.moveCount }}</text>
            <text class="count-unit">{{ t('times') }}</text>
          </view>
        </view>
        <view class="event-timeline-container">
          <view v-if="selectedEvent.type === 'move'" class="event-tooltip" :style="{ left: selectedEvent.left + '%' }">
            <text class="tooltip-text">{{ selectedEvent.text }}</text>
            <text class="tooltip-time">{{ selectedEvent.time }}</text>
          </view>
          <view class="event-timeline-bar">
            <view v-for="(evt, idx) in moveEvents" :key="idx" class="event-marker move"
              :style="{ left: getTimePosition(evt.time) + '%' }">
              <view class="event-click-area" @tap.stop="onEventClick('move', idx, evt)"></view>
            </view>
          </view>
          <view class="timeline-axis">
            <text v-for="time in timeLabels" :key="time">{{ time }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-show="activeTab === 'month'" class="month-view">
      <view class="date-selector">
        <view class="arrow" @tap="prevMonth">‹</view>
        <picker mode="date" fields="month" :value="selectedMonth" @change="onMonthChange">
          <view class="date-info">
            <text class="date-text">{{ formatMonthDisplay(selectedMonth) }}</text>
          </view>
        </picker>
        <view class="arrow" @tap="nextMonth">›</view>
      </view>

      <view class="score-section">
        <text class="section-label">{{ t('sleepScore') }}</text>
        <view class="score-ring-wrap">
          <score-ring :score="monthData.avgScore" canvas-id="monthScoreRing" />
        </view>
        <text class="score-tip">{{ t('qualified') }} {{ monthData.goodDays }} {{ t('days') }}, {{ t('highest') }} {{
          monthData.maxScore }} {{ t('points') }}</text>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('dailyScore') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avg') }}</text>
            <text class="avg-value primary">{{ monthData.avgScore }} <text class="unit">{{ t('points') }}</text></text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="dailyScoreChart" type="line" :chart-data="monthScoreChartData" :opts="monthLineOpts" />
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('sleepDuration') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avg') }}</text>
            <text class="avg-value green">{{ monthData.avgDuration }}</text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="dailyDurationChart" type="line" :chart-data="monthDurationChartData"
            :opts="monthLineOpts" />
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('heartRate') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avg') }}</text>
            <text class="avg-value heart">{{ monthData.avgHeartRate }} <text class="unit">{{ t('bpm') }}</text></text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="dailyHeartRateChart" type="line" :chart-data="monthHeartRateChartData"
            :opts="monthLineOpts" />
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('breathRate') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avg') }}</text>
            <text class="avg-value breath">{{ monthData.avgBreathRate }} <text class="unit">{{ t('bpm') }}</text></text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="dailyBreathRateChart" type="line" :chart-data="monthBreathRateChartData"
            :opts="monthLineOpts" />
        </view>
      </view>

      <view class="chart-card">
        <view class="card-header">
          <view class="card-title">{{ t('snore') }}</view>
          <view class="avg-info">
            <text class="avg-label">{{ t('avg') }}</text>
            <text class="avg-value orange">{{ monthData.avgSnoreCount }} <text class="unit">{{ t('times')
            }}</text></text>
          </view>
        </view>
        <view class="chart-wrap">
          <u-charts canvas-id="dailySnoreChart" type="line" :chart-data="monthSnoreChartData" :opts="monthLineOpts" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import UCharts from '@/components/u-charts/u-charts.vue'
import ScoreRing from '@/components/score-ring/score-ring.vue'
import { useI18n } from '@/utils/i18n'

const { t, currentLang } = useI18n()

const activeTab = ref<'day' | 'month'>('day')

const today = new Date()
const selectedDate = ref(today.toISOString().split('T')[0])
const selectedMonth = ref(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)

const weekDaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDateDisplay = (date: string) => {
  const d = new Date(date)
  return currentLang.value === 'zh'
    ? `${d.getMonth() + 1}月${d.getDate()}日`
    : `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`
}
const getWeekDay = (date: string) => {
  const idx = new Date(date).getDay()
  return currentLang.value === 'zh' ? weekDaysZh[idx] : weekDaysEn[idx]
}
const formatMonthDisplay = (month: string) => {
  const [y, m] = month.split('-')
  return currentLang.value === 'zh'
    ? `${y}年${parseInt(m)}月`
    : `${new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en', { month: 'long' })} ${y}`
}

const prevDay = () => { const d = new Date(selectedDate.value); d.setDate(d.getDate() - 1); selectedDate.value = d.toISOString().split('T')[0] }
const nextDay = () => { const d = new Date(selectedDate.value); d.setDate(d.getDate() + 1); selectedDate.value = d.toISOString().split('T')[0] }
const onDateChange = (e: any) => { selectedDate.value = e.detail.value }
const prevMonth = () => { const [y, m] = selectedMonth.value.split('-').map(Number); const d = new Date(y, m - 2, 1); selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const nextMonth = () => { const [y, m] = selectedMonth.value.split('-').map(Number); const d = new Date(y, m, 1); selectedMonth.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }
const onMonthChange = (e: any) => { selectedMonth.value = e.detail.value }

const sleepSegments = ref([
  { type: 'awake', width: 5 }, { type: 'light', width: 12 }, { type: 'deep', width: 18 },
  { type: 'light', width: 8 }, { type: 'deep', width: 15 }, { type: 'light', width: 12 },
  { type: 'deep', width: 10 }, { type: 'light', width: 15 }, { type: 'awake', width: 5 }
])

const dayData = reactive({
  score: 85, sleepTime: '22:35', wakeTime: '06:42',
  lightPercent: 47, lightDuration: '3h39min', deepPercent: 39, deepDuration: '3h07min',
  avgHeartRate: 63, avgBreathRate: 14, snoreCount: 5, moveCount: 5
})

const monthData = reactive({
  avgScore: 78, maxScore: 92, goodDays: 22, totalDays: 30,
  avgDuration: '7.5h', avgHeartRate: 64, avgBreathRate: 16, avgSnoreCount: 6
})

const timeLabels = ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00']
const shortTimeLabels = ['22:00', '00:00', '02:00', '04:00', '06:00']
const eventTimeLabels = ['22:00', '23:00', '0:00', '1:00', '2:00', '3:00', '4:00', '5:00']
const dayLabels = Array.from({ length: 30 }, (_, i) => String(i + 1))

// 图表配置
const pieOpts = {
  extra: {
    ring: {
      ringWidth: 25
    }
  }
}

const heartRateOpts = {
  yAxis: { min: 50, max: 80 }
}

const breathRateOpts = {
  yAxis: { min: 8, max: 20 }
}

const monthLineOpts = {
  xAxis: {
    labelCount: 6
  }
}

// 日数据图表
const sleepPieData = reactive({
  series: [
    { name: '浅睡', data: dayData.lightPercent, color: '#2196F3' },
    { name: '深睡', data: dayData.deepPercent, color: '#9C27B0' },
    { name: '其他', data: 100 - dayData.lightPercent - dayData.deepPercent, color: '#f5f5f5' }
  ]
})

const heartRateChartData = reactive({
  categories: shortTimeLabels,
  series: [{ name: '心率', data: [65, 62, 58, 55, 68], color: '#ff6b6b' }]
})

const breathRateChartData = reactive({
  categories: shortTimeLabels,
  series: [{ name: '呼吸率', data: [16, 15, 12, 14, 16], color: '#4dabf7' }]
})

const snoreEvents = [
  { time: '23:15', duration: 2 },
  { time: '01:30', duration: 5 },
  { time: '03:45', duration: 5 },
  { time: '04:20', duration: 3 },
  { time: '05:10', duration: 1 }
]

const moveEvents = [
  { time: '22:45', duration: 1 },
  { time: '00:15', duration: 1 },
  { time: '02:30', duration: 2 },
  { time: '04:00', duration: 1 },
  { time: '05:45', duration: 1 }
]

const selectedEvent = reactive({
  type: '' as 'snore' | 'move' | '',
  index: -1,
  left: 0,
  text: '',
  time: ''
})

const getTimePosition = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number)
  let minutes = h * 60 + m
  if (h < 22) minutes += 24 * 60
  const start = 22 * 60
  const total = 8 * 60
  return ((minutes - start) / total) * 100
}

const onEventClick = (type: 'snore' | 'move', index: number, event: any) => {
  if (selectedEvent.type === type && selectedEvent.index === index) {
    selectedEvent.type = ''
    selectedEvent.index = -1
    return
  }
  selectedEvent.type = type
  selectedEvent.index = index
  selectedEvent.left = getTimePosition(event.time)
  selectedEvent.text = `${type === 'snore' ? t('snore') : t('bodyMove')} ${event.duration}${t('minute')}`
  selectedEvent.time = event.time
}

// 月数据图表
const monthScoreChartData = reactive({
  categories: dayLabels,
  series: [{ name: '评分', data: Array.from({ length: 30 }, () => 50 + Math.floor(Math.random() * 45)), color: '#5B7FFF' }]
})

const monthDurationChartData = reactive({
  categories: dayLabels,
  series: [{ name: '时长', data: Array.from({ length: 30 }, () => 5 + Math.random() * 4), color: '#52c41a' }]
})

const monthHeartRateChartData = reactive({
  categories: dayLabels,
  series: [{ name: '心率', data: Array.from({ length: 30 }, () => 55 + Math.floor(Math.random() * 20)), color: '#ff6b6b' }]
})

const monthBreathRateChartData = reactive({
  categories: dayLabels,
  series: [{ name: '呼吸率', data: Array.from({ length: 30 }, () => 12 + Math.floor(Math.random() * 8)), color: '#4dabf7' }]
})

const monthSnoreChartData = reactive({
  categories: dayLabels,
  series: [{ name: '打鼾', data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 10)), color: '#ffa940' }]
})

const switchTab = (tab: 'day' | 'month') => {
  activeTab.value = tab
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
