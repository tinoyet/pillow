import { ref } from 'vue'
import zhMessages from '@/locales/zh'
import enMessages from '@/locales/en'

export type Lang = 'zh' | 'en'
export const currentLang = ref<Lang>('zh')

const messages: Record<Lang, Record<string, string>> = {
  zh: zhMessages,
  en: enMessages
}

export const toggleLang = () => {
  currentLang.value = currentLang.value === 'zh' ? 'en' : 'zh'
}

export const setLang = (lang: Lang) => {
  currentLang.value = lang
}

export const t = (key: string): string => {
  return messages[currentLang.value][key] || key
}

export const useI18n = () => {
  return { t, currentLang, toggleLang, setLang }
}
