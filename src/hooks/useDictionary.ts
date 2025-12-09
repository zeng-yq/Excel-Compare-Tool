'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPath, i18n } from '@/lib/i18n-config';
import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n-config';

// 简单的字典缓存
const dictionaryCache = new Map<Locale, any>();

/**
 * 客户端字典钩子
 * 返回当前语言的字典对象
 */
export function useDictionary() {
  const pathname = usePathname();
  const locale = (getLocaleFromPath(pathname) || i18n.defaultLocale) as Locale;
  const [dictionary, setDictionary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDictionary = async () => {
      if (dictionaryCache.has(locale)) {
        setDictionary(dictionaryCache.get(locale));
        setLoading(false);
        return;
      }

      try {
        let dictData;
        switch (locale) {
          case 'zh':
            dictData = await import('@/dictionaries/zh.json');
            break;
          default:
            dictData = await import('@/dictionaries/en.json');
            break;
        }

        dictionaryCache.set(locale, dictData.default);
        setDictionary(dictData.default);
      } catch (error) {
        console.error('Failed to load dictionary:', error);
        // 降级到英语
        try {
          const fallbackDict = await import('@/dictionaries/en.json');
          dictionaryCache.set(locale, fallbackDict.default);
          setDictionary(fallbackDict.default);
        } catch (fallbackError) {
          console.error('Failed to load fallback dictionary:', fallbackError);
          setDictionary({});
        }
      } finally {
        setLoading(false);
      }
    };

    loadDictionary();
  }, [locale]);

  return { dictionary, loading, locale };
}