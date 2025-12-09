"use client"

import Marquee from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

interface Review {
  name: string
  title: string
  body: string
  img: string
}

const reviews = [
  {
    name: "David C.",
    title: "Financial Controller",
    body: "Finally, a tool that doesn't require installation! My company IT policy is strict, so being able to run this safely in the browser is a lifesaver.",
    img: "/images/profile_pic/profile_pic_1.webp",
  },
  {
    name: "Sarah Jenkins",
    title: "Office Manager",
    body: "I used to print out two Excel sheets and compare them with a highlighter. This tool saved my eyesight and my sanity. Incredible.",
    img: "/images/profile_pic/profile_pic_2.webp",
  },
  {
    name: "Chris P.",
    title: "Marketing Director",
    body: "I initially came for the visual diff, but the 'Column Comparison' feature is a hidden gem for checking email lists for duplicates.",
    img: "/images/profile_pic/profile_pic_3.webp",
  },
  {
    name: "Sophia L.",
    title: "CRM Specialist",
    body: "It's not just about finding differences; it's about verifying what matches. The intersection tool helped me merge two client lists effortlessly.",
    img: "/images/profile_pic/profile_pic_4.webp",
  },
  {
    name: "Mike Ross",
    title: "Supply Chain Analyst",
    body: "The side-by-side scrolling is buttery smooth. It feels just like looking at one sheet. Found a hidden price change in seconds.",
    img: "/images/profile_pic/profile_pic_5.webp",
  },
  {
    name: "Brian K.",
    title: "Sales Operations",
    body: "I tried writing formulas to catch differences but always messed them up. Visual highlighting is so much more intuitive. Highly recommend.",
    img: "/images/profile_pic/profile_pic_6.webp",
  },
  {
    name: "Jessica L.",
    title: "Warehouse Manager",
    body: "It handles large files surprisingly well. I uploaded a 5,000-row inventory list and the comparison was instant. Great performance.",
    img: "/images/profile_pic/profile_pic_7.webp",
  },
  {
    name: "Robert H.",
    title: "CPA",
    body: "As an accountant, data privacy is my #1 concern. Knowing that my files are processed locally and never uploaded to a server gave me the confidence to use this tool.",
    img: "/images/profile_pic/profile_pic_8.webp",
  },
  {
    name: "Amanda G.",
    title: "Business Analyst",
    body: "Goodbye VLOOKUP errors! I used to spend hours debugging formulas just to compare two monthly reports. Now it's a drag-and-drop job.",
    img: "/images/profile_pic/profile_pic_9.webp",
  },
  {
    name: "Tom W.",
    title: "Project Lead",
    body: "The 'No Formulas' promise is real. I don't need to be an Excel wizard to spot the discrepancies in our quarterly budget anymore.",
    img: "/images/profile_pic/profile_pic_10.webp",
  },
  {
    name: "Rachel F.",
    title: "Data Entry Clerk",
    body: "I love that it ignores formatting changes and focuses on the actual data. Other tools highlight everything just because a font is bold. This one is smart.",
    img: "/images/profile_pic/profile_pic_11.webp",
  },
  {
    name: "Kevin D.",
    title: "Product Manager",
    body: "Comparing version 1 and version 2 of our product specs used to be a nightmare. This tool highlights the deleted rows clearly so nothing gets lost.",
    img: "/images/profile_pic/profile_pic_12.webp",
  },
  {
    name: "Laura M.",
    title: "Freelance Bookkeeper",
    body: "Efficient, private, and free. It's become an essential part of my end-of-month reconciliation process.",
    img: "/images/profile_pic/profile_pic_13.webp",
  },
  {
    name: "Emily T.",
    title: "HR Specialist",
    body: "Simple, fast, and does exactly what it says. No complex setup, just upload and see the red and green highlights. Perfect for non-techies like me.",
    img: "/images/profile_pic/profile_pic_14.webp",
  },
  {
    name: "Daniel Y.",
    title: "E-commerce Manager",
    body: "Most tools fail when rows are sorted differently. This tool's ability to match rows by ID (Key) saved me from manually sorting 10,000 lines.",
    img: "/images/profile_pic/profile_pic_15.webp",
  },
  {
    name: "Mark S.",
    title: "Retail Owner",
    body: "I had two price lists with different item orders. The Key-Value comparison aligned them perfectly and showed me exactly which prices increased.",
    img: "/images/profile_pic/profile_pic_16.webp",
  },
  {
    name: "Natalie V.",
    title: "Operations Coordinator",
    body: "Whether I need a quick visual check or a deep column analysis, this site covers all my comparison needs. It's my bookmark for everything Excel.",
    img: "/images/profile_pic/profile_pic_17.webp",
  },
  {
    name: "Jason B.",
    title: "Logistics Coordinator",
    body: "Fastest way to clean up data. I use it to compare my master list with the vendor's list to see what's missing. Works like a charm.",
    img: "/images/profile_pic/profile_pic_18.webp",
  },
]

// Function to get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2) // Maximum 2 initials
}

// Split reviews into 3 columns
const column1 = reviews.slice(0, 6)
const column2 = reviews.slice(6, 12)
const column3 = reviews.slice(12, 18)

const ReviewCard = ({
  img,
  name,
  title,
  body,
}: {
  img: string
  name: string
  title: string
  body: string
}) => {
  const initials = getInitials(name)

  return (
    <figure
      className={cn(
        "relative h-full w-full max-w-xs cursor-pointer overflow-hidden rounded-xl border p-4 flex-shrink-0",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
        "transition-all duration-300 hover:scale-105"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center text-white text-sm font-semibold" style={{ background: 'linear-gradient(to bottom right, #20A884, #10b981)' }}>
          {initials}
        </div>
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{title}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  )
}

export default function UserReviews() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          No More Spreadsheet Headaches
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
          See how professionals save hours and eliminate manual work
        </p>
      </div>

      <div className="relative flex h-[600px] w-full max-w-7xl mx-auto flex-row items-center justify-center gap-1 overflow-hidden p-2">
        {/* Column 1 */}
        <div className="h-[500px] flex-1 max-w-sm overflow-hidden">
          <Marquee pauseOnHover vertical className="[--duration:18s]" repeat={2}>
            {column1.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
        </div>

        {/* Column 2 */}
        <div className="h-[500px] flex-1 max-w-sm overflow-hidden">
          <Marquee pauseOnHover vertical verticalReverse className="[--duration:25s]" repeat={2}>
            {column2.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
        </div>

        {/* Column 3 */}
        <div className="h-[500px] flex-1 max-w-sm overflow-hidden">
          <Marquee pauseOnHover vertical className="[--duration:22s]" repeat={2}>
            {column3.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </Marquee>
        </div>

        {/* Gradient fade at top and bottom */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-white via-white to-transparent dark:from-gray-50 dark:via-gray-50 dark:to-transparent"></div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-50 dark:via-gray-50 dark:to-transparent"></div>
      </div>
    </section>
  )
}