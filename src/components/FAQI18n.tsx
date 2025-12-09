'use client'

import React from 'react'

interface FAQProps {
  dictionary: any
}

export default function FAQI18n({ dictionary }: FAQProps) {
  const faqs = dictionary.faq.questions

  // Generate JSON-LD structured data for SEO
  const generateFAQSchema = () => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer.replace(/<[^>]*>/g, '') // Remove HTML tags for schema
        }
      }))
    }

    return JSON.stringify(faqSchema)
  }

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateFAQSchema() }}
      />

      <section className="py-16">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tighter">
          {dictionary.faq.title}
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
          {dictionary.faq.subtitle}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 -mx-4 md:-mx-8">
          {faqs.map((faq: any, index: number) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors rounded-lg">
              <div className="flex gap-4 items-center mb-2">
                <span className="text-sm font-bold h-6 w-6 flex items-center justify-center rounded-md border-2 flex-shrink-0" style={{ borderColor: '#20A884', color: '#20A884' }}>
                  {index + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-10" dangerouslySetInnerHTML={{ __html: faq.answer }}>
              </p>
            </div>
          ))}
        </div>
    </section>
    </>
  )
}