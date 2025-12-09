// components/NavigationWrapper.tsx
import { getDictionary } from '@/lib/get-dictionary'
import { NavigationI18n } from './NavigationI18n'
import { i18n } from '@/lib/i18n-config'

interface NavigationWrapperProps {
  locale?: 'en' | 'zh';
}

export async function NavigationWrapper({ locale }: NavigationWrapperProps) {
  // If locale not provided, use default locale
  let currentLocale = locale || i18n.defaultLocale;

  const dict = await getDictionary(currentLocale);

  return <NavigationI18n locale={currentLocale} dictionary={dict} />
}