import 'server-only'
import type { Locale } from './i18n-config'
import type { Dictionary } from '@/types/dictionary'

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default as Dictionary),
  zh: () => import('@/dictionaries/zh.json').then((module) => module.default as Dictionary),
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  return dictionaries[locale]?.() ?? dictionaries.en()
}
