// Direct English version page
import { RootLayout } from '@/components/RootLayout'
import CompareTwoColumnsPage from '../[lang]/compare-two-columns/page'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Two Excel Columns - Find Duplicates & Differences',
  description: 'Instantly compare two lists in Excel to find matches (intersections) and missing values. No VLOOKUP formulas required. Free, secure, and visual.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  alternates: {
    canonical: 'https://excelcompare.org/compare-two-columns'
  },
}

export default function CompareTwoColumns() {
  return (
    <RootLayout>
      <CompareTwoColumnsPage params={{ lang: 'en' }} />
    </RootLayout>
  )
}