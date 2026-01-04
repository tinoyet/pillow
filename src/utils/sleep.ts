// 睡眠质量等级
export type SleepQuality = 'excellent' | 'good' | 'fair' | 'poor'

// 睡眠数据接口
export interface SleepData {
  date: string
  duration: number // 分钟
  deepSleep: number // 深睡时长(分钟)
  lightSleep: number // 浅睡时长(分钟)
  remSleep: number // REM睡眠(分钟)
  awakeTime: number // 清醒时长(分钟)
  score: number // 睡眠评分 0-100
  heartRate: number[] // 心率数据
  breathRate: number[] // 呼吸率数据
}

// 获取睡眠质量等级
export function getSleepQuality(score: number): SleepQuality {
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  if (score >= 50) return 'fair'
  return 'poor'
}

// 获取睡眠质量文字
export function getSleepQualityText(quality: SleepQuality): string {
  const map = {
    excellent: '优秀',
    good: '良好',
    fair: '一般',
    poor: '较差'
  }
  return map[quality]
}

// 格式化时长
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}小时${mins}分钟`
}

// 生成模拟睡眠数据
export function generateMockSleepData(date: string): SleepData {
  const duration = 360 + Math.floor(Math.random() * 180) // 6-9小时
  const deepSleep = Math.floor(duration * (0.15 + Math.random() * 0.1))
  const remSleep = Math.floor(duration * (0.2 + Math.random() * 0.05))
  const awakeTime = Math.floor(Math.random() * 30)
  const lightSleep = duration - deepSleep - remSleep - awakeTime

  return {
    date,
    duration,
    deepSleep,
    lightSleep,
    remSleep,
    awakeTime,
    score: 60 + Math.floor(Math.random() * 35),
    heartRate: Array.from({ length: 24 }, () => 55 + Math.floor(Math.random() * 15)),
    breathRate: Array.from({ length: 24 }, () => 12 + Math.floor(Math.random() * 6))
  }
}

// 获取最近N天的日期
export function getRecentDates(days: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}
