// Multi-language home page
import ExcelUploadArea from '@/components/excel-compare/ExcelUploadArea'
import HowToCompareSection from '@/components/HowToCompareSection'
import KeyFeaturesI18n from '@/components/KeyFeaturesI18n'
import FAQI18n from '@/components/FAQI18n'
import UserReviewsI18n from '@/components/UserReviewsI18n'
import { Metadata } from 'next'
import { i18n, type Locale } from '@/lib/i18n-config'
import { getDictionary } from '@/lib/get-dictionary'

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(params.lang)

  return {
    title: dict.home.title + ' - ' + dict.home.subtitle,
    description: dict.home.description,
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    alternates: {
      canonical: `https://excelcompare.org/${params.lang}`
    },
  }
}

export default async function Home({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang)

  return (
    <div className="container mx-auto py-12 space-y-16">
      <section className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">
          <span className="text-gray-700">{dict.home.title}</span>{' '}
          <span style={{ color: '#20A884' }}>Compare</span>
        </h1>
        <div className="text-2xl tracking-tighter sm:text-3xl md:text-3xl lg:text-3xl !mt-8">{dict.home.subtitle}</div>
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
          {dict.home.description}
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
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{dict.home.tagline1}</span>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{dict.home.tagline2}</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{dict.home.tagline3}</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">{dict.home.tagline4}</span>
        </div>
      </section>

      {/* Excel 上传区域 */}
      <ExcelUploadArea />

      {/* How to Compare 区域 */}
      <HowToCompareSection />

      {/* Key Features 区域 */}
      <KeyFeaturesI18n dictionary={dict} />

      {/* User Reviews 区域 */}
      <UserReviewsI18n dictionary={dict} />

      {/* FAQ 区域 */}
      <FAQI18n dictionary={dict} />
    </div>
  )
}
