'use client'

import React, { useState, useCallback } from 'react'
import { GitCompare, ListChecks, Link, X } from 'lucide-react'
import { useDictionary } from '@/hooks/useDictionary'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'

interface StepCardProps {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  isActive: boolean
  index: number
  imageSrc?: string
  onImageClick?: (imageSrc: string) => void
  compareButtonText: string
}

const StepCard: React.FC<StepCardProps> = ({ icon, title, description, features, isActive, index, imageSrc, onImageClick, compareButtonText }) => {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div
      className={`p-8 rounded-3xl transition-all duration-500 transform ${
        isActive
          ? 'scale-105'
          : 'scale-100'
      }`}
      style={{
        animation: isActive ? `slideIn 0.5s ease-out` : 'none',
      }}
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* 左侧内容区域 */}
        <div className="space-y-6">
          {/* 小标题区域 */}
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-xl transition-colors duration-300 ${
                isActive ? '' : 'bg-gray-100 text-gray-600'
              }`}
              style={{
                backgroundColor: isActive ? 'rgba(32, 168, 132, 0.1)' : undefined,
                color: isActive ? '#20A884' : undefined
              }}
            >
              {icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            </div>
          </div>

          {/* 文字内容区域 */}
          <div className="space-y-6">
            <p className="text-sm text-gray-700 leading-relaxed">{description}</p>

            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    isActive ? '' : 'bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#20A884' : undefined
                  }}
                />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Upload & Compare Now 按钮 - 仅在有按钮文字时显示 */}
            {compareButtonText && (
              <div className="pt-4">
                <button
                  onClick={() => {
                    if (index === 1) {
                      // Column Diff 模式：跳转到 Compare Two Columns 页面
                      // 检查当前路径是否包含语言前缀
                      const pathSegments = pathname.split('/').filter(Boolean)
                      if (pathSegments.length > 0 && ['zh', 'ja'].includes(pathSegments[0])) {
                        router.push(`/${pathSegments[0]}/compare-two-columns`)
                      } else {
                        router.push('/compare-two-columns')
                      }
                    } else {
                      // Sheet Diff 模式：滚动到页面顶部
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className={`w-1/2 mx-auto py-2.5 px-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
                    isActive
                      ? 'bg-[#20A884] text-white hover:bg-[#1a866a]'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#20A884' : undefined
                  }}
                >
                  {compareButtonText}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 右侧图片 */}
        <div className="relative h-64 md:h-auto">
          {imageSrc && (
            <div
              className="relative w-full h-64 md:h-96 cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() => onImageClick && onImageClick(imageSrc)}
            >
              <Image
                src={imageSrc}
                alt={`${title} illustration`}
                fill
                className="object-cover rounded-xl"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function HowToCompareSection() {
  const { dictionary, loading } = useDictionary()
  const [activeIndex, setActiveIndex] = useState(0)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)

  // Translation helper
  const t = (path: string, params?: Record<string, any>) => {
    const keys = path.split('.')
    let value = dictionary
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key as keyof typeof value]
      } else {
        return path // Return key if translation not found
      }
    }

    if (typeof value === 'string' && params) {
      return value.replace(/\{(\w+)\}/g, (match: string, param: string) => {
        return params[param] || match
      })
    }

    return value
  }

  const steps = [
    {
      icon: <GitCompare className="w-6 h-6" />,
      title: t('howToCompare.step1.title'),
      description: t('howToCompare.step1.description'),
      features: [
        t('howToCompare.step1.feature1'),
        t('howToCompare.step1.feature2'),
        t('howToCompare.step1.feature3')
      ],
      imageSrc: '/images/landing-page/excel-comparison-side-by-side-highlight.webp',
      compareButtonText: t('howToCompare.compareSheetsButton')
    },
    {
      icon: <ListChecks className="w-6 h-6" />,
      title: t('howToCompare.step2.title'),
      description: t('howToCompare.step2.description'),
      features: [
        t('howToCompare.step2.feature1'),
        t('howToCompare.step2.feature2'),
        t('howToCompare.step2.feature3')
      ],
      imageSrc: '/images/landing-page/compare-two-columns.webp',
      compareButtonText: t('howToCompare.compareColumnsButton')
    },
    {
      icon: <Link className="w-6 h-6" />,
      title: t('howToCompare.step3.title'),
      description: t('howToCompare.step3.description'),
      features: [
        t('howToCompare.step3.feature1'),
        t('howToCompare.step3.feature2'),
        t('howToCompare.step3.feature3')
      ],
      imageSrc: '/coming-soon.svg',
      compareButtonText: '' // No button for step 3
    }
  ]

  const selectStep = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  // Show loading state while dictionary is loading
  if (loading || !dictionary) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-8 animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {t('howToCompare.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('howToCompare.subtitle')}
          </p>
        </div>

        <div className="relative">
          <div className="mt-8 mb-8 flex justify-center">
            <div className="relative bg-gray-100 rounded-full p-1 flex gap-1 w-96 max-w-full">
              {/* 滑动背景 */}
              <div
                className="absolute top-1 h-10 rounded-full transition-all duration-300 ease-out shadow-md"
                style={{
                  width: 'calc((100% - 8px) / 3)',
                  left: `calc(${activeIndex} * (100% - 8px) / 3 + 4px)`,
                  backgroundColor: '#20A884'
                }}
              />
              {/* 选项按钮 */}
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => selectStep(index)}
                  className={`relative z-10 flex-1 py-3 px-4 rounded-full font-medium transition-all duration-300 text-sm ${
                    activeIndex === index
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {t(`howToCompare.stepButton.step${index + 1}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="transition-all duration-500 ease-in-out">
            <StepCard
              {...steps[activeIndex]}
              isActive={true}
              index={activeIndex}
              onImageClick={setEnlargedImage}
            />
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex gap-3">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => selectStep(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? 'w-12'
                      : 'w-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  style={{
                    backgroundColor: activeIndex === index ? '#20A884' : undefined
                  }}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 图片放大模态框 */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setEnlargedImage(null)
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex items-center justify-center">
              <Image
                src={enlargedImage}
                alt="Enlarged view"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}