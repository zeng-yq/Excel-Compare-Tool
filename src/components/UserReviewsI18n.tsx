"use client"

import Marquee from "@/components/ui/marquee"
import { cn } from "@/lib/utils"

interface Review {
  name: string
  title: string
  body: string
  img: string
}

interface UserReviewsProps {
  dictionary: any
}

const reviews = [
  {
    name: "David C.",
    title: "财务总监",
    body: "终于有一个不用安装的工具了！公司 IT 政策很严，能在浏览器里安全运行，对我来说简直是救星。",
    img: "/images/profile_pic/profile_pic_1.webp",
  },
  {
    name: "Sarah Jenkins",
    title: "行政经理",
    body: "我以前都是把两张表打印出来，拿着荧光笔一行行对。这个工具拯救了我的视力和理智。太神了。",
    img: "/images/profile_pic/profile_pic_2.webp",
  },
  {
    name: "Chris P.",
    title: "市场总监",
    body: "我本来是冲着全文对比来的，结果发现'列对比 (Column Comparison)'功能简直是检查邮件列表查重的隐藏神器。",
    img: "/images/profile_pic/profile_pic_3.webp",
  },
  {
    name: "Sophia L.",
    title: "CRM 专员",
    body: "找不同很重要，但确认哪些数据一致也同样重要。交集工具帮我毫不费力地合并了两份客户名单。",
    img: "/images/profile_pic/profile_pic_4.webp",
  },
  {
    name: "Mike Ross",
    title: "供应链分析师",
    body: "左右同步滚动的体验丝般顺滑，感觉就像在看同一张表。几秒钟就发现了一个隐藏的价格变动。",
    img: "/images/profile_pic/profile_pic_5.webp",
  },
  {
    name: "Brian K.",
    title: "销售运营",
    body: "我试过写公式来找差异，但总是搞砸。这种可视化高亮显示要直观太多了，强烈推荐。",
    img: "/images/profile_pic/profile_pic_6.webp",
  },
  {
    name: "Jessica L.",
    title: "仓库经理",
    body: "处理大文件的能力让我惊讶。我传了一个 5,000 行的库存表，对比结果瞬间就出来了。性能超赞。",
    img: "/images/profile_pic/profile_pic_7.webp",
  },
  {
    name: "Robert H.",
    title: "注册会计师",
    body: "作为会计，数据隐私是我的底线。知道文件只在本地处理、从不上传到服务器，让我能放心地使用这个工具。",
    img: "/images/profile_pic/profile_pic_8.webp",
  },
  {
    name: "Amanda G.",
    title: "业务分析师",
    body: "再也不用担心 VLOOKUP 报错了！以前我为了对比月度报告，得花好几个小时调试公式，现在只需拖拽一下就搞定。",
    img: "/images/profile_pic/profile_pic_9.webp",
  },
  {
    name: "Tom W.",
    title: "项目主管",
    body: "'无需公式'的承诺是真的。我不再需要成为 Excel 大神，也能轻松发现季度预算中的出入。",
    img: "/images/profile_pic/profile_pic_10.webp",
  },
  {
    name: "Rachel F.",
    title: "数据录入员",
    body: "我喜欢它能忽略格式变化，只关注实际数据。其他工具常因为字体加粗就报错，但这个工具很聪明。",
    img: "/images/profile_pic/profile_pic_11.webp",
  },
  {
    name: "Kevin D.",
    title: "产品经理",
    body: "以前对比产品规格书的 V1 和 V2 版本简直是噩梦。这个工具清晰地高亮了被删除的行，确保没有任何信息遗漏。",
    img: "/images/profile_pic/profile_pic_12.webp",
  },
  {
    name: "Laura M.",
    title: "兼职记账员",
    body: "高效、私密且免费。它已经成为我月底对账流程中不可或缺的一部分。",
    img: "/images/profile_pic/profile_pic_13.webp",
  },
  {
    name: "Emily T.",
    title: "HR 专员",
    body: "简单、快速，说到做到。没有复杂的设置，上传后直接看红绿高亮。特别适合像我这种不懂技术的人。",
    img: "/images/profile_pic/profile_pic_14.webp",
  },
  {
    name: "Daniel Y.",
    title: "电商经理",
    body: "遇到行顺序被打乱时，大多数工具都歇菜了。这个工具的'ID 匹配 (Key Match)'功能救了我，不用再去手动重新排序那一万行数据了。",
    img: "/images/profile_pic/profile_pic_15.webp",
  },
  {
    name: "Mark S.",
    title: "零售店主",
    body: "我有两份商品顺序完全不同的价目表。Key-Value 对比功能把它们完美对齐了，还能准确显示哪些价格涨了。",
    img: "/images/profile_pic/profile_pic_16.webp",
  },
  {
    name: "Natalie V.",
    title: "运营协调员",
    body: "无论是快速扫一眼，还是做深度的列数据分析，这个网站都能满足。它是我处理所有 Excel 对比需求的首选收藏。",
    img: "/images/profile_pic/profile_pic_17.webp",
  },
  {
    name: "Jason B.",
    title: "物流协调员",
    body: "清洗数据最快的方法。我用它来对比我的总表和供应商的清单，看缺了什么，屡试不爽。",
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

export default function UserReviewsI18n({ dictionary }: UserReviewsProps) {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          {dictionary.reviews?.title || "No More Spreadsheet Headaches"}
        </h2>
        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
          {dictionary.reviews?.subtitle || "Trusted by thousands of users worldwide"}
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