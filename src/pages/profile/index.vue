<template>
  <view class="profile">
    <view class="user-card">
      <view class="avatar">
        <text class="avatar-placeholder">{{ userInfo.nickname.slice(0, 1) }}</text>
      </view>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname }}</text>
        <text class="user-id">ID: {{ userInfo.id }}</text>
      </view>
    </view>

    <view class="section">
      <view class="section-title">{{ t('deviceInfo') }}</view>
      <view class="menu-group">
        <view class="menu-item">
          <view class="menu-icon">📱</view>
          <text class="menu-text">{{ t('connectionStatus') }}</text>
          <view class="status-tag" :class="{ connected: deviceInfo.connected }">
            {{ deviceInfo.connected ? t('connected') : t('notConnected') }}
          </view>
        </view>
        <view class="menu-item">
          <view class="menu-icon">🏷️</view>
          <text class="menu-text">{{ t('deviceModel') }}</text>
          <text class="menu-value">{{ deviceInfo.model }}</text>
        </view>
        <view class="menu-item">
          <view class="menu-icon">📦</view>
          <text class="menu-text">{{ t('firmwareVersion') }}</text>
          <text class="menu-value">{{ deviceInfo.firmware }}</text>
        </view>
        <view class="menu-item">
          <view class="menu-icon">🔢</view>
          <text class="menu-text">{{ t('serialNumber') }}</text>
          <text class="menu-value">{{ deviceInfo.serialNo }}</text>
        </view>
        <view class="menu-item" @tap="toggleConnection">
          <view class="menu-icon">🔗</view>
          <text class="menu-text">{{ deviceInfo.connected ? t('disconnect') : t('connect') }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-title">{{ t('aboutSettings') }}</view>
      <view class="menu-group">
        <view class="menu-item" @tap="switchLang">
          <view class="menu-icon">🌐</view>
          <text class="menu-text">{{ t('language') }}</text>
          <view class="lang-switch">
            <text>{{ currentLang === 'zh' ? '中文' : 'English' }}</text>
          </view>
        </view>
        <view class="menu-item" @tap="showAgreement">
          <view class="menu-icon">📄</view>
          <text class="menu-text">{{ t('userAgreement') }}</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="showPrivacy">
          <view class="menu-icon">🔒</view>
          <text class="menu-text">{{ t('privacyPolicy') }}</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-item" @tap="showAbout">
          <view class="menu-icon">ℹ️</view>
          <text class="menu-text">{{ t('aboutUs') }}</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
    </view>

    <view class="version-info">
      <text>{{ t('smartPillow') }} v{{ appVersion }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n, toggleLang } from '@/utils/i18n'

const { t, currentLang } = useI18n()
const appVersion = '1.0.0'

const userInfo = reactive({
  id: '10086',
  nickname: '睡眠达人'
})

const deviceInfo = reactive({
  connected: true,
  model: 'SXQ-P100',
  firmware: 'v2.1.3',
  serialNo: 'SXQ2024001234'
})

const switchLang = () => {
  toggleLang()
  uni.showToast({ title: currentLang.value === 'zh' ? t('switchedToZh') : t('switchedToEn'), icon: 'none' })
}

const toggleConnection = () => {
  if (deviceInfo.connected) {
    uni.showModal({
      title: t('disconnect'),
      content: t('disconnectConfirm'),
      success: (res) => {
        if (res.confirm) {
          deviceInfo.connected = false
          uni.setStorageSync('deviceConnected', false)
          uni.showToast({ title: t('disconnected'), icon: 'none' })
        }
      }
    })
  } else {
    uni.switchTab({ url: '/pages/home/index' })
  }
}

const showAgreement = () => {
  uni.showModal({
    title: t('userAgreement'),
    content: t('agreementContent'),
    showCancel: false
  })
}

const showPrivacy = () => {
  uni.showModal({
    title: t('privacyPolicy'),
    content: t('privacyContent'),
    showCancel: false
  })
}

const showAbout = () => {
  uni.showModal({
    title: t('aboutUs'),
    content: `${t('smartPillow')} v${appVersion}\n\n${t('aboutContent')}`,
    showCancel: false
  })
}
</script>

<style lang="scss" scoped src="./index.scss"></style>
