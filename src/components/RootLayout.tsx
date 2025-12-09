// components/RootLayout.tsx
import { NavigationI18n } from './NavigationI18n'
import { FooterI18n } from './FooterI18n'
import { getDictionary } from '@/lib/get-dictionary'

export async function RootLayout({ children }: { children: React.ReactNode }) {
  const dictionary = await getDictionary('en')

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col">
      <NavigationI18n locale="en" />
      <main className="flex-1">{children}</main>
      <FooterI18n locale="en" dictionary={dictionary} />
    </div>
  )
}