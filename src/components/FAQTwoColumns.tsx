export default function FAQTwoColumns() {
  const faqs = [
    {
      number: "1",
      question: "How do I compare two columns in Excel for duplicates without formulas?",
      answer: <>Simply upload your file to ExcelCompare, select the two columns you want to check, and click the &quot;Intersection&quot; button. The tool will instantly extract all duplicate values found in both lists, saving you from writing COUNTIF or VLOOKUP formulas.</>
    },
    {
      number: "2",
      question: "Can I compare columns from two different Excel files?",
      answer: <>Yes. Native Excel requires both sheets to be in the same workbook for easy comparison. Our online tool allows you to upload two separate files (e.g., January.xlsx and February.xlsx) and compare specific columns side-by-side immediately.</>
    },
    {
      number: "3",
      question: "What if the data has extra spaces or different casing?",
      answer: <>Our tool includes smart trimming. It automatically ignores leading/trailing spaces, ensuring that &quot; Apple &quot; and &quot;Apple&quot; are treated as a match. This saves hours of manual data cleaning.</>
    },
    {
      number: "4",
      question: "Is this tool different from the \"Sheet Comparison\" on the homepage?",
      answer: <>Yes. The homepage tool is for &quot;Visual Diffing&quot;—it highlights changes in layout, formatting, and cell content row-by-row. This &quot;Column Comparison&quot; tool is for Lists (Set Logic). It ignores row positions and focuses purely on whether items exist in one list or the other.</>
    },
    {
      number: "5",
      question: "I need to match rows by ID and then compare their values (e.g., Price). Is this the right tool?",
      answer: <>No. If you need to align rows based on a Key (like SKU) and then compare a Value (like Price), please use our Key + Value Comparison tool. The current page is strictly for comparing the contents of two single columns.</>
    },
    {
      number: "6",
      question: "Is my data secure?",
      answer: <>Completely. All comparison processing happens in your browser (Client-side). Your Excel files are never uploaded to our server or stored, ensuring your sensitive lists remain private.</>
    }
  ]

  return (
    <section className="py-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold tracking-tighter">
          FAQ about Comparing Two Columns
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
  )
}