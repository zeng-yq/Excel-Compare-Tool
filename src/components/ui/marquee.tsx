"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps {
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children?: React.ReactNode
  vertical?: boolean
  verticalReverse?: boolean
  repeat?: number
  [key: string]: any
}

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  verticalReverse = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  const [duration, setDuration] = useState(20)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current
      const scrollElement = container.firstElementChild as HTMLElement

      if (scrollElement) {
        const elementWidth = scrollElement.scrollWidth
        const containerWidth = container.clientWidth

        if (elementWidth > containerWidth) {
          const scrollDistance = elementWidth - containerWidth
          const calculatedDuration = Math.max(10, scrollDistance / 50)
          setDuration(calculatedDuration)
        }
      }
    }
  }, [children])

  return (
    <div
      ref={containerRef}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
      {...props}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical && !verticalReverse,
              "animate-marquee-vertical-reverse flex-col": vertical && verticalReverse,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse && !vertical,
            })}
            style={{
              animationDuration: `${duration}s`,
            }}
          >
            {children}
          </div>
        ))}
    </div>
  )
}