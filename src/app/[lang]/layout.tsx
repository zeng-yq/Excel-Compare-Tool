import { i18n, type Locale } from '@/lib/i18n-config'
import { NavigationWrapper } from '@/components/NavigationWrapper'
import { FooterWrapper } from '@/components/FooterWrapper'
import { Metadata } from 'next'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <NavigationWrapper locale={params.lang} />
      <main className="flex-1">{children}</main>
      <FooterWrapper locale={params.lang} />
    </div>
  )
}
