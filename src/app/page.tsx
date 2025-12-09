// Root page (English version)
import ExcelUploadArea from '@/components/excel-compare/ExcelUploadArea'
import HowToCompareSectionEnglish from '@/components/HowToCompareSectionEnglish'
import KeyFeatures from '@/components/KeyFeatures'
import FAQ from '@/components/FAQ'
import UserReviews from '@/components/UserReviews'
import { RootLayout } from '@/components/RootLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Excel Files Online - Free Visual Diff Tool (No Sign-up)',
  description: 'Instantly spot differences between two Excel spreadsheets. Side-by-side comparison, smart highlighting, and 100% private (client-side). No VLOOKUP needed.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  alternates: {
    canonical: 'https://excelcompare.org'
  },
}

export default function Home() {
  return (
    <RootLayout>
      <div className="container mx-auto py-12 space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
            <span className="text-gray-700"><span style={{ color: '#20A884' }}>Compare</span> Excel Files Online</span>
          </h1>
          <div className="text-2xl tracking-tighter sm:text-3xl md:text-3xl lg:text-3xl !mt-8">Say goodbye to tedious Excel formulas</div>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl flex items-center justify-center gap-2">
            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M583.616 384l12.48 34.304a16 16 0 0 0 9.6 9.6l55.552 20.096H298.688l55.68-20.096a16 16 0 0 0 9.6-9.6L376.32 384h207.296z" fill="#FFBA3F"></path>
              <path d="M560.512 768l-23.104 64H422.592l-23.104-64z" fill="#FFA441"></path>
              <path d="M661.12 640l-55.424 20.096a16 16 0 0 0-9.6 9.6L583.616 704H376.32l-12.416-34.304a16 16 0 0 0-9.6-9.6L298.88 640h362.304z" fill="#FFAB41"></path>
              <path d="M838.464 512l46.976 16.96a16 16 0 0 1 0 30.08L838.272 576H121.664l-47.104-16.96a16 16 0 0 1 0-30.08L121.472 512h716.992z" fill="#FFB340"></path>
              <path d="M537.408 256l23.104 64H399.488l23.104-64h114.816z m321.152 0l-21.952 60.8a4.928 4.928 0 0 1-9.216 0L805.376 256h53.184z" fill="#FFC23F"></path>
              <path d="M485.44 128.96a16 16 0 0 1 9.6 9.6L514.304 192H445.632l19.328-53.44a16 16 0 0 1 20.48-9.6zM858.56 128l9.152 25.344a4.928 4.928 0 0 0 2.944 2.944l86.08 31.104A4.928 4.928 0 0 1 960 192h-256l0.32-1.728a4.928 4.928 0 0 1 2.944-2.944l86.08-31.104a4.928 4.928 0 0 0 2.944-2.944L805.376 128h53.184z" fill="#FFCA3E"></path>
              <path d="M583.616 704l-23.104 64H399.488l-23.104-64z" fill="#FFA841"></path>
              <path d="M838.464 576l-177.344 64H298.816l-177.28-64z" fill="#FFAF40"></path>
              <path d="M514.304 896l-19.264 53.44a16 16 0 0 1-30.08 0L445.696 896h68.608z" fill="#FF9D43"></path>
              <path d="M661.12 448l177.344 64H121.536l177.28-64z" fill="#FFB740"></path>
              <path d="M560.512 320l23.104 64H376.384l23.104-64z" fill="#FFBE3F"></path>
              <path d="M514.24 191.936l23.168 64H422.592l23.104-64h68.544z m445.44 1.728a4.928 4.928 0 0 1-2.944 2.944l-86.08 31.104a4.928 4.928 0 0 0-2.944 2.944L858.56 256h-53.184l-9.088-25.28a4.928 4.928 0 0 0-2.944-2.944l-86.08-31.104A4.928 4.928 0 0 1 704 192h256l-0.32 1.728z" fill="#FFC53E"></path>
              <path d="M833.664 64.32a4.928 4.928 0 0 1 2.944 2.944l21.952 60.736h-53.184l22.016-60.8a4.928 4.928 0 0 1 6.272-2.88z" fill="#FFCC3E"></path>
              <path d="M537.408 832l-23.104 64H445.696l-23.104-64z" fill="#FFA142"></path>
            </svg>
            Side-by-side Excel comparison with instant highlighting.
            <svg className="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M583.616 384l12.48 34.304a16 16 0 0 0 9.6 9.6l55.552 20.096H298.688l55.68-20.096a16 16 0 0 0 9.6-9.6L376.32 384h207.296z" fill="#FFBA3F"></path>
              <path d="M560.512 768l-23.104 64H422.592l-23.104-64z" fill="#FFA441"></path>
              <path d="M661.12 640l-55.424 20.096a16 16 0 0 0-9.6 9.6L583.616 704H376.32l-12.416-34.304a16 16 0 0 0-9.6-9.6L298.88 640h362.304z" fill="#FFAB41"></path>
              <path d="M838.464 512l46.976 16.96a16 16 0 0 1 0 30.08L838.272 576H121.664l-47.104-16.96a16 16 0 0 1 0-30.08L121.472 512h716.992z" fill="#FFB340"></path>
              <path d="M537.408 256l23.104 64H399.488l23.104-64h114.816z m321.152 0l-21.952 60.8a4.928 4.928 0 0 1-9.216 0L805.376 256h53.184z" fill="#FFC23F"></path>
              <path d="M485.44 128.96a16 16 0 0 1 9.6 9.6L514.304 192H445.632l19.328-53.44a16 16 0 0 1 20.48-9.6zM858.56 128l9.152 25.344a4.928 4.928 0 0 0 2.944 2.944l86.08 31.104A4.928 4.928 0 0 1 960 192h-256l0.32-1.728a4.928 4.928 0 0 1 2.944-2.944l86.08-31.104a4.928 4.928 0 0 0 2.944-2.944L805.376 128h53.184z" fill="#FFCA3E"></path>
              <path d="M583.616 704l-23.104 64H399.488l-23.104-64z" fill="#FFA841"></path>
              <path d="M838.464 576l-177.344 64H298.816l-177.28-64z" fill="#FFAF40"></path>
              <path d="M514.304 896l-19.264 53.44a16 16 0 0 1-30.08 0L445.696 896h68.608z" fill="#FF9D43"></path>
              <path d="M661.12 448l177.344 64H121.536l177.28-64z" fill="#FFB740"></path>
              <path d="M560.512 320l23.104 64H376.384l23.104-64z" fill="#FFBE3F"></path>
              <path d="M514.24 191.936l23.168 64H422.592l23.104-64h68.544z m445.44 1.728a4.928 4.928 0 0 1-2.944 2.944l-86.08 31.104a4.928 4.928 0 0 0-2.944 2.944L858.56 256h-53.184l-9.088-25.28a4.928 4.928 0 0 0-2.944-2.944l-86.08-31.104A4.928 4.928 0 0 1 704 192h256l-0.32 1.728z" fill="#FFC53E"></path>
              <path d="M833.664 64.32a4.928 4.928 0 0 1 2.944 2.944l21.952 60.736h-53.184l22.016-60.8a4.928 4.928 0 0 1 6.272-2.88z" fill="#FFCC3E"></path>
              <path d="M537.408 832l-23.104 64H445.696l-23.104-64z" fill="#FFA142"></path>
            </svg>
          </p>
          <div className="flex items-center justify-center gap-3 !mt-8">
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">100% Free</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Privacy First</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">No Formulas</span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">Instant Diff</span>
          </div>
        </section>

        {/* Excel Upload Area */}
        <ExcelUploadArea />

        {/* How to Compare 区域 */}
        <HowToCompareSectionEnglish />

        {/* Key Features 区域 */}
        <KeyFeatures />

        {/* User Reviews 区域 */}
        <UserReviews />

        {/* FAQ 区域 */}
        <FAQ />
      </div>
    </RootLayout>
  )
}