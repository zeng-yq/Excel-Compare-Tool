// components/ArticleList.js
'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { getLocaleFromPath, addLocaleToPath, i18n } from '@/lib/i18n-config'
import { Calendar, Image as ImageIcon } from 'lucide-react'

// Custom image component with error handling
function ArticleImage({ src, alt, ...props }) {
  const [imgSrc, setImgSrc] = React.useState(src)
  const [hasError, setHasError] = React.useState(false)

  React.useEffect(() => {
    setImgSrc(src)
    setHasError(false)
  }, [src])

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/images/default-article-cover.svg')
    }
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  )
}

export default function ArticleList({ articles, showMoreLink = true }) {
  const pathname = usePathname()
  const currentLocale = getLocaleFromPath(pathname) || i18n.defaultLocale

  const getLocalizedPath = (path) => {
    return addLocaleToPath(path, currentLocale)
  }

  // Simple translation object for client-side use
  const translations = {
    en: {
      title: 'Articles',
      moreArticles: 'More articles →',
      noArticles: 'No articles available'
    },
    zh: {
      title: '文章',
      moreArticles: '更多文章 →',
      noArticles: '暂无文章'
    }
  }

  const t = translations[currentLocale] || translations.en

  // Default placeholder image for articles without cover image
  const defaultCoverImage = "/images/default-article-cover.svg"

  // Format date based on locale
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(currentLocale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Truncate description to reasonable length
  const truncateDescription = (description, maxLength = 150) => {
    if (description.length <= maxLength) return description
    return description.slice(0, maxLength) + '...'
  }

  return (
    <section>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter">
          {t.title}
        </h1>
        {showMoreLink && (
          <Link
            href={getLocalizedPath('/posts')}
            className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            {t.moreArticles}
          </Link>
        )}
      </div>

      {/* Grid layout for article cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {articles.map(({ id, title, description, date, coverImage }) => (
          <Link
            key={id}
            href={getLocalizedPath(`/posts/${id}`)}
            className="block group hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg border bg-card text-card-foreground"
          >
            <Card className="border-0 shadow-none hover:shadow-none">
              {/* Cover Image Section */}
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {coverImage ? (
                  <ArticleImage
                    src={coverImage}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <CardContent className="p-5">
                <div className="space-y-3">
                  {/* Article Title */}
                  <CardTitle className="text-xl leading-tight">
                    <div className="text-gray-900 group-hover:text-[#20A884] transition-colors">
                      {title}
                    </div>
                  </CardTitle>

                  {/* Article Description */}
                  <CardDescription
                    className="text-sm text-gray-600"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {truncateDescription(description)}
                  </CardDescription>

                  {/* Article Date */}
                  <div className="flex items-center text-sm text-gray-500 pt-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(date)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Empty state */}
      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t.noArticles}
          </p>
        </div>
      )}
    </section>
  )
}
