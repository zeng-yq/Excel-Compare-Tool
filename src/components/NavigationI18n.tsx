'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LanguageSwitcher from '@/components/LanguageSwitcher'
import LanguageSuggestion from '@/components/LanguageSuggestion'
import { i18n, getLocaleFromPath } from '@/lib/i18n-config'

interface NavigationI18nProps {
  locale?: 'en' | 'zh';
  dictionary?: any;
}

export function NavigationI18n({ locale, dictionary }: NavigationI18nProps) {
  const pathname = usePathname()

  // Extract current locale from pathname if not provided
  const currentLocale = locale || getLocaleFromPath(pathname) || i18n.defaultLocale

  // Get localized paths for nav items
  const getLocalizedPath = (path: string) => {
    if (currentLocale === i18n.defaultLocale) {
      return path
    }
    return `/${currentLocale}${path}`
  }

  // Navigation items using dictionary, fallback to English
  const navItems = dictionary?.navigation ? [
    { path: '/', label: dictionary.navigation.home },
    { path: '/compare-two-columns', label: dictionary.navigation.compareTwoColumns },
    { path: '/posts', label: dictionary.navigation.posts },
  ] : [
    { path: '/', label: 'Home' },
    { path: '/compare-two-columns', label: 'Compare Two Columns' },
    { path: '/posts', label: 'Articles' },
  ]

  return (
    <>
      <LanguageSuggestion currentLocale={currentLocale} currentPath={pathname} />
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
        <div className="flex gap-6 md:gap-10">
          <Link href={getLocalizedPath('/')} className="flex items-center space-x-2">
            <svg className="icon h-8 w-8" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="256" height="256">
              <path d="M776.704 985.6H247.296c-84.48 0-153.6-69.12-153.6-154.112V189.952C93.696 105.472 162.816 35.84 247.296 35.84h378.88c40.96 0 79.36 18.944 104.448 50.688L901.12 303.616c18.432 23.552 28.672 52.736 28.672 82.432v444.928c0.512 84.992-68.608 154.624-153.088 154.624z" fill="#E9F6F3"></path>
              <path d="M776.704 1021.44H247.296c-104.448 0-189.44-84.992-189.44-189.952V189.952C57.856 84.992 142.848 0 247.296 0h378.88c52.224 0 100.352 23.552 132.608 64.512L929.28 281.6c23.552 29.696 36.352 66.56 36.352 104.96v444.928c0.512 104.96-84.48 189.952-188.928 189.952zM247.296 71.68c-65.024 0-117.76 52.736-117.76 118.272v641.536c0 65.024 52.736 118.272 117.76 118.272h528.896c65.024 0 117.76-52.736 117.76-118.272V386.56c0-21.504-7.168-43.008-20.992-60.416l-170.496-217.088c-18.432-23.552-46.592-36.864-76.288-36.864 0-0.512-378.88-0.512-378.88-0.512z" fill="#A3DBCC"></path>
              <path d="M595.456 749.056l-86.528-128-86.528 128H314.368l140.8-195.072-130.56-188.928h107.52l76.8 123.904 76.288-123.904h107.52l-130.56 188.928 140.8 195.072z" fill="#20A884"></path>
            </svg>
            <span className="inline-block font-bold">
              <span className="text-gray-700">Excel</span>
              <span style={{ color: '#20A884' }}>Compare</span>
            </span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => {
              const localizedPath = getLocalizedPath(item.path)
              return (
                <Link
                  key={item.path}
                  href={localizedPath}
                  className={cn(
                    "flex items-center text-sm font-medium text-muted-foreground",
                    pathname === localizedPath && "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={currentLocale} />
        </div>
      </div>
    </header>
    </>
  )
}