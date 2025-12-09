// components/FooterWrapper.tsx
import { getDictionary } from '@/lib/get-dictionary'
import { FooterI18n } from './FooterI18n'
import { i18n } from '@/lib/i18n-config'

interface FooterWrapperProps {
  locale?: 'en' | 'zh';
}

export async function FooterWrapper({ locale }: FooterWrapperProps) {
  // If locale not provided, get it from pathname
  let currentLocale = locale;

  if (!currentLocale) {
    // This is a server component, so we need to handle pathname differently
    // For now, we'll use the default locale approach
    currentLocale = i18n.defaultLocale;
  }

  const dict = await getDictionary(currentLocale);

  return <FooterI18n locale={currentLocale} dictionary={dict} />
}