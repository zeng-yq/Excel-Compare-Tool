export default function FAQ() {
  const faqs = [
    {
      number: "1",
      question: "What is the best way to compare two Excel files for differences online?",
      answer: <><strong>ExcelCompare</strong> offers the most intuitive solution. Unlike manual checking, our tool automates the process. Simply upload your <strong>original and modified sheets</strong>, and the system will instantly identify data discrepancies. It acts as a visual &quot;diff tool&quot; specifically designed for spreadsheets, making it the <strong>best tool to compare two Excel files</strong> without complex setups.</>
    },
    {
      number: "2",
      question: "How do I compare sheets side by side without extra software?",
      answer: <>You don&apos;t need to install heavy desktop software. <strong>ExcelCompare</strong> runs directly in your browser. It features <strong>smart synchronized scrolling</strong>, meaning when you scroll one sheet, the other moves automatically. This allows for a perfect <strong>side-by-side comparison</strong> of rows and columns to spot changes immediately.</>
    },
    {
      number: "3",
      question: "Can this tool automatically highlight changes between Excel spreadsheets?",
      answer: <>Yes. Our engine is designed to <strong>automatically highlight changes</strong> with distinct colors. Modified cells, added rows, and deleted data are color-coded (e.g., green for additions, red for deletions). This visual approach is much faster than standard Excel formulas for finding <strong>data discrepancies</strong>.</>
    },
    {
      number: "4",
      question: "Is it safe to use free online services to compare Excel files?",
      answer: <>Most online converters upload your data to a server, which is a risk. However, <strong>ExcelCompare is unique</strong>: we use <strong>client-side processing</strong> technology. Your data <strong>never leaves your computer</strong>; the comparison happens entirely within your browser. It is the most secure way to <strong>compare Excel sheets for differences</strong> online.</>
    },
    {
      number: "5",
      question: "Can I compare large Excel files with thousands of rows?",
      answer: <>Yes. Our engine is optimized for high performance. Whether you need to <strong>compare large Excel files</strong> or simple lists, the tool handles heavy datasets smoothly without the lag often seen in other web apps. We support files with extensive row counts, ensuring you can analyze big data efficiently.</>
    },
    {
      number: "6",
      question: "Is ExcelCompare completely free to use?",
      answer: <>Yes, we are one of the few truly <strong>free online services to compare Excel files</strong>. There are no hidden subscription fees, no &quot;Pro&quot; versions for basic features, and no credit card required. You get full access to professional comparison features at no cost.</>
    }
  ]

  // Generate JSON-LD structured data for SEO
  const generateFAQSchema = () => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer.props?.children ?
            Array.isArray(faq.answer.props.children) ?
              faq.answer.props.children.map((child: any) =>
                typeof child === 'string' ? child :
                child.props?.children || ''
              ).join('') :
              typeof faq.answer.props.children === 'string' ?
                faq.answer.props.children : ''
            : ''
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
          FAQ about Excel File Comparison
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
          Have another question? Contact us at support@excelcompare.org
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 -mx-4 md:-mx-8">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 hover:bg-gray-50 transition-colors rounded-lg">
              <div className="flex gap-4 items-center mb-2">
                <span className="text-sm font-bold h-6 w-6 flex items-center justify-center rounded-md border-2 flex-shrink-0" style={{ borderColor: '#20A884', color: '#20A884' }}>
                  {faq.number}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {faq.question}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed ml-10">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
    </section>
    </>
  )
}