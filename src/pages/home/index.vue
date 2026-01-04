<template>
  <view class="home">
    <!-- 未连接状态 -->
    <view v-if="!isConnected" class="not-connected">
      <view class="header">
        <text class="header-title">{{ t('brandName') }}</text>
      </view>
      <view class="welcome-card">
        <view class="moon-icon">🌙</view>
        <text class="welcome-title">{{ t('welcomeTitle') }}</text>
        <text class="welcome-desc">{{ t('welcomeDesc') }}</text>
        <view class="connect-mode">
          <view class="mode-item" :class="{ active: connectMode === 'bluetooth' }" @tap="connectMode = 'bluetooth'">
            <text class="mode-icon">📶</text>
            <text>{{ t('connectBluetooth') }}</text>
          </view>
          <view class="mode-item" :class="{ active: connectMode === 'wifi' }" @tap="connectMode = 'wifi'">
            <text class="mode-icon">📡</text>
            <text>{{ t('connectWifi') }}</text>
          </view>
        </view>
        <button class="connect-btn" @tap="startConnect" :loading="connecting">
          {{ connecting ? t('connecting') : t('connectDevice') }}
        </button>
      </view>

      <view class="features-card">
        <text class="features-title">{{ t('productFeatures') }}</text>
        <view class="feature-list">
          <view class="feature-item">
            <view class="feature-dot"></view>
            <text>{{ t('feature1') }}</text>
          </view>
          <view class="feature-item">
            <view class="feature-dot"></view>
            <text>{{ t('feature2') }}</text>
          </view>
          <view class="feature-item">
            <view class="feature-dot"></view>
            <text>{{ t('feature3') }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 已连接状态 -->
    <view v-else class="connected">
      <!-- 设备状态卡片 -->
      <view class="device-card">
        <view class="device-left">
          <view class="device-icon-wrap">
            <text class="device-icon">🌙</text>
          </view>
          <view class="device-info">
            <text class="device-name">{{ t('smartPillow') }}</text>
            <text class="device-status">{{ t('deviceRunning') }}</text>
          </view>
        </view>
        <view class="connect-tag" :class="connectMode">
          <text class="tag-icon">{{ connectMode === 'bluetooth' ? '📶' : '📡' }}</text>
          <text>{{ connectMode === 'bluetooth' ? t('bluetooth') : 'WiFi' }}</text>
        </view>
      </view>

      <!-- 气囊压力控制 -->
      <view class="control-card">
        <view class="control-header">
          <view class="control-left">
            <view class="control-icon-wrap airbag">
              <text class="control-icon">💨</text>
            </view>
            <view class="control-info">
              <text class="control-title">{{ t('airbagPressure') }}</text>
              <text class="control-desc">{{ t('airbagDesc') }}</text>
            </view>
          </view>
          <view class="control-value">
            <text class="value-num">{{ currentPressure }}</text>
            <text class="value-unit">kPa</text>
          </view>
        </view>
        <view class="control-body">
          <view class="auto-row">
            <text class="auto-label">{{ t('autoMode') }}</text>
            <switch :checked="pressureAuto" @change="togglePressureAuto" color="#5B7FFF" />
          </view>
          <view class="slider-section" :class="{ disabled: pressureAuto }">
            <slider :value="targetPressure" :min="2" :max="10" :step="0.5" activeColor="#5B7FFF"
              backgroundColor="#E5E5E5" block-size="24" :disabled="pressureAuto" @change="onPressureChange" />
            <view class="slider-labels">
              <text>2 kPa</text>
              <text class="slider-mid">{{ t('moderate') }}</text>
              <text>10 kPa</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 温度控制 -->
      <view class="control-card">
        <view class="control-header">
          <view class="control-left">
            <view class="control-icon-wrap temp">
              <text class="control-icon">🌡️</text>
            </view>
            <view class="control-info">
              <text class="control-title">{{ t('tempControl') }}</text>
              <text class="control-desc">{{ t('tempDesc') }}</text>
            </view>
          </view>
          <view class="control-value temp">
            <text class="value-num">{{ currentTemp }}</text>
            <text class="value-unit">°C</text>
          </view>
        </view>
        <view class="control-body">
          <view class="auto-row">
            <text class="auto-label">{{ t('autoMode') }}</text>
            <switch :checked="tempAuto" @change="toggleTempAuto" color="#5B7FFF" />
          </view>
          <view class="slider-section" :class="{ disabled: tempAuto }">
            <slider :value="targetTemp" :min="15" :max="35" :step="1" activeColor="#52c41a" backgroundColor="#E5E5E5"
              block-size="24" :disabled="tempAuto" @change="onTempChange" />
            <view class="slider-labels">
              <text>15°C</text>
              <text class="slider-mid">{{ t('comfortable') }}</text>
              <text>35°C</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部提示 -->
      <view class="tip-card">
        <text class="tip-icon">💡</text>
        <text class="tip-text">{{ t('adjustTip') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/utils/i18n'

const { t } = useI18n()

const isConnected = ref(false)
const connecting = ref(false)
const connectMode = ref<'bluetooth' | 'wifi'>('bluetooth')

const pressureAuto = ref(false)
const currentPressure = ref(6)
const targetPressure = ref(6)

const tempAuto = ref(false)
const currentTemp = ref(25)
const targetTemp = ref(25)

let pressureTimer: number | null = null
let tempTimer: number | null = null

const startConnect = async () => {
  connecting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  connecting.value = false
  isConnected.value = true
  uni.showToast({ title: t('connectSuccess'), icon: 'success' })
  startSimulation()
}

const togglePressureAuto = (e: any) => {
  pressureAuto.value = e.detail.value
  if (pressureAuto.value) {
    // 自动模式：调到适中值 6 kPa
    targetPressure.value = 6
    uni.showToast({ title: t('autoModeEnabled'), icon: 'none' })
  }
}

const toggleTempAuto = (e: any) => {
  tempAuto.value = e.detail.value
  if (tempAuto.value) {
    // 自动模式：调到舒适值 25°C
    targetTemp.value = 25
    uni.showToast({ title: t('autoModeEnabled'), icon: 'none' })
  }
}

const onPressureChange = (e: any) => { targetPressure.value = e.detail.value }
const onTempChange = (e: any) => { targetTemp.value = e.detail.value }

const startSimulation = () => {
  pressureTimer = setInterval(() => {
    if (currentPressure.value < targetPressure.value) {
      currentPressure.value = Math.min(currentPressure.value + 0.5, targetPressure.value)
    } else if (currentPressure.value > targetPressure.value) {
      currentPressure.value = Math.max(currentPressure.value - 0.5, targetPressure.value)
    }
    currentPressure.value = Math.round(currentPressure.value * 10) / 10
  }, 500) as unknown as number

  tempTimer = setInterval(() => {
    if (currentTemp.value < targetTemp.value) {
      currentTemp.value = Math.min(currentTemp.value + 1, targetTemp.value)
    } else if (currentTemp.value > targetTemp.value) {
      currentTemp.value = Math.max(currentTemp.value - 1, targetTemp.value)
    }
  }, 800) as unknown as number
}

onMounted(() => {
  const connected = uni.getStorageSync('deviceConnected')
  if (connected) {
    isConnected.value = true
    connectMode.value = uni.getStorageSync('connectMode') || 'bluetooth'
    startSimulation()
  }
})

onUnmounted(() => {
  if (pressureTimer) clearInterval(pressureTimer)
  if (tempTimer) clearInterval(tempTimer)
})
</script>

<style lang="scss" scoped src="./index.scss"></style>
